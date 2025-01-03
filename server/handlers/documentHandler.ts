import { Request, Response, RequestHandler} from "express";
import { Connection } from "mysql2/promise";
import { UploadedDocumentEntry } from "../models/DatabaseModel";
import DocumentDataAccess from "../dataAccess/DocumentDataAccess";
import { UploadedFile } from "express-fileupload";
import { existsSync, readdirSync, rmSync, statSync } from "fs";


export default class DocumentHandler{
    private documentDataAccess : DocumentDataAccess;

    constructor(mysqlConnection : Connection) {
        this.documentDataAccess = new DocumentDataAccess(mysqlConnection);
    }

    public getAllDocumentEntries : RequestHandler = async (req : Request , res : Response) : Promise<any> => {
        try{
            const documentEntries : UploadedDocumentEntry[] = await this.documentDataAccess.GetUploadedDocuments();
            const folderContents = readdirSync('./uploads/');

            documentEntries.map(x => {
                var res = x as {
                    ID : number;
                    url : string;
                    title : string;
                    description : string;
                    size : number;
                    warning : string;
                }

                if(!folderContents.includes(x.url)){
                    res.warning = "File not found!"
                }
                else{
                    res.size = statSync('./uploads/' + x.url).size;
                }


                return res;
            });


            return res.status(200).json(documentEntries);
        }catch(e){
            console.error('Error fetching uploaded documents:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public uploadDocument : RequestHandler = async (req : Request, res : Response) : Promise<any> => {
        try{
            if(!req.files){
                return res.status(400).json({message : 'No file uploaded'});
            }

            const file : UploadedFile = req.files.file as UploadedFile;

            const fileName = req.body.fileName || file.name;

            const title = req.body.title || fileName;

            const description = req.body.description || null;


            var filePath = 'uploads/' + fileName;

            const resultEntry = await this.documentDataAccess.CreateUploadedDocument({
                url : fileName,
                title : title,
                description : description
            });

            await file.mv(filePath);

            res.status(200).json(resultEntry);
        }
        catch(e){
            switch(e.code){
                case "ER_DUP_ENTRY":
                    return res.status(400).json({message : 'File with this name already exists'});
                default:
                    console.error('Error while uploading document:', e);
                    return res.status(500).json({ message: 'Server error' });
            }
        }
    }

    public downloadDocumentByID : RequestHandler = async (req : Request, res : Response) : Promise<any> => {
        try{
            const documentEntryID = Number.parseInt(req.params.id);

            if(!documentEntryID || Number.isNaN(documentEntryID)){
                return res.status(400).json({'message' : 'invalid document id'});
            }


            const documentEntry = await this.documentDataAccess.GetUploadedDocumentByID(documentEntryID);

            const filePath = './uploads/' + documentEntry?.url;

            if(existsSync(filePath)){
                return res.download(filePath);
            }
            else{
                return res.status(404).json({'message' : 'File not found'});
            }

           

        }
        catch(e){
            console.error('Error while downloading document:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public deleteDocumentByID : RequestHandler = async (req : Request, res : Response) : Promise<any> => {
        try{
            const documentEntryID = Number.parseInt(req.params.id);

            if(!documentEntryID || Number.isNaN(documentEntryID)){
                return res.status(400).json({'message' : 'invalid document id'});
            }

            const selectedEntry = await this.documentDataAccess.GetUploadedDocumentByID(documentEntryID);

            if(selectedEntry == null){
                return res.status(404).json({message: 'Document not found with ID: ' + documentEntryID});
            }

            const result = await this.documentDataAccess.DeleteUploadedDocument(documentEntryID);

            if(existsSync('./uploads/' + selectedEntry.url)){
                rmSync('./uploads/' + selectedEntry.url);
            }
            
            if(result){
                return res.status(200).json({message: 'Successfully deleted'});
            }
        }
        catch(e){
            console.error('Error while deleting document:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public updateDocumentEntryByID : RequestHandler = async (req : Request, res : Response) : Promise<any> => {
        try{
            const documentEntryID = Number.parseInt(req.params.id);

            if(!documentEntryID || Number.isNaN(documentEntryID)){
                return res.status(400).json({'message' : 'invalid document id'});
            }

            const selectedEntry = await this.documentDataAccess.GetUploadedDocumentByID(documentEntryID);


            if(selectedEntry == null){
                return res.status(200).json({message: 'Document entry not found'});
            }


           selectedEntry.title = req.body.title || selectedEntry.title;
           selectedEntry.description = req.body.description || selectedEntry.description;

           const result = await this.documentDataAccess.UpdateUploadedDocument(selectedEntry);


            if(result){
                return res.status(200).json({message: 'Successfully updated'});
            }
            else{
                return res.status(400).json({message: 'Error during updating document entry'});
            }
            
        }
        catch(e){
            console.error('Error while updating document entry:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }


    // TODO: cleanup files without entry
    // TODO: get documents for an item
}