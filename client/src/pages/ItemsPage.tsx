
import { ItemTable } from "@/components/ui/items/ItemTable"
import { ItemReducerActionType, useItemReducerContext } from "@/hooks/itemReducer";
import { getItems } from "@/services/itemService";
import { useEffect } from "react"



const ItemsPage = () => {

    const [, itemDispatch] = useItemReducerContext();

    useEffect(() => {
        getItems().then((res) => {
            itemDispatch({
                type: ItemReducerActionType.SET_ITEMS,
                data : res
            });
        })
        .catch((err) => {
            console.error(err);
        });
    },[]);

    return (
        <ItemTable/>
    )
}

export default ItemsPage