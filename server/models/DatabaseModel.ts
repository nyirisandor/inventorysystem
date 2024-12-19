export interface ItemEntry {
    ID : number;
    name : string;
    description : string;
    typeID : number;
}

export interface ItemTypeEntry {
    ID : number;
    name : string;
}

export interface ItemNoteEntry {
    ID : number;
    itemID : number;
    title : string;
    description : string;
}

export interface ItemPriceEntry {
    ID: number;
    itemID : number;
    amount : number;
    currency : string;
    date : Date;
}

export interface UploadedDocumentEntry {
    ID : number;
    url : string;
    title : string;
    description : string;
}

export enum TxType {
    'issue',
    'receipt',
    'relocation'
}

export interface TransactionEntry {
    ID : number;
    date : Date;
    type : TxType;
    description : string;
    origin : string;
}

export interface WarehouseEntry {
    ID : number;
    name : string;
    description : string;
}

export interface ItemMovementEntry {
    txID : number;
    itemID : number;
    whID : number;
    amount : number;
    uom : string;
}

export interface UserEntry{
    ID : number,
    username : string,
    password_hash : string,
    isAdmin : boolean
}