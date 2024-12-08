import { useRef, useState } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "../context-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table"
import { ItemDialog } from "./ItemDialog"
import { deleteItem } from "@/services/itemService";
import { Item } from "@/types/item";
import { ItemReducerActionType, useItemReducerContext } from "@/hooks/itemReducer";
import { Toaster } from "../toaster";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";



export const ItemTable = () => {
    const selectedItem = useRef<Item|null>(null);
    const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

    const [items, itemDispatch] = useItemReducerContext();

    const navigate  = useNavigate();

    async function deleteSelectedItem(){
      if(selectedItem.current == null || selectedItem.current.ID == null)return;
  
      deleteItem(selectedItem.current.ID).then(() =>{
        itemDispatch({
            type: ItemReducerActionType.DELETED_ITEM,
            data : [selectedItem.current as Item]
        })
        toast({
            title : "Item törölve"
        })
      })
      .catch((err) => {
        toast({
            variant : "destructive",
            title : "Hiba történt az item törlése közben"
        })
        console.error(err);
      })
    }

    function editSelectedItem(){
        setDialogOpen(true);
    }

    function openItemDetails(item : Item){
        navigate(`/item/${item.ID}`);
    }

    return (
        <>
            <Toaster/>
            <ItemDialog itemRef={selectedItem} openState={[isDialogOpen, setDialogOpen]}/>
            <ContextMenu>
                <ContextMenuTrigger>
                    <Table>
                        <TableHeader onContextMenu={(e) => e.preventDefault()}>
                            <TableRow>
                                <TableHead className='w-[100px]'>Név</TableHead>
                                <TableHead className='w-[100px]'>Leírás</TableHead>
                                <TableHead className='w-[100px]'>Típus</TableHead>
                                <TableHead className='w-[100px]'>Ár</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {items.map((item) => (

                                <TableRow key={item.ID} onContextMenu={() => selectedItem.current =item} onClick={() => openItemDetails(item)}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{item.type.ID == 0?"Nincs megadva":item.type.name}</TableCell>
                                    <TableCell>{item.latestPrice || "Nincs legutóbbi ár"}</TableCell>
                                </TableRow>


                            ))}
                        </TableBody>
                    </Table>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuLabel>{selectedItem.current?.name}</ContextMenuLabel>
                    <ContextMenuItem inset onClick={() => {
                        if(selectedItem.current)
                            openItemDetails(selectedItem.current)
                    }}>Részletek</ContextMenuItem>
                    <ContextMenuItem inset onClick={editSelectedItem}>Szerkesztés</ContextMenuItem>
                    <ContextMenuItem inset onClick={deleteSelectedItem}>Törlés</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </>)
}