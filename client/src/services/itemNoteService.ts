import { isDeveloperMode } from "@/lib/utils";
import { ItemNote } from "@/types/itemnote";
import axios, { AxiosError } from "axios";


const createNote = async (parameters : {itemID : number, title : string, description : string}) : Promise<ItemNote> => {
    try{
        const body = {
            'title' : parameters.title,
            'description' : parameters.description,
        }

        const response = await axios.post(`/api/items/${parameters.itemID}/notes`,body)

        return response.data as ItemNote
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error creating note:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const updateNote = async (itemNote : ItemNote) : Promise<ItemNote> => {
    try {
        const body = {
            'title' : itemNote.title,
            'description' : itemNote.description,
        }

        const response = await axios.put(`/api/itemNotes/${itemNote.ID}`,body);

        return response.data as ItemNote;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error updating note:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const deleteNote = async (noteID : number) : Promise<void> => {
    try{
        return (await axios.delete(`/api/itemNotes/${noteID}`)).data;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error deleting note:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

export {createNote,updateNote,deleteNote}