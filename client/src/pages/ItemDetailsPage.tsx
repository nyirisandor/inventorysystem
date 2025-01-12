
import { NewNoteForm } from "@/components/ui/itemNotes/NewNoteForm";
import { NoteEntry } from "@/components/ui/itemNotes/NoteEntry";
import { PriceHistoryChart } from "@/components/ui/itemPrices/PriceHistoryChart";
import { PriceHistoryTable } from "@/components/ui/itemPrices/PriceHistoryTable";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { getItemByID } from "@/services/itemService";
import { Item } from "@/types/item";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"



const ItemDetailsPage = () => {
    const {id} = useParams();

    const [item, setItem] = useState<Item|null>(null);
    const {toast} = useToast();

    useEffect(() => {
        if(id === undefined) return;
        getItemByID(Number.parseInt(id)).then((i) => {
            setItem(i);
        })
        .catch((err) => {
            console.error(err);
            toast({
                title: "Hiba az item betöltése közben",
                variant: "destructive"
            })
        });

    },[id]);

    return (
        <>
        <Toaster/>

        {
            item? (<>
            <h1>{item.name}</h1>
            <p>ID : {item.ID}</p>
            <p>Leírás: {item.description}</p>
            <div className="notes">
                <h2>Megjegyzések</h2>
                <NewNoteForm itemID={item.ID}/>
                {item.notes.map(x => <NoteEntry itemNote={x} key={x.ID}/>)}
            </div>
            <div className="prices">
                <h2>Árdiagram</h2>
                <PriceHistoryChart priceHistory={item.pricehistory}/>
                <PriceHistoryTable itemID={item.ID} priceHistory={item.pricehistory}/>
            </div>
            </>)
            :
            (<h1>Betöltés</h1>)
        }
        

        </>
    )
}

export default ItemDetailsPage