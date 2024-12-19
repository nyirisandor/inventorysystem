import { Item, ItemEntry } from "@/types/item";
import { ItemPrice } from "@/types/itemprice";
import { ItemType } from "@/types/itemtype";

const getItemByID = async (itemID : number) : Promise<Item> => {
    try{
        const itemEntry = await (fetch(`/api/items/${itemID}`).then(res => {
            if(res.status != 200) throw new Error(res.statusText);
            return res.json();
        })) as ItemEntry;

        const itemType = await (fetch(`/api/itemTypes/${itemEntry.typeID}`).then(res => {
            return res.json();
        })) as ItemType;

        const latestPrice = await (fetch(`/api/items/${itemEntry.typeID}/latestprice`).then(res => {
            return res.json();
        })) as ItemPrice

        const item = {
            ID : itemEntry.ID,
            name : itemEntry.name,
            description : itemEntry.description,
            type : itemType,
            latestPrice : latestPrice
        } as Item;

        return item;

    }
    catch(err){
        console.error("Error fetching products:", err);
        return Promise.reject();
    }
}

const getItems = async () : Promise<Item[]> => {
    try{
        const itemEntries = await getItemEntries();
        const itemTypes = await getItemTypes();

        let items : Item[] = [];

        itemEntries.forEach((entry) => {
            let item : Item = {
                ID : entry.ID,
                name : entry.name,
                description : entry.description,
                type : itemTypes.find(x => x.ID == entry.typeID) || {name : "invalid type", ID : entry.typeID},
                latestPrice : null,
                documents : [],
                pricehistory : [],
                notes : []
            };

            items.push(item);
        });

        return items;
    }
    catch{
        return Promise.reject();
    }
}

const getItemEntries = async () : Promise<ItemEntry[]> => {
    try{
        const response = await fetch("/api/items");

        if(response.status == 200){
            return await response.json() as ItemEntry[];
        }
        else{
            return [];
        }
    }
    catch(err){
        console.error("Error fetching products:", err);
        return Promise.reject();
    }
}

const getItemTypes = async () : Promise<ItemType[]> => {
    try{
        const response = await fetch(`/api/itemtypes`);

        if(response.status == 200){
            return await response.json() as ItemType[];
        }
        else{
            return []
        }
    }
    catch(err){
        console.error("Error fetching products:", err);
        return Promise.reject();
    }
}

const getItemType = async (typeID : number) : Promise<ItemType |null> => {
    try{
        const response = await fetch(`/api/itemtypes/${typeID}`);

        if(response.status == 200){
            return await response.json() as ItemType;
        }
        else{
            return {
                ID : typeID,
                name : "Invalid type"
            } as ItemType
        }
    }
    catch(err){
        console.error("Error", err);
        return null;
    }
}

const createItem = async (item : {name : string, description : string, typeID : number|null}) : Promise<ItemEntry> => {
    try{

        const headers = new Headers();

        headers.append("Content-Type", "application/json");

        const body = {
            'name' : item.name,
            'description' : item.description,
            'typeID' : item.typeID
        }

        const response = await fetch("/api/items", {
            method : 'post',
            body : JSON.stringify(body),
            headers : headers,
            credentials : "same-origin"
        });

        if(response.status == 201){
            return await response.json() as ItemEntry;
        }
        else{
            return Promise.reject(response);
        }
    }
    catch(err){
        console.error("Error",err);
        return Promise.reject();
    }
}

const updateItemEntry = async (itemEntry : ItemEntry) : Promise<ItemEntry> => {
    try {
        const headers = new Headers();

        headers.append("Content-Type", "application/json");

        const body = {
            name : itemEntry.name,
            description : itemEntry.description,
            typeID : itemEntry.typeID
        };

        const response = await fetch(`/api/items/${itemEntry.ID}`,{
            method : 'put',
            headers : headers,
            body : JSON.stringify(body),
        })

        if(response.status == 200){
            return await response.json() as ItemEntry;
        }
        else{
            return Promise.reject(await response.json());
        }
    }
    catch(err){
        console.error(err);
        return Promise.reject();  
    }
}

const deleteItem = async (itemID : number) : Promise<void> => {
    try{
        const response = await fetch(`/api/items/${itemID}`,{
            method : 'delete'
        });

        if(response.status != 200){
            return Promise.reject(await response.json());
        }

        return Promise.resolve();
    }
    catch(err){
        console.error("Error",err);
        return Promise.reject();
    }
}

export {getItemByID,getItems,getItemEntries,getItemType, getItemTypes,createItem,updateItemEntry,deleteItem};