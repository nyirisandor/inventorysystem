import { Input } from "../input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../form"
import { Button } from "../button";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { uploadDocument } from "@/services/uploadedDocumentService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../dialog";
import { AxiosProgressEvent } from "axios";
import { Progress } from "../progress";
import { Label } from "../label";
import { icons } from "lucide-react";
import { DocumentEntryReducerActionType, useDocumentReducerContext } from "@/hooks/documentEntryReducer";

const formSchema = z.object({
    title : z.string(),
    description : z.string(),
    fileName : z.string(),
    file : z.instanceof(File)
})


export const DocumentUploadDialog = ({openState} : {openState? : [isOpen : boolean, setOpen :React.Dispatch<React.SetStateAction<boolean>>]}) =>{

    const [uploadedDocuments, uploadedDocumentsDispatch] = useDocumentReducerContext();

    const [isOpen,setOpen] = openState || useState<boolean>(false);

    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [uploadProgress,setUploadProgress] = useState<AxiosProgressEvent|null>();

    const cancelFunctionRef = useRef<Function>();

    useEffect(() => {
        form.reset();
        setFileInputValue("");
        setUploadProgress(null);
        setIsUploading(false);

        if(!isOpen && isUploading && cancelFunctionRef.current){
            cancelFunctionRef.current();
        }
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
        setIsUploading(true);
        uploadDocument({
            values,
            onProgress: (progressEvent: AxiosProgressEvent) => {
                    setUploadProgress(progressEvent);
            },
            cancelFunctionRef : cancelFunctionRef
        })
        .then((res) => {
            uploadedDocumentsDispatch({
                type : DocumentEntryReducerActionType.CREATED_DOCUMENT,
                data : [res]
            })
            form.reset();
            setFileInputValue("");
            setOpen(false);
        })
        .catch(() => {
            setUploadProgress(null);
            setIsUploading(false);
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
                                        <Input disabled={isUploading} placeholder="név" {...field}/>
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
                                        <Input disabled={isUploading} placeholder="Leírás" {...field}/>
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
                                        <Input disabled={isUploading} placeholder={form.getValues().file?.name || "Fájl neve"} {...field}/>
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
                                        disabled={isUploading}
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
                        <Button type="submit" disabled={isUploading}>Feltöltés</Button>
                    </form>
                </Form>
                    {(isUploading) ?
                        <>
                            <Progress value={(uploadProgress?.progress || 0)*100 }/>
                            <Label>{((uploadProgress?.progress || 0)*100).toFixed(0)}%</Label>
                            <Button onClick={() => {if(cancelFunctionRef.current) cancelFunctionRef.current()}}>
                                <icons.X/>
                            </Button>
                        </>
                        :
                        null
                    }
            </DialogContent>
        </Dialog>
    </>
}