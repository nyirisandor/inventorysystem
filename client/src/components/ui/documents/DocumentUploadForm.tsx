import { Input } from "../input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../form"
import { Button } from "../button";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";


const formSchema = z.object({
    title : z.string(),
    description : z.string(),
    fileName : z.string(),
    file : z.instanceof(File)
})


export const DocumentUploadForm = () =>{
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


        const formData = new FormData();

        if(values.title.length > 0){
            formData.append("title",values.title);
        }

        formData.append("description",values.description);

        if(values.fileName.length > 0){
            formData.append("fileName",values.fileName);
        }



        const buffer = await values.file.text();
        formData.append("file",new Blob([buffer]),values.file.name);
        
        const res = await fetch("/api/documents/upload",{
            method : "POST",
            body : formData,
        })
        
        if(res.status == 200){
            form.reset();
            setFileInputValue("");
        }
        else{
            console.log(await res.json());
        }
    }


    return <>
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
    </>
}