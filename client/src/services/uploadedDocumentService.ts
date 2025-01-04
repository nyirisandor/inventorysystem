import { isDeveloperMode } from "@/lib/utils";
import { UploadedDocumentEntry } from "@/types/uploadeddocument";
import axios, { AxiosError, AxiosProgressEvent, AxiosRequestConfig} from "axios";


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


type UploadDocumentParameters = {
    values : {
        title : string
        description : string,
        fileName : string,
        file : File
    },
    onProgress? : (progressEvent: AxiosProgressEvent) => void,
    cancelFunctionRef? : React.MutableRefObject<Function | undefined>,
}

const uploadDocument = async (params : UploadDocumentParameters) : Promise<UploadedDocumentEntry[]> => {
    try{
        const formData = new FormData();

        if(params.values.title.length > 0){
            formData.append("title",params.values.title);
        }
    
        formData.append("description",params.values.description);
    
        if(params.values.fileName.length > 0){
            formData.append("fileName",params.values.fileName);
        }
    
        const buffer = await params.values.file.text();
        formData.append("file",new Blob([buffer]),params.values.file.name);


        const cancelToken = new axios.CancelToken((c) => {
            if(params.cancelFunctionRef)
                params.cancelFunctionRef.current = c
        })


        const requestConfig : AxiosRequestConfig = {};
        requestConfig.onUploadProgress = params.onProgress;
        requestConfig.cancelToken = cancelToken;
        requestConfig.timeout = -1;

        const res = await axios.post("/api/documents/upload",formData,requestConfig)
        .then((res) => {
            return res.data;
        })
        .catch((err : AxiosError) => {
            if(err.code = "ERR_CANCELED")
                return Promise.reject("Canceled by user");
            else
                throw err
        });

        return res;
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