import { isDeveloperMode } from "@/lib/utils";
import { Item, ItemEntry } from "@/types/item";
import { ItemPrice } from "@/types/itemprice";
import { ItemType } from "@/types/itemtype";
import { ItemNote } from "@/types/itemnote";
import axios, { AxiosError } from "axios";

const getItemByID = async (itemID : number) : Promise<Item> => {
    try{

        const itemEntry = (await axios.get(`/api/items/${itemID}`)).data as ItemEntry;

        const item = {
            ID : itemEntry.ID,
            name : itemEntry.name,
            description : itemEntry.description,
            type : {ID : -1, name : "Hibás kategória"},
            latestPrice : null
        } as Item;

        await axios.get(`/api/itemTypes/${itemEntry.typeID}`).then((res) => {
            item.type = res.data as ItemType
        })
        .catch((err : AxiosError) => {
            if(err.status != 404) throw err;
        });

        await axios.get(`/api/items/${itemEntry.ID}/latestprice`).then((res) => {
            item.latestPrice = res.data as ItemPrice
        })
        .catch((err : AxiosError) => {
            if(err.status != 404) throw err;
        });

        await axios.get(`/api/items/${itemEntry.ID}/notes`).then((res) => {
            item.notes = res.data as ItemNote[];
        })
        .catch((err : AxiosError) => {
            item.notes = [];
            if(err.status != 404) throw err;
        });


        return item;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error fetching products:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
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
    catch (err){
        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const getItemEntries = async () : Promise<ItemEntry[]> => {
    try{
        const res = await axios.get("/api/items");

        if(res.status == 200)
            return res.data as ItemEntry[];
        else
            return [];
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error fetching items:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const getItemTypes = async () : Promise<ItemType[]> => {
    try{
        const res = await axios.get("/api/itemtypes");

        if(res.status == 200)
            return res.data as ItemType[];
        else
            return [];
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error fetching itemtypes:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const getItemType = async (typeID : number) : Promise<ItemType |null> => {
    try{
        const response = await axios.get(`/api/itemtypes/${typeID}`);

        if(response.status == 200){
            return await response.data as ItemType;
        }
        else{
            return {
                ID : typeID,
                name : "Invalid type"
            } as ItemType
        }
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error fetching itemtype:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const createItem = async (item : {name : string, description : string, typeID : number|null}) : Promise<ItemEntry> => {
    try{
        const body = {
            'name' : item.name,
            'description' : item.description,
            'typeID' : item.typeID
        }

        const response = await axios.post("/api/items",body)

        return response.data as ItemEntry;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error creating item:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const updateItemEntry = async (itemEntry : ItemEntry) : Promise<ItemEntry> => {
    try {
        const body = {
            name : itemEntry.name,
            description : itemEntry.description,
            typeID : itemEntry.typeID
        };

        const response = await axios.put(`/api/items/${itemEntry.ID}`,body);

        return response.data as ItemEntry;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error updating item:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const deleteItem = async (itemID : number) : Promise<void> => {
    try{
        await axios.delete(`/api/items/${itemID}`);
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error deleting item:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

export {getItemByID,getItems,getItemEntries,getItemType, getItemTypes,createItem,updateItemEntry,deleteItem};