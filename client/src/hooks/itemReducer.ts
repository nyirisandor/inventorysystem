import { Item } from "@/types/item"
import { createContext, useContext } from "react";


export enum ItemReducerActionType {
    CREATED_ITEM,
    UPDATED_ITEM,
    DELETED_ITEM,
    SET_ITEMS
}

type ItemReducerAction = {
    type : ItemReducerActionType,
    data : Item[]
}


export const reducer = (state : Item[],action : ItemReducerAction) : Item[] => {
    
    switch (action.type) {
        case ItemReducerActionType.CREATED_ITEM:
            return [...state,...action.data];
        case ItemReducerActionType.UPDATED_ITEM:
            return state.map((item) => {
                let match = action.data.find(x => x.ID == item.ID);
                if(match) return match;
                else return item;
            })
        case ItemReducerActionType.DELETED_ITEM:
            return state.filter(i => !action.data.map(x => x.ID).includes(i.ID));
        case ItemReducerActionType.SET_ITEMS:
            return action.data;
        default:
            throw new Error("Invalid action");
    }
}

export const ItemReducerContext = createContext<[Item[],React.Dispatch<ItemReducerAction>] | undefined>(undefined);

export const useItemReducerContext = () =>{
    const context = useContext(ItemReducerContext);
    
    if(context === undefined){
        throw new Error("ItemReducerContext is undefined");
    }

    return context;
}