import { NextFunction, RequestHandler, Request, Response } from "express";
import config from "../config/config";
import jwt from 'jsonwebtoken'
import { User } from "../models/Models";



const authenticateUser : RequestHandler = async (req : Request , res : Response, next : NextFunction) : Promise<any> => {
    const token = req.cookies?.jwtToken || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return next()
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req['user'] = decoded;
      } catch (error) {
        
      }
    return next();
}

const requireAuthentication : RequestHandler = async (req : Request , res : Response, next : NextFunction) : Promise<any> => {
  const user = req['user'] as User | undefined;

  if(user == null){
    return res.status(401).json({ message: 'Not authenticated' });
  }

  return next();
}

const requireAdminOrUserID : RequestHandler = async (req : Request , res : Response, next : NextFunction) : Promise<any> => {
  const user = req['user'] as User | undefined;

  const userid = Number.parseInt(req.params.userID);

  if(user && (user.isAdmin || (!isNaN(userid) && userid == user.ID)))
    return next();
  else{
    return res.status(403).json({ message: 'Forbidden' })
  }
} 

const requireAdmin : RequestHandler = async (req : Request , res : Response, next : NextFunction) : Promise<any> => {
  const user = req['user'] as User | undefined;

  if(user && user.isAdmin)
    return next();
  else{
    return res.status(403).json({ message: 'Forbidden' })
  }
} 

export {authenticateUser, requireAuthentication, requireAdminOrUserID, requireAdmin}