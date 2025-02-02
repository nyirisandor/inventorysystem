import puppeteer, { Browser, Cookie, ElementHandle, Page} from "puppeteer";
import WebscraperBase from "../Webscraper";
import { Webscraper } from "../WebScraperTypes";
import moment from 'moment'

export default class HeStoreScraper extends WebscraperBase {

    public IncludeVAT : boolean = true;
    public Currency : "HUF"|"EUR"|"GBP"|"USD" = "HUF";
    public Language : "HU"|"EN"|"DE" = "HU";


    public async Login(): Promise<Cookie[]> {
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
        await page.goto("https://www.hestore.hu/login.php");

        while(await page.$eval("a[href='/profile_home.php']",x => x.innerText).then(x => x).catch(x => null) == null){
            await page.waitForNavigation({timeout : 0});
        }

        const cookies = await browser.cookies()

        await browser.close();

        return cookies;
    }
    public async AreCookiesValid(cookies: Cookie[]): Promise<boolean> {
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

        await page.goto("https://www.hestore.hu/");

        await page.waitForNetworkIdle();

        const res = await page.$eval("a[href='/profile_home.php']",x => x.innerText)
        .then(x => true)
        .catch(x => false);

        await browser.close();

        return res;
    }
    public async GetOrders(cookies: Cookie[], from? : Date, to? : Date): Promise<Webscraper.Order[]> {

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
    
        await this.removeWebdriverPropertyFromPage(page);
    
        await page.setViewport(null);

        await this.setPageSettings(page,this.IncludeVAT,this.Currency,this.Language);

        if(from == null){
            from = new Date(2020,0,1);
        }

        if(to == null){
            to = new Date();
        }

        await page.goto(`https://www.hestore.hu/profile_orders.php?from=${moment(from).format('YYYY.MM.DD')}&to=${moment(to).format('YYYY.MM.DD')}`);

        await page.waitForNetworkIdle();

        const orderLinks = await page.$$eval("#ordtbl tbody tr td:first-of-type a",els => els.map(x => x.href));

        const orders : Webscraper.Order[] = [];

        for(const link of orderLinks){
            orders.push(await this.getOrderDetailsFromLink(cookies,link));
        }

        return orders
    }
    public async GetOrderDetails(cookies: Cookie[], orderID: string,from? : Date, to? : Date): Promise<Webscraper.Order> {
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
    
        await browser.setCookie(...cookies);
    
        const [page] = await browser.pages();
    
        await this.removeWebdriverPropertyFromPage(page);
    
        await page.setViewport(null);

        await this.setPageSettings(page,this.IncludeVAT,this.Currency,this.Language);

        if(from == null){
            from = new Date(2020,0,1);
        }

        if(to == null){
            to = new Date();
        }

        await page.goto(`https://www.hestore.hu/profile_orders.php?from=${moment(from).format('YYYY.MM.DD')}&to=${moment(to).format('YYYY.MM.DD')}&q=${encodeURI(orderID)}`);

        await page.waitForNetworkIdle();

        const orderLink = await page.$eval("#ordtbl tbody tr td:first-of-type a",x => x.href);

        return await this.getOrderDetailsFromLink(cookies,orderLink);
    }
    public async GetItemsInCart(cookies: Cookie[]): Promise<Webscraper.Order> {
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
    
        await browser.setCookie(...cookies);
    
        const [page] = await browser.pages();
    
        await this.removeWebdriverPropertyFromPage(page);
    
        await page.setViewport(null);

        await this.setPageSettings(page,this.IncludeVAT,this.Currency,this.Language);

        await page.goto("https://www.hestore.hu/basket.php");


        const order : Webscraper.Order = {
            orderDate : null,
            ID : "",
            status : "Basket",
            items : []
        }

        const itemRows = await page.$$(".list-basket tbody tr[style]");

        for (const itemRow of itemRows){
            let link = "";
            try{
                link = await itemRow.$eval("a",x => x.href);
            }catch(e){}
           
            let variantName = "";
            try{
                variantName = await itemRow.$eval("td:nth-of-type(3) a",x => x.innerText);
            }catch(e){}

            let itemName = "";
            try{
                itemName = await itemRow.$eval("td:nth-of-type(3) span",x => x.innerText);
            }catch(e){}

            let orderedAmount = 1
            try{
                const orderedAmountStr = await itemRow.$eval("td:nth-of-type(5) input",x => x.value);
                const parsed = Number.parseFloat(orderedAmountStr);
                if(!Number.isNaN(parsed)){
                    orderedAmount = parsed;
                }
            }catch(e){}

            let priceAmount = 0;
            let priceCurrency = "";
            try{
                let priceStr = await itemRow.$eval("td:nth-of-type(4)",x => x.innerText);

                let amountStr = priceStr.match(/([\d\s]+)/)?.[0] || "";
                let amount = Number.parseFloat(amountStr.replaceAll(" ","").replaceAll(",","."));
                if(!Number.isNaN(amount)){
                    priceAmount = amount / orderedAmount;
                }

                priceCurrency = priceStr.match(/\S+\s*$/)?.[0] || "";
            }catch(e){}

            const itemVariant : Webscraper.ItemVariant = {
                name : variantName,
                price : {
                    amount : priceAmount,
                    currency : priceCurrency
                }
            }

            const item : Webscraper.OrderedItem = {
                name : itemName,
                variants : [itemVariant],
                link : link,
                amount : orderedAmount,
            }

            order.items.push(item);
        }

        return order;
        
    }
    public async GetItemDetails(itemLink: string, getFiles?: boolean, getImages?: boolean): Promise<Webscraper.ItemDetails> {
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

        await this.setPageSettings(page,this.IncludeVAT,this.Currency,this.Language);

        await page.goto(itemLink);

        await page.waitForNetworkIdle();

        
        let itemName = "";
        try{
            itemName = await page.$eval(".prod-title h1",x => x.innerText);
            itemName = itemName.replaceAll("/"," ").replaceAll(".",",");
        }catch(e){}

        let description = "";
        try{
            description = await page.$eval(".prod-title span[itemprop='description']",x => x.innerText);
        }catch(e){}


        let longDescription = "";
        try{
            longDescription += await page.$eval("div.prod-desc",x => x.innerHTML);
        }catch(e){}
        try{
            longDescription += await page.$eval("div.prod-pars",x => x.innerHTML);
        }catch(e){}


        const item : Webscraper.ItemDetails = {
            name : itemName,
            variants : [],
            link : itemLink,
            images : [],
            files : [],
            description : description,
            longDescription : longDescription,
        };


        const priceVariants = await page.$$("table.prod-pricetbl tbody tr");
        for(let priceVariantRow of priceVariants){
            let variantName = "";
            try{
                variantName = await priceVariantRow.$eval("th",x => x.innerText);
            }catch(e){}

            let priceAmount = 0;
            let priceCurrency = "";
            try{
                let priceStr = "";
                try{
                    priceStr = await priceVariantRow.$eval("td b",x => x.innerText);
                }
                catch{
                    priceStr = await priceVariantRow.$eval("td",x => x.innerText);
                }

                let amountStr = priceStr.match(/([\d\s]+)/)?.[0] || "";
                let amount = Number.parseFloat(amountStr.replaceAll(" ","").replaceAll(",","."));
                if(!Number.isNaN(amount)){
                    priceAmount = amount;
                }

                priceCurrency = priceStr.match(/\S+\s*$/)?.[0] || "";
            }catch(e){}


            const variant : Webscraper.ItemVariant = {
                name : variantName,
                price : {
                    amount : priceAmount,
                    currency : priceCurrency
                }
            };

            item.variants.push(variant);
        }

        if(getFiles){
            try{
                const fileLinks = await page.$$(".prod-files a");
                
                for(let fileLink of fileLinks){
                    const linkText = await fileLink.evaluate(x => x.innerText);

                    const results = linkText.match(/(\w+),\s*(\w+)\s*\((\w+),\s*\d+\s*/);

                    let fileName = itemName;


                    const usage = results?.[1];
                    if(usage != null && usage.length > 0){
                        fileName += ` ${usage}`;
                    }

                    const lang = results?.[2];
                    if(lang != null && lang.length > 0){
                        fileName += ` (${lang})`;
                    }

                    const extension = results?.[3] || ".";
                    fileName += `.${extension}`;

                    const file = await this.GetFileFromURL(await fileLink.evaluate(x => x.href),fileName);

                    item.files.push(file);
                }
            }catch(e){}
        }


        if(getImages){
            try{
                const imgLink = await page.$eval("img#prodimg",x => x.src);
                
                const file = await this.GetFileFromURL(imgLink);

                item.images.push(file);
            }catch(e){}
        }

        await browser.close();

        return item;
    }

    protected async getOrderDetailsFromLink(cookies : Cookie[], orderLink: string) : Promise<Webscraper.Order>{
        const browser = await puppeteer.launch({
            headless : true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-blink-features=AutomationControlled'
            ]
        });
    
        await browser.setCookie(...cookies);
    
        const [page] = await browser.pages();
    
        await this.removeWebdriverPropertyFromPage(page);
    
        await page.setViewport(null);

        await page.goto(orderLink);

        await page.waitForNetworkIdle();

        const orderHeaderString = await page.$eval(".mcontent div.box:nth-of-type(1)",x => x.innerText);

        const orderDateStr = orderHeaderString.match(/\b\d{4}\.\d{2}\.\d{2}\s*\d{1,2}:\d{1,2}\b/)?.[0] || "";

        const orderDate = moment.utc(orderDateStr,'YYYY.MM.DD hh:mm').toDate();
        
        const orderID = orderHeaderString.match(/\bH\d{2}\/\d+\b/)?.[0] || "";

        const orderStatus = orderHeaderString.split("\n").slice(-1)[0].match(/^.*:\s*(.*)$/)?.[1] || "";

        const order : Webscraper.Order = {
            orderDate : isNaN(orderDate.getTime())?null : orderDate,
            ID : orderID,
            status : orderStatus,
            items : []
        };

        const itemRows = await page.$$("#ordptbl tbody tr[class]");

        for(const itemRow of itemRows){

            let link = "";
            try{
                link = await itemRow.$eval("a",x => x.href);
            }catch(e){}
           
            let variantName = "";
            try{
                variantName = await itemRow.$eval("td:nth-of-type(3)",x => x.innerText);
            }catch(e){}

            let orderedAmount = 1
            try{
                const orderedAmountStr = await itemRow.$eval("td:nth-of-type(4)",x => x.innerText);
                const parsed = Number.parseFloat(orderedAmountStr);
                if(!Number.isNaN(parsed)){
                    orderedAmount = parsed;
                }
            }catch(e){}

            let priceAmount = 0;
            let priceCurrency = "";
            try{
                let priceStr = await itemRow.$eval("td:nth-of-type(8)",x => x.innerText);

                let amountStr = priceStr.match(/([\d\s]+)/)?.[0] || "";
                let amount = Number.parseFloat(amountStr.replaceAll(" ","").replaceAll(",","."));
                if(!Number.isNaN(amount)){
                    priceAmount = amount / orderedAmount;
                }

                priceCurrency = priceStr.match(/\S+\s*$/)?.[0] || "";
            }catch(e){}

            const itemVariant : Webscraper.ItemVariant = {
                name : variantName,
                price : {
                    amount : priceAmount,
                    currency : priceCurrency
                }
            }

            const item : Webscraper.OrderedItem = {
                name : variantName,
                variants : [itemVariant],
                link : link,
                amount : orderedAmount,
            }

            if(item.link.length != 0)
                order.items.push(item);
        }


        await browser.close();

        return order;
    }

    protected async setPageSettings(page : Page, includeVat? : boolean, currency? : "HUF"|"EUR"|"GBP"|"USD", language? : "HU"|"EN"|"DE"){

        let url = "https://www.hestore.hu/index.php?";

        if(includeVat != null){
            url += `ng=${includeVat?"g":"n"}&`
        }

        if(currency != null){
            url+= `currency=${currency}&`
        }

        if(language != null){
            url += `lang=${language}`
        }

        await page.goto(url);

        await page.waitForNetworkIdle();

        await page.goBack();
    }
}