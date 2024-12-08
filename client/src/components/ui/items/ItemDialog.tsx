import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createItem, getItemTypes, updateItemEntry } from "@/services/itemService"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {z} from "zod"
import { MutableRefObject, useEffect, useRef, useState } from "react"
import { ItemType } from "@/types/itemtype"
import { ItemReducerActionType, useItemReducerContext } from "@/hooks/itemReducer"
import { Item, ItemEntry } from "@/types/item"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "../toaster"
const formSchema = z.object({
  name : z.string().min(1).max(50),
  description : z.string().min(0).max(250),
  typeID : z.nullable(z.number().or(z.string()).pipe(z.coerce.number())),
});

type ItemDialogParameters = {
  itemRef : MutableRefObject<Item|null> | null,
  openState : [isOpen : boolean, setOpen :React.Dispatch<React.SetStateAction<boolean>>] | null
}
 
export function ItemDialog({itemRef,openState} : ItemDialogParameters) {
  const [itemTypes,setItemTypes] = useState<ItemType[]>([]);
  const [, itemDispatch] = useItemReducerContext();

  const [isOpen,setOpen] = openState || useState<boolean>(false);
  const currentItemRef = itemRef || useRef<Item|null>(null)

  const { toast } = useToast();

  useEffect(() => {
    getItemTypes().then((r) => {
      setItemTypes(r);
    }).catch((e) => {
      console.error("Error while fetching item types:", e);
    })
  },[]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues : {
      name : "",
      description : "",
      typeID : null
    }
  });

  useEffect(() => {
    if(isOpen == false) return;

    const item = currentItemRef.current;

    if(item == null){
      form.reset({
        name : "",
        description : "",
        typeID : null
      });
    }
    else{
      form.reset({
        name : item.name,
        description : item.description,
        typeID : item.type.ID
      })
    }
    
  },[isOpen])


  function onSubmit(values: z.infer<typeof formSchema>){
    if(currentItemRef.current && currentItemRef.current.ID){
      const itemEntry = values as ItemEntry;
      itemEntry.ID = currentItemRef.current.ID;
      updateItemEntry(itemEntry).then(createdItemEntry => {
        itemDispatch({
          type : ItemReducerActionType.UPDATED_ITEM,
          data : [{
            ID : createdItemEntry.ID,
            name : createdItemEntry.name,
            description : createdItemEntry.description,
            type : itemTypes.find(x => x.ID == createdItemEntry.typeID) || {name : "invalid type", ID : createdItemEntry.typeID}
          } as Item]
        });
        setOpen(false)
        toast({
          title : "Item frissítve!",
          description: createdItemEntry.name,
        });
      })
      .catch(err => {
        toast({
          variant : "destructive",
          title : "Hiba történt az item frissítése közben!"
        });
        console.error(err);
      });
    }
    else{
      createItem(values).then(createdItemEntry => {
      
        itemDispatch({
          type : ItemReducerActionType.CREATED_ITEM,
          data : [{
            ID : createdItemEntry.ID,
            name : createdItemEntry.name,
            description : createdItemEntry.description,
            type : itemTypes.find(x => x.ID == createdItemEntry.typeID) || {name : "invalid type", ID : createdItemEntry.typeID}
          } as Item]
        });
        setOpen(false)
        toast({
          title : "Item létrehozva!",
          description: createdItemEntry.name,
        });
      })
      .catch(err => {
        toast({
          variant : "destructive",
          title : "Hiba történt az item létrehozása közben!"
        });
        console.error(err);
      })
    }
  }


  return (
    <Dialog open = {isOpen} onOpenChange={setOpen}>
      <Toaster/>
      <DialogTrigger asChild>
        <Button onClick={() => currentItemRef.current = null}>Új item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
                  <DialogTitle>{currentItemRef.current?"Item módosítása":"Új item létrehozása"}</DialogTitle>
                  <DialogDescription></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit,(err) => console.error(err))}>
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Item neve</FormLabel>
                  <FormControl>
                    <Input placeholder="név" {...field} />
                  </FormControl>
                </FormItem>
              )
              }
            />

            <FormField
              control={form.control}
              name="description"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Leírás</FormLabel>
                  <FormControl>
                    <Textarea placeholder="leírás" {...field} />
                  </FormControl>
                </FormItem>
              )
              }
            />

            <FormField
              control={form.control}
              name="typeID"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Kategória</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder = "Kategória megadása"></SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Nincs megadva</SelectItem>
                        {itemTypes.map((itemType) => {
                          return (
                            <SelectItem key={itemType.ID} value={itemType.ID.toString()}>{itemType.name}</SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )
              }
            />

            <DialogFooter>
                <Button type="submit">{currentItemRef.current?"Mentés":"Létrehozás"}</Button>
            </DialogFooter>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}