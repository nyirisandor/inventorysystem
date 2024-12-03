import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
import morgan from 'morgan'
import ItemHandler from './handlers/itemHandler';
import ItemNoteHandler from './handlers/itemNoteHandler';
import ItemPriceHandler from './handlers/itemPriceHandler';
import ItemTypeHandler from './handlers/itemTypeHandler';

dotenv.config();

const app = express();
const port = process.env.port || 3000;

const mysqlConnection = await createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined
});

const logger = morgan('dev');

app.use(cors());
app.use(bodyParser.json());
app.use(logger);


const itemHandler = new ItemHandler(mysqlConnection);
const itemNoteHandler = new ItemNoteHandler(mysqlConnection);
const itemPriceHandler = new ItemPriceHandler(mysqlConnection);
const itemTypeHandler = new ItemTypeHandler(mysqlConnection);

const itemRouter = express.Router();
itemRouter.get("/",itemHandler.getAllItems);
itemRouter.get("/:id",itemHandler.getItemByID);
itemRouter.post("/",itemHandler.createItem);
itemRouter.put("/:id",itemHandler.updateItemByID);
itemRouter.delete("/:id",itemHandler.deleteItemByID);

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


app.use('/items',itemRouter);
app.use('/itemNotes',itemNoteRouter);
app.use('/itemPrices',itemPriceRouter);
app.use('/itemTypes',itemTypeRouter);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});