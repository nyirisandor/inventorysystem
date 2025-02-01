export namespace Webscraper{
    export interface Order{
        orderDate : Date | null,
        ID : string,
        status : string,
        items : OrderedItem[]
    }
    
    export interface Item {
        name : string,
        variants : ItemVariant[],
        link : string
    }
    
    export interface ItemVariant {
        name : string,
        price : ItemPrice
    }
    
    export interface ItemPrice{
        currency : string,
        amount : number
    }
    
    export interface OrderedItem extends Item{
        amount : number,
    }
    
    export interface ItemDetails extends Item{
        images : File[],
        files : File[],
        description : string,
        longDescription : string,
    }
}