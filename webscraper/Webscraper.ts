import { Browser, Cookie, Page } from "puppeteer";
import { Webscraper } from "./WebScraperTypes";

export default abstract class WebScraperBase{

    public IsHeadless = false;
    public BrowserArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--disable-blink-features=AutomationControlled'
    ];

    public abstract Login() : Promise<Cookie[]>;

    public abstract AreCookiesValid(cookies : Cookie[]) : Promise<boolean>;



    public abstract GetOrders(cookies : Cookie[]) : Promise<Webscraper.Order[]>;

    public abstract GetOrderDetails(cookies : Cookie[], orderID : string) : Promise<Webscraper.Order>

    public abstract GetItemsInCart(cookies : Cookie[]) : Promise<Webscraper.Order>;

    public abstract GetItemDetails(itemLink : string, getFiles? : boolean, getImages? : boolean) : Promise<Webscraper.ItemDetails[]>;


    //Used to make detection harder
    protected async removeWebdriverPropertyFromPage(page : Page){
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });
    }
}