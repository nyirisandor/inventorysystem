import { Input } from "../input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../form"
import { Button } from "../button";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { UploadedDocumentEntry } from "@/types/uploadeddocument";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../dialog";
import { updateUploadedDocumentEntry } from "@/services/uploadedDocumentService";
import { DocumentEntryReducerActionType, useDocumentReducerContext } from "@/hooks/documentEntryReducer";

const formSchema = z.object({
    title : z.string(),
    description : z.string(),
    fileName : z.string()
})


export const DocumentEditDialog = ({documentRef,openState} : {documentRef? : MutableRefObject<UploadedDocumentEntry|null>, openState? : [isOpen : boolean, setOpen :React.Dispatch<React.SetStateAction<boolean>>]}) =>{

    const [uploadedDocuments, uploadedDocumentsDispatch] = useDocumentReducerContext();

    const [isOpen,setOpen] = openState || useState<boolean>(false);
    const currentDocumentRef = documentRef || useRef<UploadedDocumentEntry|null>(null);

    useEffect(() => {
        form.reset({
            title : currentDocumentRef.current?.title || "",
            description : currentDocumentRef.current?.description || "",
            fileName : currentDocumentRef.current?.url || ""
        })

    },[isOpen]);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver : zodResolver(formSchema),
        defaultValues : {
            title : "",
            description : "",
        }
    });


    async function onSubmit(values : z.infer<typeof formSchema>){
        if(!documentRef || !documentRef.current) throw new Error("Invalid document");

        documentRef.current.title = values.title;
        documentRef.current.description = values.description;
        
        updateUploadedDocumentEntry(documentRef.current)
        .then((res) => {
            setOpen(false);
            uploadedDocumentsDispatch({
                type : DocumentEntryReducerActionType.UPDATED_DOCUMENT,
                data: [res]
            })
        })
        .catch((err) => {
            console.error(err);
        })
    }


    return <>
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Dokumentum módosítása</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Név:</FormLabel>
                                    <FormControl>
                                        <Input placeholder="név" {...field}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Leírás:</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Leírás" {...field}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fileName"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Fájl neve:</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button type="submit">Mentés</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </>
}