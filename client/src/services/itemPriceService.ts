import { isDeveloperMode } from "@/lib/utils";
import { ItemPrice } from "@/types/itemprice";
import axios, { AxiosError } from "axios";


const createPriceEntry = async (parameters : {itemID : number, amount : number, currency : string, date : Date | null}) : Promise<ItemPrice> => {
    try{
        const body = {
            amount : parameters.amount,
            currency : parameters.currency,
            date : "",
        };

        if(parameters.date != null){
            body.date = parameters.date.toDateString();
        }

        const response = await axios.post(`/api/items/${parameters.itemID}/prices`,body)

        const result = response.data as ItemPrice;

        result.date = new Date(response.data.date);

        return result;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error creating price entry:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const updatePriceEntry = async (itemPrice : ItemPrice) : Promise<ItemPrice> => {
    try {
        const body = {
            amount : itemPrice.amount,
            currency : itemPrice.currency,
            date : itemPrice.date,
        }

        const response = await axios.put(`/api/itemPrices/${itemPrice.ID}`,body);

        const result = response.data as ItemPrice;

        result.date = new Date(response.data.date);

        return result;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error updating itemPrice:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const deletePriceEntry = async (priceID : number) : Promise<void> => {
    try{
        return (await axios.delete(`/api/itemPrices/${priceID}`)).data;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error deleting itemPrice:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

export {createPriceEntry,updatePriceEntry,deletePriceEntry}