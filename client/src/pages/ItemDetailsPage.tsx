
import { NewNoteForm } from "@/components/ui/itemNotes/NewNoteForm";
import { NoteEntry } from "@/components/ui/itemNotes/NoteEntry";
import { PriceHistoryChart } from "@/components/ui/itemPrices/PriceHistoryChart";
import { PriceHistoryTable } from "@/components/ui/itemPrices/PriceHistoryTable";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { getItemByID } from "@/services/itemService";
import { ItemEntry } from "@/types/item";
import { ItemNote } from "@/types/itemnote";
import { ItemPrice } from "@/types/itemprice";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"



const ItemDetailsPage = () => {
    const {id} = useParams();

    const {toast} = useToast();

    const [itemEntry,setItemEntry] = useState<ItemEntry|null>(null);
    const [notes,setNotes] = useState<ItemNote[]>([]);
    const [prices,setPrices] = useState<ItemPrice[]>([]);

    useEffect(() => {
        if(id === undefined) return;
        getItemByID(Number.parseInt(id)).then((item) => {
            const entry : ItemEntry = {
                ID : item.ID,
                name : item.name,
                description : item.description,
                typeID : item.type.ID
            };

            setItemEntry(entry);
            setNotes(item.notes);
            setPrices(item.pricehistory);
        })
        .catch((err) => {
            console.error(err);
            toast({
                title: "Hiba az item betöltése közben",
                variant: "destructive"
            })
        });

    },[id]);

    function onNoteChanged(newNote : ItemNote){
        var newNotes = notes;
        newNotes = newNotes.map(x => x.ID == newNote.ID?newNote:x);
        setNotes(newNotes);
    }

    function onNoteDeleted(id : Number){
        var newNotes = notes;
        newNotes = newNotes.filter(x => x.ID != id);
        setNotes(newNotes);
    }


    return (
        <>
        <Toaster/>

        {
            itemEntry? (<>
            <h1>{itemEntry.name}</h1>
            <p>ID : {itemEntry.ID}</p>
            <p>Leírás: {itemEntry.description}</p>
            <div className="notes">
                <h2>Megjegyzések</h2>
                <NewNoteForm itemID={itemEntry.ID} onNoteCreated={(newNote) => setNotes([...notes,newNote])}/>
                {notes.map(x => <NoteEntry itemNote={x} key={x.ID} onNoteChanged={onNoteChanged} onNoteDeleted={onNoteDeleted}/>)}
            </div>
            <div className="prices">
                <h2>Árdiagram</h2>
                <PriceHistoryChart priceHistory={prices}/>
                <PriceHistoryTable itemID={itemEntry.ID} priceHistory={prices} onPricesChanged={setPrices}/>
            </div>
            </>)
            :
            (<h1>Betöltés</h1>)
        }
        

        </>
    )
}

export default ItemDetailsPage