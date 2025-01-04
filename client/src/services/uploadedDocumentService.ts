import { isDeveloperMode } from "@/lib/utils";
import { UploadedDocumentEntry } from "@/types/uploadeddocument";
import axios, { AxiosError } from "axios";


const getUploadedDocuments = async () : Promise<UploadedDocumentEntry[]> => {
    try{
        const res = await axios.get("/api/documents");

        return res.data as UploadedDocumentEntry[]
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error while getting uploaded documents:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const uploadDocument = async ({title,description,fileName,file} : {title : string, description : string, fileName : string,file : File}) : Promise<UploadedDocumentEntry[]> => {
    try{
        const formData = new FormData();

        if(title.length > 0){
            formData.append("title",title);
        }
    
        formData.append("description",description);
    
        if(fileName.length > 0){
            formData.append("fileName",fileName);
        }
    
        const buffer = await file.text();
        formData.append("file",new Blob([buffer]),file.name);

        const res = await axios.post("/api/documents/upload",formData);

        return res.data;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error while updating documentEntry:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const updateUploadedDocumentEntry = async (value : UploadedDocumentEntry) : Promise<any> => {
    try{
        const body = {
            title : value.title,
            description : value.description
        };

        const res = await axios.put(`/api/documents/${value.ID}`,body);

        return res.data;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error while updating documentEntry:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const deleteDocument = async  (documentID : number) : Promise<any> => {
    try{
        const res = await axios.delete(`/api/documents/${documentID}`);

        return res.data;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error while deleting documentEntry:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}
    

export {getUploadedDocuments,uploadDocument,updateUploadedDocumentEntry,deleteDocument}