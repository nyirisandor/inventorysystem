import { Input } from "../input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../form"
import { Button } from "../button";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { uploadDocument } from "@/services/uploadedDocumentService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../dialog";

const formSchema = z.object({
    title : z.string(),
    description : z.string(),
    fileName : z.string(),
    file : z.instanceof(File)
})


export const DocumentUploadDialog = ({openState} : {openState? : [isOpen : boolean, setOpen :React.Dispatch<React.SetStateAction<boolean>>]}) =>{

    const [isOpen,setOpen] = openState || useState<boolean>(false);

    useEffect(() => {
        form.reset();
        setFileInputValue("");
    },[isOpen]);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver : zodResolver(formSchema),
        defaultValues : {
            title : "",
            description : "",
            fileName : "",
            file : undefined
        }
    });

    const [fileInputValue,setFileInputValue] = useState("");


    async function onSubmit(values : z.infer<typeof formSchema>){
        uploadDocument(values)
        .then(() => {
            form.reset();
            setFileInputValue("");
            setOpen(false);
        })
        .catch((err) => {
            console.error(err);
        })
    }


    return <>
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Új dokumentum feltöltése</DialogTitle>
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
                                        <Input placeholder={form.getValues().file?.name || "Fájl neve"} {...field}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />



                        <FormField
                            control={form.control}
                            name="file"
                            render={( {field : {value,onChange, ...fieldProps }}) => (
                                <FormItem>
                                    <FormLabel>Fájl:</FormLabel>
                                    <FormControl>
                                    <Input
                                        value={fileInputValue}
                                        {...fieldProps}
                                        type="file"
                                        
                                        onChange={(event) => {
                                            setFileInputValue(event.target.value);
                                            onChange(event.target.files && event.target.files[0])
                                        }}
                                    />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Feltöltés</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </>
}