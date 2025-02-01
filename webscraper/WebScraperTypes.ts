export namespace Webscraper{
    export interface Order{
        orderDate : Date | null,
        ID : number | null,
        status : string,
        items : OrderItem[]
    }
    


    export interface Item{
        name : string,
        variant : string,
        priceCurrency : string,
        priceAmount : number | null,
        link : string,
    }
    
    export interface OrderItem extends Item{
        orderedAmount : number | null,
    }
    
    
    
    export interface ItemDetails extends Item{
        images : File[],
        files : File[],
        description : string,
    }
}