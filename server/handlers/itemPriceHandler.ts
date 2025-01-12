import { Request, Response } from 'express';
import ItemPriceDataAccess from '../dataAccess/ItemPriceDataAccess';
import { ItemPriceEntry } from '../models/DatabaseModel';
import { Connection } from 'mysql2/promise';
import { isDate } from 'util/types';

export default class ItemPriceHandler {
    private itemPriceDataAccess: ItemPriceDataAccess;

    constructor(mysqlConnection: Connection) {
        this.itemPriceDataAccess = new ItemPriceDataAccess(mysqlConnection);
    }

    public getItemPricesByItemID = async (req: Request, res: Response): Promise<any> => {
        try {
            const itemID = parseInt(req.params.itemID);
            if(isNaN(itemID)){
                return res.status(400).json({message : 'Invalid Item ID'});
            }
            const itemPrices: ItemPriceEntry[] = await this.itemPriceDataAccess.GetItemPricesByItemID(itemID);
            return res.status(200).json(itemPrices);
        } catch (e) {
            console.error('Error fetching item prices:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public createItemPriceForItemID = async (req: Request, res: Response): Promise<any> => {
        try {
            const itemID = parseInt(req.params.itemID, 10);
            if (isNaN(itemID)) {
                return res.status(400).json({ message: "Invalid item ID" });
            }
    
            const amount = parseFloat(req.body.amount);
            const currency = req.body.currency;
            const date = req.body.date ? new Date(req.body.date) : new Date();
    
            if (isNaN(amount)) {
                return res.status(400).json({ message: "Invalid amount" });
            }
            if (!currency) {
                return res.status(400).json({ message: "Currency is not specified" });
            }
            if(!isDate(date) || isNaN(date.getTime())){
                return res.status(400).json({ message: "Invalid date" });
            }
    
            const priceEntry = await this.itemPriceDataAccess.CreateItemPrice({itemID, amount,currency,date});
            return res.status(201).json(priceEntry);
        } catch (e) {
            console.error('Error creating item note:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public getLatestItemPriceByItemID = async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.itemID, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid item ID' });
            }

            const itemPrice: ItemPriceEntry | null = await this.itemPriceDataAccess.GetLatestPriceByItemID(id);
            if (!itemPrice) {
                return res.status(404).json({ message: 'Item price not found' });
            }

            return res.status(200).json(itemPrice);
        } catch (e) {
            console.error('Error fetching item price:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public getItemPriceByID = async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid item price ID' });
            }

            const itemPrice: ItemPriceEntry | null = await this.itemPriceDataAccess.GetItemPriceByID(id);
            if (!itemPrice) {
                return res.status(404).json({ message: 'Item price not found' });
            }

            return res.status(200).json(itemPrice);
        } catch (e) {
            console.error('Error fetching item price:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public updateItemPriceByID = async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid item price ID' });
            }

            const itemPrice = await this.itemPriceDataAccess.GetItemPriceByID(id);
            if (!itemPrice) {
                return res.status(404).json({ message: 'Item price not found' });
            }

            const {amount, currency, date} = req.body;

            itemPrice.amount = amount || itemPrice.amount;
            itemPrice.currency = currency || itemPrice.currency;
            itemPrice.date = new Date(date) || itemPrice.date;

            const success = await this.itemPriceDataAccess.UpdateItemPrice(itemPrice);
            if (success) {
                return res.status(200).json(itemPrice);
            } else {
                return res.status(404).json({ message: 'Item price not found' });
            }
        } catch (e) {
            console.error('Error updating item price:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public deleteItemPriceByID = async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid item price ID' });
            }

            const success = await this.itemPriceDataAccess.DeleteItemPrice(id);
            if (success) {
                return res.status(200).json({ message: 'Item price deleted successfully' });
            } else {
                return res.status(404).json({ message: 'Item price not found' });
            }
        } catch (e) {
            console.error('Error deleting item price:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
