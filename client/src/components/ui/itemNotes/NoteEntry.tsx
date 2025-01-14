import { deleteNote, updateNote } from "@/services/itemNoteService";
import { ItemNote } from "@/types/itemnote";
import { Button } from "../button";
import { icons } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../form";
import { Input } from "../input";
import { Textarea } from "../textarea";

const formSchema = z.object({
    title : z.string(),
    description : z.string(),
})


export function NoteEntry({itemNote, onNoteChanged, onNoteDeleted} : {itemNote : ItemNote, onNoteChanged? : (newNote : ItemNote) => any, onNoteDeleted? : (noteID : number) => any}) {

    const [isEditing,setIsEditing] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: itemNote.title,
            description : itemNote.description
        }
    });


    async function onSubmit(values: z.infer<typeof formSchema>){
        itemNote.title = values.title;
        itemNote.description = values.description;

        await updateNote(itemNote).then((res) => {
            console.log(res);
            setIsEditing(false);
            form.reset({
                title: itemNote.title,
                description : itemNote.description
            });
            if(onNoteChanged){
                onNoteChanged(res);
            }
        })
        .catch((err) => {
            console.error(err);
        });
    }


    async function onDeleteClicked(){
        deleteNote(itemNote.ID).then((res) => {
            console.log(res);
            if(onNoteDeleted){
                onNoteDeleted(itemNote.ID);
            }
        })
        .catch((err) => {
            console.error(err);
        })
    }

    function onEditClicked(){
        form.reset();
        setIsEditing(true)
    }

    



    return <>
        <div className="noteEntry">
            {
                isEditing?
                <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}> 
                        <h2 className="font-bold">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({field}) => (
                                    <FormItem>
                                    <FormControl>
                                    <Input {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                                )}
                            />
                        </h2>
                        <pre className="relative">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({field}) => (
                                    <FormItem>
                                    <FormControl>
                                    <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                                )}
                            />
                        </pre>
                        <Button onClick={() => {setIsEditing(false)}}><icons.X/></Button>
                        <Button type="submit"><icons.Save/></Button>
                        </form>
                    </Form>
                </>
                :
                <>
                    <h2 className="font-bold">{itemNote.title}</h2>
                    <pre className="relative left-5">{itemNote.description}</pre>
                    <Button onClick={onEditClicked}><icons.Pencil/></Button>
                    <Button onClick={onDeleteClicked}><icons.Trash/></Button>
                </>
            }
        </div>
    </>
}