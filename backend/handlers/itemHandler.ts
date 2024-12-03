import { Request, Response, Router, RequestHandler} from "express";
import { Connection } from "mysql2/promise";
import ItemDataAccess from "../dataAccess/ItemDataAccess";
import { ItemEntry } from "../models/DatabaseModel";


export default class ItemHandler{
    private itemDataAccess : ItemDataAccess;

    constructor(mysqlConnection : Connection) {
        this.itemDataAccess = new ItemDataAccess(mysqlConnection);
    }

    public getAllItems : RequestHandler = async (req : Request , res : Response) : Promise<any> => {
        try{
            const items : ItemEntry[] = await this.itemDataAccess.GetItemEntries();
            return res.status(200).json(items);
        }catch(e){
            console.error('Error fetching items:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public createItem : RequestHandler = async (req: Request, res: Response): Promise<any> => {
        try{
            const name : string = req.body.name;
            const description : string = req.body.description || "";
            const typeID : number = parseInt(req.body.typeID,10);
    
            if (!name) {
                return res.status(400).json({ message: "Name is required" });
            }
        
            const newItem = await this.itemDataAccess.CreateItemEntry({ name, description, typeID });
            return res.status(201).json(newItem);
        } catch(e){
            console.error('Error creating item:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public getItemByID : RequestHandler = async (req : Request, res : Response) : Promise<any> => {
        try{
            const id : number = parseInt(req.params.id,10);
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid item ID" });
            }
    
            const item : ItemEntry| null = await this.itemDataAccess.GetItemEntryByID(id);
            if(!item){
                return res.status(404).json({message: 'Item not found'});
            }
            return res.status(200).json(item);
        }catch(e){
            console.error('Error fetching item:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public deleteItemByID : RequestHandler = async (req: Request, res: Response): Promise<any> => {
        try {
            const id : number = parseInt(req.params.id,10);
    
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid item ID" });
            }
    
            const success = await this.itemDataAccess.DeleteItemEntry(id);
            if (success) {
                return res.status(200).json({ message: 'Item deleted successfully' });
            }
            return res.status(404).json({ message: 'Item not found' });
        } catch (e) {
            console.error('Error deleting item:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public updateItemByID : RequestHandler = async (req : Request, res : Response) : Promise<any> =>{
        try{
            const id : number = parseInt(req.params.id,10);
            const name : string = req.body.name;
            const description : string = req.body.description || "";
            const typeID : number = parseInt(req.body.typeID,10);
    
            if (!name) {
                return res.status(400).json({ message: "Name is required" });
            }
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid item ID" });
            }
    
            const updatedItem : ItemEntry = {
                ID : id,
                name : name,
                description : description,
                typeID : typeID
            };
    
            if(await this.itemDataAccess.UpdateItemEntry(updatedItem)){
                return res.status(200).json(updatedItem);
            }
            else{
                return res.status(404).json({ message: 'Item not found' });
            }
        } catch (e) {
            console.error('Error updating item:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}