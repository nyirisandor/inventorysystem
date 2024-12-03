import { Connection, ResultSetHeader } from 'mysql2/promise';
import { ItemNoteEntry } from '../models/DatabaseModel';

export default class ItemNoteDataAccess {
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    public async GetItemNotes(): Promise<ItemNoteEntry[]> {
        const sql = `SELECT ID, itemID, title, description FROM ItemNote;`;
        const [results] = await this.connection.execute(sql);
        return results as ItemNoteEntry[];
    }

    public async CreateItemNote(itemNoteEntry: { itemID: number, title: string, description?: string }): Promise<ItemNoteEntry> {
        const sql = `INSERT INTO ItemNote (itemID, title, description) VALUES (?, ?, ?);`;
        const values = [
            itemNoteEntry.itemID,
            itemNoteEntry.title,
            itemNoteEntry.description || ""
        ];
        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);
        const resultEntry = itemNoteEntry as ItemNoteEntry;
        resultEntry.ID = results.insertId;
        return resultEntry;
    }

    public async GetItemNoteByID(ID: number): Promise<ItemNoteEntry | null> {
        const sql = `SELECT ID, itemID, title, description FROM ItemNote WHERE ID = ?;`;
        const [results] = await this.connection.execute(sql, [ID]);
        return results[0] as ItemNoteEntry || null;
    }

    public async UpdateItemNote(itemNoteEntry: ItemNoteEntry): Promise<boolean> {
        const sql = `UPDATE ItemNote SET itemID = ?, title = ?, description = ? WHERE ID = ?;`;
        const values = [
            itemNoteEntry.itemID,
            itemNoteEntry.title,
            itemNoteEntry.description,
            itemNoteEntry.ID
        ];
        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);
        return results.affectedRows == 1;
    }

    public async DeleteItemNote(ID: number): Promise<boolean> {
        const sql = `DELETE FROM ItemNote WHERE ID = ?;`;
        const values = [ID];
        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);
        return results.affectedRows == 1;
    }

    public async GetItemNotesForItem(itemID : number) : Promise<ItemNoteEntry[]> {
        const sql = `SELECT ID, itemID, title, description FROM ItemNote
         WHERE itemID = ?;`;
        const values = [itemID];
        const [results] = await this.connection.execute(sql,values);
        return results as ItemNoteEntry[];
    }
}