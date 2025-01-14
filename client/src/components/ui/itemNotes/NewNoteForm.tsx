import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../button";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { createNote } from "@/services/itemNoteService";
import { ItemNote } from "@/types/itemnote";

const formSchema = z.object({
    title : z.string(),
    description : z.string(),
})


export function NewNoteForm({itemID, onNoteCreated} : {itemID : number, onNoteCreated? : (newNote : ItemNote) => any}) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description : ""
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>){
        const newNote = {
            itemID : itemID,
            title : values.title,
            description : values.description
        };
        await createNote(newNote).then((res) => {
            console.log(res);
            form.reset();
            if(onNoteCreated){
                onNoteCreated(res);
            }
        })
        .catch((err) => {
            console.error(err);
        });
    }

    return <>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
                control={form.control}
                name="title"
                render={({field}) => (
                    <FormItem>
                    <FormLabel>Cím</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                    <FormItem>
                    <FormLabel>Leírás</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
            />
            <Button type="submit">Mentés</Button>
            </form>
        </Form>
    </>
}