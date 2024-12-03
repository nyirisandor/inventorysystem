import { Connection, ResultSetHeader} from 'mysql2/promise';
import {ItemEntry} from '../models/DatabaseModel'

export default class ItemDataAccess {
    private connection : Connection;

    constructor(connection : Connection){
        this.connection = connection;
    }


    public async GetItemEntries() : Promise<ItemEntry[]>{
        const sql = `SELECT ID, name, description, typeID 
            FROM item;
            `;
        
        const [results] = await this.connection.execute(sql);

        return results as ItemEntry[];
    }

    public async CreateItemEntry(itemEntry : {name : string, description? : string, typeID? : number}) : Promise<ItemEntry>{
        const sql = `INSERT INTO item (name, description, typeID)
            VALUES (?,?,?);
        `;

        const values = [
            itemEntry.name,
            itemEntry.description || "",
            itemEntry.typeID || 0
        ]

        const [results] = await this.connection.execute<ResultSetHeader>(sql,values);

        const resultEntry = itemEntry as ItemEntry;
        resultEntry.ID = results.insertId;

        return resultEntry;
    }

    public async GetItemEntryByID(ID : number) : Promise<ItemEntry|null>{
        const sql = `SELECT ID, name, description, typeID 
        FROM item
        WHERE ID = ?;
        `;

        const [results] = await this.connection.execute(sql,[ID]);

        return results[0] as ItemEntry || null;
    }

    public async UpdateItemEntry(itemEntry : ItemEntry) : Promise<boolean>{
        const sql = ` UPDATE item
        SET name = ?, description = ?, typeID = ?
        WHERE ID = ? 
        `;

        const values = [
            itemEntry.name,
            itemEntry.description,
            itemEntry.typeID,
            itemEntry.ID
        ]

        const [results] = await this.connection.execute<ResultSetHeader>(sql,values);

        return results.affectedRows == 1;
    }

    public async DeleteItemEntry(ID : number) : Promise<boolean>{
        const sql = `
            DELETE FROM item
            WHERE ID = ?;
        `;

        const values = [
            ID
        ];

        const [results] = await this.connection.execute<ResultSetHeader>(sql,values);

        return results.affectedRows == 1;
    }
}