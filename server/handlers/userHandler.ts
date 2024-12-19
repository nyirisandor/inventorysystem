import { Request, Response, RequestHandler} from "express";
import { Connection } from "mysql2/promise";
import UsersDataAccess from "../dataAccess/UserDataAccess";
import { UserEntry } from "../models/DatabaseModel";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from "../config/config";
import ms from "ms"


export default class UserHandler{
    private userDataAccess : UsersDataAccess;


    constructor(mysqlConnection : Connection) {
        this.userDataAccess = new UsersDataAccess(mysqlConnection);       
    }

    public getAllUsers : RequestHandler = async (req : Request , res : Response) : Promise<any> => {
        try{
            const users : UserEntry[] = await this.userDataAccess.GetUsers();
            const returnedUsers = users as object[];
            returnedUsers.forEach(x => delete x["password_hash"]);
            return res.status(200).json(returnedUsers);
        }catch(e){
            console.error('Error fetching items:', e);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public logoutUser : RequestHandler = async (req : Request, res : Response) : Promise<any> => {
        return res.clearCookie('jwtToken').status(200).send();
    }

    public updateUser : RequestHandler = async (req : Request , res : Response) : Promise<any> => {
        try{
            const userID = Number.parseInt(req.params.userID);

            const userData = await this.userDataAccess.GetUserByID(userID);

            if(!userID || isNaN(userID) || userData == null){
                return res.status(400).json({ message: 'Invalid userID' });
            }

            if(req.body.username){
                userData.username = req.body.username;
            }
            
            if(req.body.password && req.body.password.trim().length != 0){
                userData.password_hash = await bcrypt.hash(req.body.password,10);
            }

            if(req.body.isAdmin && req['user'].isAdmin === "true"){
                userData.isAdmin = req.body.isAdmin === "true";
            }

            const success = await this.userDataAccess.UpdateUser(userData);

            if(success)
                return res.status(200);
            else
                return res.status(400).json({ message: 'User does not exist' });


        }catch(e){
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public deleteUser : RequestHandler = async (req : Request , res : Response) : Promise<any> => {
        try{
            const userID = Number.parseInt(req.params.userID);

            if(!userID || isNaN(userID)){
                return res.status(400).json({ message: 'Invalid userID' });
            }

            const success = await this.userDataAccess.DeleteUser(userID);

            if(userID == req['user']['id']){
                res.clearCookie('jwtToken');
            }

            if(success)
                return res.status(200)
            else
                return res.status(400).json({ message: 'User does not exist' });


        }catch(e){
            return res.status(500).json({ message: 'Server error' });
        }
    }

    public registerUser : RequestHandler = async (req : Request , res : Response) : Promise<any> => {
        try {
            const {username,password} = req.body;

            if(username == null || username.trim().length == 0){
                return res.status(400).json({ message: 'Username cannot be empty' });
            }

            if(password == null || password.trim().length == 0){
                return res.status(400).json({ message: 'Password cannot be empty' });
            }

            let user = {
                username : username,
                password_hash : await bcrypt.hash(password,10),
                isAdmin : false
            } as UserEntry;

            user = await this.userDataAccess.CreateUser(user);

            const returnedUser = user as object;
            delete returnedUser['password_hash'];

            const jwtToken = jwt.sign(returnedUser,config.jwt.secret,{
                expiresIn : config.jwt.expiration
            });

            return res.status(201)
                .cookie('jwtToken',jwtToken,{
                    maxAge : ms(config.jwt.expiration)
                })
                .json({
                    message : "User registered successfully",
                    token : jwtToken
                });
        }
        catch(err){
            if(err.code == "ER_DUP_ENTRY"){
                return res.status(500).json({
                    message : "Username already exists"
                });
            }

            return res.status(500).json({
                message : "Server error"
            });

            
        }
    }

    public loginUser : RequestHandler = async (req : Request , res : Response) : Promise<any> => {
        try {
            const {username,password} = req.body;

            if(username == null || username.trim().length == 0){
                return res.status(400).json({ message: 'Username cannot be empty' });
            }

            if(password == null || password.trim().length == 0){
                return res.status(400).json({ message: 'Password cannot be empty' });
            }

            const user = await this.userDataAccess.GetUserByUsername(username);

            if(user == null || !await bcrypt.compare(password,user.password_hash)){
                return res.status(400).json({
                    message : "Username or password is incorrect"
                });
            }

            const returnedUser = user as object;
            delete returnedUser['password_hash'];

            const jwtToken = jwt.sign(returnedUser,config.jwt.secret,{
                expiresIn : config.jwt.expiration
            });

            return res.status(200)
                .cookie('jwtToken',jwtToken,{
                    maxAge : ms(config.jwt.expiration),
                })
                .json({
                    message : "User logged in successfully",
                    token : jwtToken
                });
        }
        catch(err){
            return res.status(500).json({
                message : "Server error"
            });
        }
    }

    public getCurrentUser : RequestHandler = async (req : Request , res : Response) : Promise<any> => {
        const user = req['user'] || null;

        return res.status(200).json({
            user : user
        });
    }
}