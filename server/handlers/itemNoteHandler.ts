import { Request, Response, Router, RequestHandler} from "express";
import { Connection } from "mysql2/promise";
import ItemNoteDataAccess from "../dataAccess/ItemNoteDataAccess";
import { ItemNoteEntry } from "../models/DatabaseModel";


export default class ItemNoteHandler{
    private itemNoteDataAccess: ItemNoteDataAccess;
        constructor(mysqlConnection : Connection) {
        this.itemNoteDataAccess = new ItemNoteDataAccess(mysqlConnection);
    }

    public getNotesByItemID = async (req: Request, res: Response): Promise<any> => {
        try {
            const itemID = parseInt(req.params.itemID, 10);
            if (isNaN(itemID)) {
                return res.status(400).json({ message: "Invalid item ID" });
            }
    
            const itemNotes: ItemNoteEntry[] = await this.itemNoteDataAccess.GetItemNotesForItem(itemID);
            return res.status(200).json(itemNotes);
        } catch (e) {
            console.error('Error fetching item notes:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public createNoteForItemID = async (req: Request, res: Response): Promise<any> => {
        try {
            const itemID = parseInt(req.params.itemID, 10);
            if (isNaN(itemID)) {
                return res.status(400).json({ message: "Invalid item ID" });
            }
    
            const title = req.body.title;
            const description = req.body.description || "";
    
    
            if (!title) {
                return res.status(400).json({ message: "Title is required" });
            }
    
            const newItemNote = await this.itemNoteDataAccess.CreateItemNote({ itemID, title, description });
            return res.status(201).json(newItemNote);
        } catch (e) {
            console.error('Error creating item note:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public getNoteByID =  async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid note ID" });
            }
    
            const itemNote: ItemNoteEntry | null = await this.itemNoteDataAccess.GetItemNoteByID(id);
            if (!itemNote) {
                return res.status(404).json({ message: 'Item note not found' });
            }
    
            return res.status(200).json(itemNote);
        } catch (e) {
            console.error('Error fetching item note:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public updateNoteByID =  async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid note ID" });
            }
    
            let itemNote = await this.itemNoteDataAccess.GetItemNoteByID(id);
    
            if(!itemNote){
                return res.status(404).json({ message: 'Item note not found' });
            }

            const {title, description} = req.body;
    
            itemNote.title = title ||  itemNote.title;
            itemNote.description = description || itemNote.description;
    
            const success = await this.itemNoteDataAccess.UpdateItemNote(itemNote);
    
            if (success) {
                return res.status(200).json(itemNote);
            } else {
                return res.status(404).json({ message: 'Item note not found' });
            }
    
            
        } catch (e) {
            console.error('Error updating item note:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public deleteNoteByID = async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid note ID" });
            }
    
            const success = await this.itemNoteDataAccess.DeleteItemNote(id);
            if (success) {
                return res.status(200).json({ message: 'Item note deleted successfully' });
            } else {
                return res.status(404).json({ message: 'Item note not found' });
            }
        } catch (e) {
            console.error('Error deleting item note:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}