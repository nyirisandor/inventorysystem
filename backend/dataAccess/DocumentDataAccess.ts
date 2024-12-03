import { Connection, ResultSetHeader } from 'mysql2/promise';
import { UploadedDocumentEntry } from '../models/DatabaseModel';

export default class DocumentDataAccess {
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    public async GetUploadedDocuments(): Promise<UploadedDocumentEntry[]> {
        const sql = `SELECT ID, url, title, description FROM UploadedDocument;`;
        const [results] = await this.connection.execute(sql);
        return results as UploadedDocumentEntry[];
    }

    public async CreateUploadedDocument(documentEntry: { url: string, title: string, description?: string }): Promise<UploadedDocumentEntry> {
        const sql = `INSERT INTO UploadedDocument (url, title, description) VALUES (?, ?, ?);`;
        const values = [
            documentEntry.url,
            documentEntry.title,
            documentEntry.description || ""
        ];
        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);
        const resultEntry = documentEntry as UploadedDocumentEntry;
        resultEntry.ID = results.insertId;
        return resultEntry;
    }

    public async GetUploadedDocumentByID(ID: number): Promise<UploadedDocumentEntry | null> {
        const sql = `SELECT ID, url, title, description FROM UploadedDocument WHERE ID = ?;`;
        const [results] = await this.connection.execute(sql, [ID]);
        return results[0] as UploadedDocumentEntry || null;
    }

    public async UpdateUploadedDocument(documentEntry: UploadedDocumentEntry): Promise<boolean> {
        const sql = `UPDATE UploadedDocument SET url = ?, title = ?, description = ? WHERE ID = ?;`;
        const values = [
            documentEntry.url,
            documentEntry.title,
            documentEntry.description,
            documentEntry.ID
        ];
        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);
        return results.affectedRows == 1;
    }

    public async DeleteUploadedDocument(ID: number): Promise<boolean> {
        const sql = `DELETE FROM UploadedDocument WHERE ID = ?;`;
        const values = [ID];
        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);
        return results.affectedRows == 1;
    }

    public async GetUploadedDocumentsForItem(itemID : number) : Promise<UploadedDocumentEntry[]> {
        const sql = `SELECT doc.ID, doc.url, doc.title, doc.description 
            FROM UploadedDocument doc, ItemUploadedDocuments itmdoc
            WHERE itmdoc.ID = doc.ID AND
            itmdoc.ItemID = ?
            ;`;
        const values = [itemID];
        const [results] = await this.connection.execute(sql, values);  
        return results as UploadedDocumentEntry[];
    }
}
