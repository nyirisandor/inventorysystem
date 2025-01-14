import { ItemNote } from "./itemnote"
import { ItemPrice } from "./itemprice"
import { ItemType } from "./itemtype"
import { UploadedDocumentEntry } from "./uploadeddocument"

export interface Item{
    ID : number,
    name : string,
    description : string,
    type : ItemType,
    latestPrice : ItemPrice | null,
    pricehistory : ItemPrice[],
    notes : ItemNote[],
    documents : UploadedDocumentEntry[]
}

export interface ItemEntry {
    ID : number,
    name : string,
    description : string,
    typeID : number,
}