import { ItemPrice } from "@/types/itemprice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { CalendarIcon, icons } from "lucide-react";
import { Button } from "../button";
import { useState } from "react";
import { Input } from "../input";
import { Calendar } from "../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createPriceEntry, deletePriceEntry, updatePriceEntry } from "@/services/itemPriceService";



function PriceHistoryTableRow({priceEntry} : {priceEntry : ItemPrice}){

    const [isEditing,setIsEditing] = useState<boolean>(false);
    
    const [date, setDate] = useState<Date|null|undefined>(priceEntry.date);
    const [amount, setAmount] = useState<number>(priceEntry.amount);
    const [currency, setCurrency] = useState<string>(priceEntry.currency);

    async function save(){
        const newEntry : ItemPrice = priceEntry;

        newEntry.amount = amount;
        newEntry.currency = currency;

        if(date)
            newEntry.date = date;

        if(priceEntry.ID != null){
            updatePriceEntry(newEntry).then((res) => {
                console.log(res);
                setIsEditing(false);
            })
            .catch((err) => {
                console.error(err);
            });
        }
        else{
            createPriceEntry(newEntry).then((res) => {
                priceEntry = res;
                console.log(res);
                setIsEditing(false);
            })
            .catch((err) => {
                console.error(err);
            });
        }

    }   
    
    async function onDelete(){
        if(priceEntry.ID){
            deletePriceEntry(priceEntry.ID).then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.error(err);
            });
        }
    }

    return <>
         <TableRow>
            {
            isEditing||priceEntry.ID==null?
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
                    <Button onClick={() => setIsEditing(false)}>
                        <icons.X/>
                    </Button>
                </TableCell>
            </>
            :
            <>
                <TableCell>{priceEntry.date?.toDateString()}</TableCell>
                <TableCell>{priceEntry.amount} {priceEntry.currency}</TableCell>
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



export function PriceHistoryTable({priceHistory,itemID} : {priceHistory : ItemPrice[], itemID : number}) {

    const [prices,setPrices] = useState<ItemPrice[]>(priceHistory);
    
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
                        <PriceHistoryTableRow priceEntry={x} key={x.ID}/>
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