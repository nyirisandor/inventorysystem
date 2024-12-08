
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
            </>)
            :
            (<h1></h1>)
        }
        

        </>
    )
}

export default ItemDetailsPage