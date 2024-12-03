import { Connection, ResultSetHeader } from 'mysql2/promise';
import { ItemTypeEntry } from '../models/DatabaseModel';

export default class ItemTypeDataAccess {
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    public async GetItemTypeEntries(): Promise<ItemTypeEntry[]> {
        const sql = `SELECT ID, name FROM itemtype;`;

        const [results] = await this.connection.execute(sql);
        return results as ItemTypeEntry[];
    }

    public async CreateItemTypeEntry(itemTypeEntry: { name: string }): Promise<ItemTypeEntry> {
        const sql = `INSERT INTO itemtype (name) VALUES (?);`;

        const values = [itemTypeEntry.name];

        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);

        const resultEntry = itemTypeEntry as ItemTypeEntry;
        resultEntry.ID = results.insertId;

        return resultEntry;
    }

    public async GetItemTypeEntryByID(ID: number): Promise<ItemTypeEntry | null> {
        const sql = `SELECT ID, name FROM itemtype WHERE ID = ?;`;

        const [results] = await this.connection.execute(sql, [ID]);
        return results[0] as ItemTypeEntry || null;
    }

    public async UpdateItemTypeEntry(itemTypeEntry: ItemTypeEntry): Promise<boolean> {
        const sql = `UPDATE itemtype SET name = ? WHERE ID = ?;`;

        const values = [itemTypeEntry.name, itemTypeEntry.ID];

        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);

        return results.affectedRows == 1;
    }

    public async DeleteItemTypeEntry(ID: number): Promise<boolean> {
        const sql = `DELETE FROM itemtype WHERE ID = ?;`;

        const values = [ID];

        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);

        return results.affectedRows == 1;
    }
}