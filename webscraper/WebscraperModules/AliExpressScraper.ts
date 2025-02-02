import puppeteer, { Cookie, ElementHandle, Page} from "puppeteer";
import WebscraperBase from "../Webscraper";
import { Webscraper } from "../WebScraperTypes";


export default class AliExpressScraper extends WebscraperBase{
    public async Login() : Promise<Cookie[]>{
        const browser = await puppeteer.launch({
            headless : false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const [page] = await browser.pages();

        await this.removeWebdriverPropertyFromPage(page);

        await page.setViewport(null);
        await page.goto("https://aliexpress.com");


       do{
            await this.HidePopUps(page);

            await this.OpenAccountDetails(page,0);

            const signInButton = await page.$('[class*="my-account--signin"]');
            const accountNameLabel = await page.$('[class*="my-account--name"]')

            if(accountNameLabel == null && signInButton != null){
                await signInButton?.click();
                console.log("Waiting for user to log in");    
                await page.waitForNavigation({
                    timeout : 0
                });
            }
            else if(accountNameLabel != null){
                break
            }
        }while(true);
 
        const cookies = await browser.cookies()

        await browser.close();

        return cookies;
    }
    
    public async AreCookiesValid(cookies : Cookie[]) : Promise<boolean>{
        const browser = await puppeteer.launch({
            headless : true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        browser.setCookie(...cookies);

        const [page] = await browser.pages();

        await this.removeWebdriverPropertyFromPage(page);

        await page.setViewport(null);
        await page.goto("https://aliexpress.com");

        await page.waitForNetworkIdle();
        await this.HidePopUps(page);

        try{
            await this.OpenAccountDetails(page,0);

            const accountName : string = await page.$eval('[class*="my-account--name"]',(el : any) => el.innerText)


            await browser.close();

            return accountName != null && accountName.length != 0;
        }
        catch(e){
            await browser.close();

            return false;
        }
    }
    
    
    public async GetOrders(cookies : Cookie[]) : Promise<Webscraper.Order[]>{

        if(!(await this.AreCookiesValid(cookies))){
            throw new Error("Hibás bejelentkezés!");
        }

        const browser = await puppeteer.launch({
            headless : false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-blink-features=AutomationControlled'
            ]
        });
    
        browser.setCookie(...cookies);
    
        const [page] = await browser.pages();
    
        this.removeWebdriverPropertyFromPage(page);
    
    
        await page.setViewport(null);
        await page.goto("https://www.aliexpress.com/p/order/index.html");

    
        let loadMoreButton : ElementHandle | null;
        do{
            await page.waitForNetworkIdle();
            loadMoreButton = await page.$('[class*="order-more"] button[class*="comet-btn"]');
            if(loadMoreButton != null){
                loadMoreButton.click();
            }
        }
        while(loadMoreButton != null);
    
        const orderElements = await page.$$('.order-item');

        const orders = await Promise.all(orderElements.map(async orderElement => {

            const orderInfoHeaderHTML = await orderElement.$eval('.order-item-header-right-info', x => x.innerHTML);
    
            let orderDateStr = orderInfoHeaderHTML.match(/Order date:\s*([A-Za-z]{3}\s\d{1,2},\s\d{4})/)?.at(1);
            let orderID =orderInfoHeaderHTML.match(/Order ID:\s*(\d+)/)?.at(1);
    
            const orderStatusText = await orderElement.$eval('.order-item-header-status-text',x => x.innerHTML)
    
            const order : Webscraper.Order = {
                ID : orderID || "",
                orderDate : orderDateStr? new Date(orderDateStr) : null,
                status : orderStatusText,
                items : []
            };
    
            const orderHTML = await orderElement.evaluate(x => x.innerHTML);
    
    
            const itemName = await orderElement.$eval('.order-item-content-info-name span',x => x.title)
            const itemLink = orderHTML.match(/(www\.aliexpress\.com\/item\/\d+\.html)/)?.[1] || "";
            const variantName = orderHTML.match(/<div[^>]*class="order-item-content-info-sku"[^>]*>(.*?)<\/div>/)?.[1] || ""
    
    
            const quantityText = await orderElement.$eval('.order-item-content-info-number-quantity',(x : any) => x.innerText);
            const quantity = Number.parseInt(quantityText.match(/(?<=x)\d+/)?.[0]);
    
            const currencyInfoText = await orderElement.$eval('.order-item-content-info-number',(x : any) => x.innerText);
            const currency = currencyInfoText.match(/^\D+/)?.[0] || "";
            const price = Number.parseFloat(currencyInfoText.match(/\D*([\d,.]*)x.*/)?.[1].replace(",",""));

            const variant : Webscraper.ItemVariant = {
                name : variantName,
                price : {
                    amount : Number.isNaN(price) ? 0 : price,
                    currency : currency
                }
            }
    
            const items : Webscraper.OrderedItem[] = [
                {
                    name : itemName,
                    variants : [variant],
                    amount : Number.isNaN(quantity) ? 0 : quantity,
                    link : itemLink,
                }
            ];
    
            order.items = items;
    
            return order;
        }));


        await browser.close();

        return orders;
    }
    
    public async GetOrderDetails(cookies : Cookie[], orderID : string) : Promise<Webscraper.Order>{
    
        if(!(await this.AreCookiesValid(cookies))){
            throw new Error("Hibás bejelentkezés!");
        }


        const browser = await puppeteer.launch({
            headless : false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-blink-features=AutomationControlled'
            ]
        });
    
        browser.setCookie(...cookies);
    
        const [page] = await browser.pages();
    
        this.removeWebdriverPropertyFromPage(page);
    
    
        await page.setViewport(null);
        await page.goto(`https://www.aliexpress.com/p/order/detail.html?orderId=${orderID}`);

        await page.waitForNetworkIdle();

        
        const orderInfoHeaderHTML = await page.$eval('div.order-detail-order-info', x => x.innerText);
    
        let orderDateStr = orderInfoHeaderHTML.match(/Order placed on:\s*([A-Za-z]{3}\s\d{1,2},\s\d{4})/)?.at(0);
        let orderIDStr = orderInfoHeaderHTML.match(/Order ID:\s*(\d+)/)?.at(1);
    
        const orderStatusText = await page.$eval('.order-status-content .order-block-title',x => x.innerHTML)
    
        const order : Webscraper.Order = {
            ID : orderIDStr || "",
            orderDate : orderDateStr? new Date(orderDateStr) : null,
            status : orderStatusText,
            items : []
        };
    
        const orderHTML = await page.$eval('#root',x => x.innerHTML);

        const itemName = await page.$eval('.order-detail-item-content-info a',x => x.innerText)
        const itemLink = orderHTML.match(/(www\.aliexpress\.com\/item\/\d+\.html)/)?.[1] || "";
        const variantName = await page.$eval('div.item-sku-attr',x => x.innerText).catch(err =>  "");
    
    
        const quantityText = await page.$eval('.order-detail-item-content-info .item-price-quantity',(x : any) => x.innerText);
        const quantity = Number.parseInt(quantityText.match(/(?<=x)\d+/)?.[0]);
    
        const currencyInfoText = await page.$eval('.item-price',(x : any) => x.innerText);
        const currency = currencyInfoText.match(/^\D+/)?.[0] || "";
        const price = Number.parseFloat(currencyInfoText.match(/\D*([\d,.]*)x.*/)?.[1].replace(",",""));
    
        const variant : Webscraper.ItemVariant = {
            name : variantName,
            price : {
                amount : Number.isNaN(price) ? 0 : price,
                currency : currency
            }
        }

        const items : Webscraper.OrderedItem[] = [
            {
                name : itemName,
                variants : [variant],
                amount : Number.isNaN(quantity) ? 0 : quantity,
                link : itemLink,
            }
        ];
    
        order.items = items;

        return order;
    }
    
    // Multiple options?
    public async GetItemDetails(itemLink : string, getFiles? : boolean, getImages? : boolean, cookies? : Cookie[]) : Promise<Webscraper.ItemDetails>{
        const browser = await puppeteer.launch({
            headless : false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const items : Webscraper.ItemDetails[]  = [];

        if(cookies != null){
            browser.setCookie(...cookies);
        }

        const [page] = await browser.pages();
    
        this.removeWebdriverPropertyFromPage(page);
    
    
        await page.setViewport(null);
        await page.goto(itemLink);

        await page.waitForNetworkIdle();

        const name = await page.$eval("[class*='title--wrap--'] h1",x => x.innerText);
        const images : File[] = [];


        const item : Webscraper.ItemDetails = {
            name : name,
            variants : [],
            link : itemLink,
            images : images,
            files : [],
            description : "",
            longDescription : "",
        }

        if(getImages){
            const imageLinks = await page.$$eval("[class*='slider--slider'] img", img => img.map(x => x.src));

            for(let link of imageLinks){
                images.push(await this.GetFileFromURL(link));
            }
        }

        const variantSelectors = await page.$$("[class*='sku-item--skus'] div");

        if(variantSelectors == null || variantSelectors.length == 0){
            const priceText = await page.$eval("span[class*='price--currentPriceText']",x => x.innerText);
            const priceCurrency = priceText.match(/\D*/)?.[0];
            const priceAmount = Number.parseFloat(priceText.match(/\D*([\d,.]*)/)?.[1].replace(",","") || "");

            const variant : Webscraper.ItemVariant = {
                name : item.name,
                price : {
                    amount : priceAmount,
                    currency : priceCurrency || ""
                }
            }

            item.variants.push(variant);
        }
        else{
            for(let variantSelector of variantSelectors){
                await variantSelector.click();

                await page.waitForNetworkIdle();

                const variantImgLink = await variantSelector.$eval('img',x => x.src);
                
                const priceText = await page.$eval("span[class*='price--currentPriceText']",x => x.innerText);
                const priceCurrency = priceText.match(/\D*/)?.[0];
                const priceAmount = Number.parseFloat(priceText.match(/\D*([\d,.]*)/)?.[1].replace(",","") || "");
                const variantName = await page.$eval("[class*='sku-item--title'] span span",x => x.innerText);

                const variant : Webscraper.ItemVariant = {
                    name : variantName,
                    price : {
                        amount : priceAmount,
                        currency : priceCurrency || ""
                    }
                }

                item.variants.push(variant);
            }
        }

        return item;
    }

    public async GetItemsInCart(cookies : Cookie[]): Promise<Webscraper.Order> {
        const browser = await puppeteer.launch({
            headless : false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        if(cookies != null){
            browser.setCookie(...cookies);
        }

        const [page] = await browser.pages();
    
        this.removeWebdriverPropertyFromPage(page);
    
    
        await page.setViewport(null);
        await page.goto("https://www.aliexpress.com/p/shoppingcart/index.html");

        try{
            await page.waitForNetworkIdle({timeout : 5_000});
        }
        catch(e){}
        

        const order : Webscraper.Order = {
            ID : "",
            orderDate : null,
            status : "In cart",
            items : []
        };


        const itemNodes = await page.$$(".cart-product");

        for (const itemNode of itemNodes){

            let itemName = "";
            try{
                itemName = await itemNode.$eval("a.cart-product-name-title",x => x.innerText);
            }
            catch(e){}

            let link = ""
            try{
                link =(await itemNode.$eval("a.cart-product-name-title", x => x.href)).match(/^[^?]+/)?.[0] || "";
            }
            catch(e){}
            
            let variantName = "";
            try{
                variantName = await itemNode.$eval("div.cart-product-sku",x => x.innerText) || "";
            }
            catch(e){}

            let orderedAmount = 1
            try{
                orderedAmount = Number.parseInt(await itemNode.$eval(".cart-product-block-action-wrapper input",x => x.value));
            }
            catch(e){}


            let currency = "";
            let price = 0;
            try{
                const priceText = await itemNode.$eval("div.cart-product-price-buynow",x => x.innerText);

                currency = priceText.match(/^\D+/)?.[0] || "";
                price = Number.parseFloat(priceText.match(/\D*([\d,.]*)/)?.[1].replace(",","") || ""); 
            }
            catch(e){}


            const variant : Webscraper.ItemVariant = {
                name : variantName,
                price : {
                    currency : currency,
                    amount : isNaN(price)?0:price
                }
            }

            const item : Webscraper.OrderedItem = {
                name : itemName,
                variants : [variant],
                link : link,
                amount : isNaN(orderedAmount)?1:orderedAmount,
            };

            order.items.push(item);
        }


        return order;
    }


    protected async OpenAccountDetails(page : Page, timeout = 0){

        let accountDetailsButton = (await page.waitForSelector('[class*="my-account--menuItem"],[class*="my-account--text--"]',{
            timeout : timeout
        }));
    
        accountDetailsButton?.hover();

        await page.waitForSelector('[class*="my-account--popup"]')
    }

    protected async HidePopUps(page : Page){
        page.evaluate(() => {
            const divs = Array.from(document.querySelectorAll('div'));

            divs.forEach(div => {
                const zIndex = Number.parseInt(window.getComputedStyle(div).zIndex);
                if (!isNaN(zIndex) && zIndex > 1000) {
                  div.style.display = 'none';
                }
              });
        })
    }
}