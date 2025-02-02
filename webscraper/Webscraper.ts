import { Cookie, Page } from "puppeteer";
import { Webscraper } from "./WebScraperTypes";
import { existsSync, mkdirSync, readFileSync, writeFileSync} from "node:fs";
import path from "node:path";

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

    public abstract GetItemDetails(itemLink : string, getFiles? : boolean, getImages? : boolean) : Promise<Webscraper.ItemDetails>;


    //Used to make detection harder
    protected async removeWebdriverPropertyFromPage(page : Page){
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });
    }

    protected async GetFileFromURL(url : string, name? : string) : Promise<File>{
        const fileBlob = await (await fetch(url)).blob();
        const fileName = name || url.match(/\/([\w.][\w.-]*)(?<!\/\.)(?<!\/\.\.)(?:\?.*)?$/)?.[1] || "unknown";
    
        let file : File  = new File([fileBlob],fileName);

        return file;
    }

    public static WriteOrderToFile(order : Webscraper.Order, destination : string){
        const dirPath = path.dirname(destination);
        let fileName = path.basename(destination);
        let fileExt = path.extname(destination)


        if(fileName == null || fileName.length == 0){
            fileName = `Order-${order.ID}`
        }
        if(fileExt == null || fileExt.length == 0){
            fileName += `.json`
        }

        mkdirSync(dirPath,{recursive : true});
        
        writeFileSync(path.join(dirPath,fileName),JSON.stringify(order));
    }
    

    public static LoadOrderFromFile(source : string) :Webscraper.Order {
        const data = readFileSync(source).toString();

        return JSON.parse(data) as Webscraper.Order;
    }

    public static async WriteItemDetailsToFile(item : Webscraper.ItemDetails, destination : string){
        const dirPath = path.dirname(destination);
        let fileName = path.basename(destination);
        let fileExt = path.extname(destination);

        if(fileName == null || fileName.length == 0){
            fileName = `ItemDetails-${item.name}.json`
        }
        if(fileExt == null || fileExt.length == 0){
            fileName += `.json`
        }

        mkdirSync(dirPath,{recursive : true});
        
        const filesPath = dirPath + `/${item.name}/files`;
        const imagesPath = dirPath + `/${item.name}/images`;

        if(item.files != null && item.files.length > 0){
            mkdirSync(filesPath,{recursive : true});
            for(let file of item.files){
                let counter = 1;
                let newFilePath = path.join(filesPath,file.name)
                while(existsSync(newFilePath)){
                    const dir = filesPath;
                    const baseName = path.basename(file.name,path.extname(file.name));
                    const ext = path.extname(file.name);

                    newFilePath = path.join(dir, `${baseName}_${counter}${ext}`);

                    counter++;
                }

                writeFileSync(newFilePath,await file.bytes());
            }
        }

        if(item.images != null && item.images.length > 0){
            mkdirSync(imagesPath,{recursive : true});
            for(let file of item.images){
                let counter = 1;
                let newFilePath = path.join(imagesPath,file.name)
                while(existsSync(newFilePath)){
                    const dir = imagesPath;
                    const baseName = path.basename(file.name,path.extname(file.name));
                    const ext = path.extname(file.name);

                    newFilePath = path.join(dir, `${baseName}_${counter}${ext}`);

                    counter++;
                }

                writeFileSync(newFilePath,await file.bytes());
            }
        }

        item.images = [];
        item.files = [];

        writeFileSync(path.join(dirPath,fileName),JSON.stringify(item));
        
    }

    public static LoadItemDetailsFromFile(source : string) : Webscraper.Item|Webscraper.ItemDetails{
        const data = readFileSync(source).toString();

        return JSON.parse(data) as Webscraper.Item|Webscraper.ItemDetails;
    }

    public static SaveCookiesToFile(cookies : Cookie[], destination : string){
        const dirPath = path.dirname(destination);
        let fileName = path.basename(destination);

        mkdirSync(dirPath,{recursive : true});

        writeFileSync(path.join(dirPath,fileName),JSON.stringify(cookies));
    }

    public static LoadCookiesFromFile(path : string) : Cookie[]{
        const cookiesString = readFileSync(path, 'utf-8');
        const cookies = JSON.parse(cookiesString);

        return cookies;
    }
}