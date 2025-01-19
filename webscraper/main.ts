import puppeteer, {ElementHandle} from 'puppeteer'
import fs from 'fs'


async function login() {
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

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });


    await page.setViewport(null);
    await page.goto("https://aliexpress.com");


    let username = null

    while(username == null){
        await page.waitForSelector('[class^="my-account--text"]',{
            timeout : 0
        });

        await page.hover('[class^="my-account"]');

        console.log("Opening user panel");

        let accountInfoLabel = await page.waitForSelector('[class^="my-account--name"]',{timeout : 3_000}).catch(() => console.log("User not logged in"));

        if(accountInfoLabel == null){
            await page.hover('[class^="my-account"]');
            const signInButton = await page.waitForSelector('button[class^="my-account--signin"]')
            await signInButton?.click();
            console.log("Waiting for user to log in");    
            await page.waitForNavigation({
                timeout : 0
            });
        }
        else{
            username = await accountInfoLabel?.evaluate((el : any) => el.innerText);
        }
    }

    console.log('Logged in as: ' + username);

    const cookies = await browser.cookies();

    fs.writeFileSync('cookies/aliexpress.json',JSON.stringify(cookies));

    browser.close();
}

async function getOrders() {
    const cookiesString = fs.readFileSync('cookies/aliexpress.json', 'utf-8');
    const cookies = JSON.parse(cookiesString);

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

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });


    await page.setViewport(null);
    await page.goto("https://www.aliexpress.com/p/order/index.html");

    let loadMoreButton : ElementHandle | null;
    do{
        await page.waitForNetworkIdle();
        console.log("loading more items");
        loadMoreButton = await page.$('[class^="order-more"] [class^="comet-btn"]');
        if(loadMoreButton != null){
            loadMoreButton.click();
        }
    }
    while(loadMoreButton != null);


    const orderElements = await page.$$('[class="order-item"]');


    const orders = await Promise.all(orderElements.map(async orderElement => {

        const orderInfoHeaderHTML = await orderElement.$eval('[class="order-item-header-right-info"]', x => x.innerHTML);

        let orderDateStr = orderInfoHeaderHTML.match(/Order date:\s*([A-Za-z]{3}\s\d{1,2},\s\d{4})/)?.at(1);
        let orderIDStr =Number.parseInt(orderInfoHeaderHTML.match(/Order ID:\s*(\d+)/)?.at(1) || "");

        const orderStatusText = await orderElement.$eval('[class="order-item-header-status-text"',x => x.innerHTML)

        const order : WebscraperOrder = {
            ID : Number.isNaN(orderIDStr) ? null : orderIDStr,
            orderDate : orderDateStr? new Date(orderDateStr) : null,
            status : orderStatusText,
            items : []
        };

        const orderHTML = await orderElement.evaluate(x => x.innerHTML);


        const itemName = await orderElement.$eval('[class="order-item-content-info-name"] span',x => x.title)
        const itemLink = orderHTML.match(/(www\.aliexpress\.com\/item\/\d+\.html)/)?.[1] || "";
        const variant = orderHTML.match(/<div[^>]*class="order-item-content-info-sku"[^>]*>(.*?)<\/div>/)?.[1] || ""


        const quantityText = await orderElement.$eval('[class="order-item-content-info-number-quantity"]',(x : any) => x.innerText);
        const quantity = Number.parseInt(quantityText.match(/(?<=x)\d+/)?.[0]);

        const currencyInfoText = await orderElement.$eval('[class="order-item-content-info-number"]',(x : any) => x.innerText);
        const currency = currencyInfoText.match(/^\D+/)?.[0] || "";
        const price = Number.parseFloat(currencyInfoText.match(/\D*([\d,.]*)x.*/)?.[1].replace(",",""));

        const items : OrderItem[] = [
            {
                name : itemName,
                variant : variant,
                priceCurrency : currency,
                priceAmount : Number.isNaN(price) ? null : price,
                orderedAmount : Number.isNaN(quantity) ? null : quantity,
                link : itemLink,
            }
        ];

        order.items = items;

        return order;
    }));
    
    return orders;
}

/*
login().then(async () => {
    console.log(await getOrders());
});
*/

getOrders();




