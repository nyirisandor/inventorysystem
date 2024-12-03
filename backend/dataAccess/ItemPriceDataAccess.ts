import { Connection, ResultSetHeader } from 'mysql2/promise';
import { ItemPriceEntry } from '../models/DatabaseModel';

export default class ItemPriceDataAccess {
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    public async GetItemPrices(): Promise<ItemPriceEntry[]> {
        const sql = `SELECT ID, itemID, amount, currency, date FROM ItemPrice;`;
        const [results] = await this.connection.execute(sql);
        return results as ItemPriceEntry[];
    }

    public async CreateItemPrice(itemPriceEntry: { itemID: number, amount: number, currency: string, date? : Date}): Promise<ItemPriceEntry> {
        const sql = `INSERT INTO ItemPrice (itemID, amount, currency, date) VALUES (?, ?, ? ,?);`;
        const values = [
            itemPriceEntry.itemID,
            itemPriceEntry.amount,
            itemPriceEntry.currency,
            itemPriceEntry.date || new Date()
        ];
        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);
        const resultEntry = itemPriceEntry as ItemPriceEntry;
        resultEntry.ID = results.insertId;
        return resultEntry;
    }

    public async GetItemPriceByID(ID: number): Promise<ItemPriceEntry | null> {
        const sql = `SELECT ID, itemID, amount, currency, date FROM ItemPrice WHERE ID = ?;`;
        const [results] = await this.connection.execute(sql, [ID]);
        return results[0] as ItemPriceEntry || null;
    }

    public async UpdateItemPrice(itemPriceEntry: ItemPriceEntry): Promise<boolean> {
        const sql = `UPDATE ItemPrice SET itemID = ?, amount = ?, currency = ?, date = ? WHERE ID = ?;`;
        const values = [
            itemPriceEntry.itemID,
            itemPriceEntry.amount,
            itemPriceEntry.currency,
            itemPriceEntry.date,
            itemPriceEntry.ID
        ];
        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);
        return results.affectedRows == 1;
    }

    public async DeleteItemPrice(ID: number): Promise<boolean> {
        const sql = `DELETE FROM ItemPrice WHERE ID = ?;`;
        const values = [ID];
        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);
        return results.affectedRows == 1;
    }

    public async GetItemPricesByItemID(itemID : number) : Promise<ItemPriceEntry[]>{
        const sql = `SELECT ID, itemID, amount, currency, date FROM ItemPrice 
        WHERE itemID = ?
        `;
        const values = [itemID];
        const [results] = await this.connection.execute(sql,values);
        return results as ItemPriceEntry[];
    }

    public async GetLatestPriceByItemID(itemID : number) : Promise<ItemPriceEntry|null>{
        const sql = `SELECT ID, itemID, amount, currency, date FROM ItemPrice 
        WHERE itemID = ?
        ORDER BY date DESC
        `;
        const values = [itemID];
        const [results] = await this.connection.execute(sql,values);
        return results[0] as ItemPriceEntry || null;
    }
}
