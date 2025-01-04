import { UploadedDocumentEntry } from "@/types/uploadeddocument";


const getUploadedDocuments = async () : Promise<UploadedDocumentEntry[]> => {
    const res = await fetch("/api/documents");
    const json = await res.json();

    if(res.status != 200) throw new Error(json.message);

    return json;
}

const uploadDocument = async ({title,description,fileName,file} : {title : string, description : string, fileName : string,file : File}) : Promise<UploadedDocumentEntry[]> => {

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
    
    const res = await fetch("/api/documents/upload",{
        method : "POST",
        body : formData,
    })
    
    if(res.status == 200){
        return await res.json();
    }
    else{
        throw Error(await res.json());
    }
}

const updateUploadedDocumentEntry = async (value : UploadedDocumentEntry) : Promise<any> => {

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const body = {
        title : value.title,
        description : value.description
    };


    const res = await fetch(`/api/documents/${value.ID}`,{
        headers,
        method: "PUT",
        body : JSON.stringify(body)
    });

    var json = await res.json();

    if(res.status == 200){
        return json;
    }
    else{
        throw new Error(json);
    }
}

const deleteDocument = async  (documentID : number) : Promise<any> => {
    var res = await fetch(`/api/documents/${documentID}`,{
        method : "DELETE"
    })

    var json = await res.json();

    return json;
}
    

export {getUploadedDocuments,uploadDocument,updateUploadedDocumentEntry,deleteDocument}