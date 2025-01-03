import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection } from 'mysql2/promise';
import morgan from 'morgan'
import ItemHandler from './handlers/itemHandler';
import ItemNoteHandler from './handlers/itemNoteHandler';
import ItemPriceHandler from './handlers/itemPriceHandler';
import ItemTypeHandler from './handlers/itemTypeHandler';
import UserHandler from './handlers/userHandler';
import config from './config/config';
import { authenticateUser, requireAdmin, requireAdminOrUserID, requireAuthentication } from './middlewares/userMiddleware';
import cookieParser from 'cookie-parser';
import DocumentHandler from './handlers/documentHandler';
import FileUpload from 'express-fileupload'

const app = express();

const mysqlConnection = await createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port
});

const logger = morgan('dev');

const api = express.Router();

api.use(cors());
api.use(bodyParser.json());
api.use(logger);
api.use(cookieParser())
api.use(authenticateUser);
api.use(FileUpload());

const itemHandler = new ItemHandler(mysqlConnection);
const itemNoteHandler = new ItemNoteHandler(mysqlConnection);
const itemPriceHandler = new ItemPriceHandler(mysqlConnection);
const itemTypeHandler = new ItemTypeHandler(mysqlConnection);
const userHandler = new UserHandler(mysqlConnection);
const documentHandler = new DocumentHandler(mysqlConnection);

const itemRouter = express.Router();
itemRouter.get("/",itemHandler.getAllItems);
itemRouter.get("/:id",itemHandler.getItemByID);
itemRouter.post("/",requireAdmin,itemHandler.createItem);
itemRouter.put("/:id",requireAdmin,itemHandler.updateItemByID);
itemRouter.delete("/:id",requireAdmin,itemHandler.deleteItemByID);

itemRouter.get("/:itemID/notes",itemNoteHandler.getNotesByItemID);
itemRouter.post("/:itemID/notes",itemNoteHandler.createNoteForItemID);

itemRouter.get("/:itemID/prices",itemPriceHandler.getItemPricesByItemID);
itemRouter.post("/:itemID/prices",itemPriceHandler.createItemPriceForItemID);
itemRouter.get("/:itemID/latestPrice",itemPriceHandler.getLatestItemPriceByItemID);

const itemNoteRouter = express.Router();
itemNoteRouter.get("/:id",itemNoteHandler.getNoteByID);
itemNoteRouter.put("/:id",itemNoteHandler.updateNoteByID);
itemNoteRouter.delete("/:id",itemNoteHandler.deleteNoteByID);

const itemPriceRouter = express.Router();
itemPriceRouter.get("/:id",itemPriceHandler.getItemPriceByID);
itemPriceRouter.put("/:id",itemPriceHandler.updateItemPriceByID);
itemPriceRouter.delete("/:id",itemPriceHandler.deleteItemPriceByID);

const itemTypeRouter = express.Router();
itemTypeRouter.get("/",itemTypeHandler.getItemTypeEntries);
itemTypeRouter.post("/",itemTypeHandler.createItemTypeEntry);
itemTypeRouter.get("/:id",itemTypeHandler.getItemTypeEntryByID);
itemTypeRouter.put("/:id",itemTypeHandler.updateItemTypeEntryByID);
itemTypeRouter.delete("/:id",itemTypeHandler.deleteItemTypeEntryByID);

const userRouter = express.Router();
userRouter.get("/",userHandler.getCurrentUser);
userRouter.post("/login",userHandler.loginUser);
userRouter.post("/register",userHandler.registerUser);
userRouter.delete("/:userid",requireAdminOrUserID,userHandler.deleteUser);
userRouter.put("/:userid",requireAdminOrUserID,userHandler.updateUser);
userRouter.post("/logout",userHandler.logoutUser);


const documentRouter = express.Router();
documentRouter.get("/",documentHandler.getAllDocumentEntries);
documentRouter.post("/upload",documentHandler.uploadDocument);
documentRouter.put("/:id",documentHandler.updateDocumentEntryByID);
documentRouter.delete("/:id",documentHandler.deleteDocumentByID);

documentRouter.get("/:id/download",documentHandler.downloadDocumentByID);

api.use('/items',itemRouter);
api.use('/itemNotes',itemNoteRouter);
api.use('/itemPrices',itemPriceRouter);
api.use('/itemTypes',itemTypeRouter);
api.use('/user',userRouter)
api.use('/documents',documentRouter);



app.use("/api",api);

const port = config.server.port

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});