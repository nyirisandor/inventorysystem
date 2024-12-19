import { Connection, ResultSetHeader } from 'mysql2/promise';
import { UserEntry } from '../models/DatabaseModel';

export default class UsersDataAccess {
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    public async GetUsers(): Promise<UserEntry[]> {
        const sql = `SELECT ID, username, isAdmin FROM user;`;
        const [results] = await this.connection.execute(sql);
        return results as UserEntry[];
    }

    public async CreateUser(user : UserEntry): Promise<UserEntry> {
        const sql = `INSERT INTO user (username, password_hash, isadmin) VALUES (?, ?, ?);`;

        const values = [user.username, user.password_hash, user.isAdmin];

        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);

        const resultEntry = {
            ID : results.insertId,
            username : user.username,
            password_hash : user.password_hash,
            isAdmin : user.isAdmin,
        } as UserEntry;

        return resultEntry;
    }

    public async GetUserByID(userID : number) : Promise<UserEntry|null> {
        const sql = `SELECT ID, username, password_hash, isAdmin FROM user WHERE userID = ?;`;
        const values = [userID]
        const [results] = await this.connection.execute(sql,values);
        return results[0] as UserEntry || null;
    }

    public async UpdateUser(user : UserEntry): Promise<boolean> {
        const sql = `UPDATE user SET username = ?, password_hash = ?, isadmin = ? WHERE id = ?;`;
        const values = [user.username, user.password_hash, user.isAdmin, user.ID];

        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);

        return results.affectedRows === 1;
    }

    public async DeleteUser(id: number): Promise<boolean> {
        const sql = `DELETE FROM user WHERE id = ?;`;
        const values = [id];

        const [results] = await this.connection.execute<ResultSetHeader>(sql, values);

        return results.affectedRows === 1;
    }

    public async GetUserByUsername(username : string) : Promise<UserEntry|null>{
        const sql = `SELECT ID, username, password_hash, isAdmin FROM user WHERE username = ?;`;
        const values = [username]
        const [results] = await this.connection.execute(sql,values);

        return results[0] as UserEntry || null;
    }
}