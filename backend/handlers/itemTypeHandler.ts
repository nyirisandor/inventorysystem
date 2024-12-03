import { Request, Response } from 'express';
import ItemTypeDataAccess from '../dataAccess/ItemTypeDataAccess';
import { ItemTypeEntry } from '../models/DatabaseModel';
import { Connection } from 'mysql2/promise';

export default class ItemTypeHandler {
    private itemTypeDataAccess: ItemTypeDataAccess;

    constructor(mysqlConnection: Connection) {
        this.itemTypeDataAccess = new ItemTypeDataAccess(mysqlConnection);
    }

    public getItemTypeEntries = async (req: Request, res: Response): Promise<any> => {
        try {
            const itemTypes: ItemTypeEntry[] = await this.itemTypeDataAccess.GetItemTypeEntries();
            return res.status(200).json(itemTypes);
        } catch (e) {
            console.error('Error fetching item types:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public createItemTypeEntry = async (req: Request, res: Response): Promise<any> => {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ message: 'Name is required' });
            }

            const newItemType = await this.itemTypeDataAccess.CreateItemTypeEntry({ name });
            return res.status(201).json(newItemType);
        } catch (e) {
            console.error('Error creating item type:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public getItemTypeEntryByID = async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid item type ID' });
            }

            const itemType: ItemTypeEntry | null = await this.itemTypeDataAccess.GetItemTypeEntryByID(id);
            if (!itemType) {
                return res.status(404).json({ message: 'Item type not found' });
            }

            return res.status(200).json(itemType);
        } catch (e) {
            console.error('Error fetching item type:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public updateItemTypeEntryByID = async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid item type ID' });
            }

            const itemType = await this.itemTypeDataAccess.GetItemTypeEntryByID(id);
            if (!itemType) {
                return res.status(404).json({ message: 'Item type not found' });
            }

            const { name } = req.body;

            itemType.name = name || itemType.name;

            const success = await this.itemTypeDataAccess.UpdateItemTypeEntry(itemType);
            if (success) {
                return res.status(200).json(itemType);
            } else {
                return res.status(404).json({ message: 'Item type not found' });
            }
        } catch (e) {
            console.error('Error updating item type:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public deleteItemTypeEntryByID = async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid item type ID' });
            }

            const success = await this.itemTypeDataAccess.DeleteItemTypeEntry(id);
            if (success) {
                return res.status(200).json({ message: 'Item type deleted successfully' });
            } else {
                return res.status(404).json({ message: 'Item type not found' });
            }
        } catch (e) {
            console.error('Error deleting item type:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
