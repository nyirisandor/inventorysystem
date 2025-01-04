import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table"
import { UploadedDocumentEntry } from "@/types/uploadeddocument"
import { Toaster } from "../toaster";
import { icons } from "lucide-react";
import { Button } from "../button";
import useDownloader from "react-use-downloader"
import { Progress } from "../progress";
import { Label } from "../label";
import { getUploadedDocuments, deleteDocument } from "@/services/uploadedDocumentService";


const DownloadButton = ({documentEntry} : {documentEntry : UploadedDocumentEntry}) => {

    const {
        //size,
        //elapsed,
        percentage,
        download,
        cancel,
        //error,
        isInProgress
      } = useDownloader();



    if(isInProgress){
        return (<>
            <Progress value={percentage}></Progress>
            <Label>{percentage}%</Label>
            <Button onClick={()=>cancel()}><icons.X/></Button>
            </>);
    }
    else{
        return (<>
            <Button disabled={documentEntry.size == null || documentEntry.size ==0} onClick={() => {download(`/api/documents/${documentEntry.ID}/download`,documentEntry.url)}}>
                <icons.Download/>
            </Button>
        </>)
    }
}



const DocumentTableRow = ({documentEntry, refreshTable, onEditing} : {documentEntry : UploadedDocumentEntry, refreshTable? : Function, onEditing? : Function}) => {

    function deleteDocumentLine(){
        deleteDocument(documentEntry.ID)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                if(refreshTable != undefined){
                    refreshTable();
                }
            })
    }


    return (
        <TableRow key={documentEntry.ID}>
            <TableCell className="font-medium">{documentEntry.title}</TableCell>
            <TableCell>{documentEntry.description}</TableCell>
            <TableCell>{documentEntry.url}</TableCell>
            <TableCell>{documentEntry.size}</TableCell>
            <TableCell>{documentEntry.warning}</TableCell>
            <TableCell>
                <DownloadButton documentEntry={documentEntry}/>
            </TableCell>
            <TableCell>
                <Button onClick={() => {if(onEditing) onEditing()}}>
                    <icons.Pencil/>
                </Button>

                <Button onClick={() => deleteDocumentLine()}>
                    <icons.Trash/>
                </Button>
            </TableCell>
        </TableRow>
    )
}


export const DocumentTable = ({onRowEditing, onNewRow} : {onRowEditing? : (doc : UploadedDocumentEntry)=>any, onNewRow? : Function}) =>{

    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocumentEntry[]>([]);

    useEffect(() => {
        RefreshTableData();
    },[]);


    function RefreshTableData(){
        getUploadedDocuments()
            .then((res) => setUploadedDocuments(res))
            .catch((err) => console.error(err));
    };


    return <>
        <Toaster/>
        <Table>
            <TableHeader onContextMenu={(e) => e.preventDefault()}>
                <TableRow>
                    <TableHead className='w-[100px]'>Név</TableHead>
                    <TableHead className='w-[100px]'>Leírás</TableHead>
                    <TableHead className='w-[100px]'>Fájl</TableHead>
                    <TableHead className='w-[100px]'>Méret</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {uploadedDocuments.map((doc) => (
                    <DocumentTableRow key={doc.ID} documentEntry={doc} refreshTable={RefreshTableData} onEditing={() => {if(onRowEditing) onRowEditing(doc)}}/>
                ))}
                <TableRow>
                    <TableCell colSpan={10} align="center">
                        <Button onClick={() => {if(onNewRow) onNewRow()}}>
                            <icons.Plus/>
                        </Button>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </>
}