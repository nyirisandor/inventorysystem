import { ItemPrice } from "@/types/itemprice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { CalendarIcon, icons } from "lucide-react";
import { Button } from "../button";
import { useEffect, useRef, useState } from "react";
import { Input } from "../input";
import { Calendar } from "../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createPriceEntry, deletePriceEntry, updatePriceEntry } from "@/services/itemPriceService";



function PriceHistoryTableRow({priceEntry, onDeleteCallback, onUpdateCallback} : {priceEntry : ItemPrice, onDeleteCallback? : (ID : number | null) => any, onUpdateCallback? : (newVal : ItemPrice) => any}){

    const [isEditing,setIsEditing] = useState<boolean>(false);
    
    const priceEntryRef = useRef(priceEntry);
    
    const [date, setDate] = useState<Date|null|undefined>(priceEntry.date);
    const [amount, setAmount] = useState<number>(priceEntry.amount);
    const [currency, setCurrency] = useState<string>(priceEntry.currency);

    async function save(){
        const newEntry : ItemPrice = priceEntryRef.current;

        newEntry.amount = amount;
        newEntry.currency = currency;

        if(date)
            newEntry.date = date;

        if(priceEntryRef.current.ID != null){
            updatePriceEntry(newEntry).then((res) => {
                priceEntryRef.current = res;
                setIsEditing(false);
                if(onUpdateCallback){
                    onUpdateCallback(res);
                }
            })
            .catch((err) => {
                console.error(err);
            });
        }
        else{
            createPriceEntry(newEntry).then((res) => {
                priceEntryRef.current = res;
                setIsEditing(false);
                if(onUpdateCallback){
                    onUpdateCallback(res);
                }
            })
            .catch((err) => {
                console.error(err);
            });
        }

    }   
    
    async function onDelete(){
        if(priceEntryRef.current.ID){
            deletePriceEntry(priceEntryRef.current.ID).then(() => {
                if(onDeleteCallback){
                    onDeleteCallback(priceEntryRef.current.ID);
                }
            })
            .catch((err) => {
                console.error(err);
            });
        }
    }

    function onCancelEdit(){
        setIsEditing(false);
        if(priceEntryRef.current.ID == null && onDeleteCallback){
            onDeleteCallback(priceEntryRef.current.ID);
        }
    }

    return <>
         <TableRow>
            {
            isEditing||priceEntryRef.current.ID==null?
            <>
                <TableCell>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={date??new Date()}
                                onSelect={setDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                </TableCell>
                <TableCell>
                    <Input type="number" defaultValue={amount} onChange={(ev) => setAmount(Number.parseFloat(ev.target.value))}/>
                    
                    <Input type="string" defaultValue={currency} onChange={(ev) => setCurrency(ev.target.value)}/>
                </TableCell>
                <TableCell>
                    <Button onClick={save}>
                        <icons.Save/>
                    </Button>
                    <Button onClick={onCancelEdit}>
                        <icons.X/>
                    </Button>
                </TableCell>
            </>
            :
            <>
                <TableCell>{date?.toDateString()}</TableCell>
                <TableCell>{amount} {currency}</TableCell>
                <TableCell>
                    <Button onClick={() => setIsEditing(true)}>
                        <icons.Wrench/>
                    </Button>
                    <Button onClick={onDelete}>
                        <icons.Trash/>
                    </Button>
                </TableCell>
            </>
        
            }


        </TableRow>
    </>
}



export function PriceHistoryTable({priceHistory,itemID, onPricesChanged} : {priceHistory : ItemPrice[], itemID : number, onPricesChanged? : (newPrices : ItemPrice[]) => any}) {

    const [prices,setPrices] = useState<ItemPrice[]>(priceHistory);

    useEffect(() => {
        if(onPricesChanged){
            onPricesChanged(prices.filter(x => x.ID != null));
        }
    },[prices]);
    
    function onNewRow(){
        if(prices.every(x => x.ID != null)){
            const newPrice : ItemPrice = {
                ID : null,
                itemID : itemID,
                amount : 0,
                currency : "",
                date : null
            };
    
            setPrices([...prices,newPrice]);
        }
    }

    function onRowDeleted(rowID : number|null){
        const newPrices = prices.filter(x => x.ID != rowID);
        setPrices(newPrices);
    }

    function onRowEdited(rowData : ItemPrice){
        var newPrices = prices;
        if(prices.find(x => x.ID == rowData.ID) != null){
            newPrices = prices.map(x => x.ID == rowData.ID?rowData:x)
        }
        else{
            newPrices = prices.map(x => x.ID == null?rowData:x)
        }

        newPrices = newPrices.sort((a,b) => (a.date?.getTime()||0) - (b.date?.getTime()||0));
        setPrices(newPrices);
    }

    return <>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className='w-[100px]'>Dátum</TableHead>
                    <TableHead className='w-[100px]'>Ár</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    prices.map(x => 
                        <PriceHistoryTableRow priceEntry={x} key={x.ID} onDeleteCallback={onRowDeleted} onUpdateCallback={onRowEdited}/>
                    )
                }
                    <TableRow key="new">
                        <TableCell colSpan={3} align="center">
                            <Button onClick={onNewRow}>
                                <icons.Plus/>
                            </Button>
                        </TableCell>
                    </TableRow>
            </TableBody>
        </Table>
    </>
}