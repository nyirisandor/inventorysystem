import { useRef, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table"
import { UploadedDocumentEntry } from "@/types/uploadeddocument"
import { Toaster } from "../toaster";
import { icons } from "lucide-react";
import { Button } from "../button";
import useDownloader from "react-use-downloader"
import { Progress } from "../progress";
import { Label } from "../label";
import { deleteDocument } from "@/services/uploadedDocumentService";
import { DocumentEntryReducerActionType, useDocumentReducerContext } from "@/hooks/documentEntryReducer";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { DocumentEditDialog } from "./DocumentEditDialog";


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



const DocumentTableRow = ({documentEntry, onEditClicked} : {documentEntry : UploadedDocumentEntry, onEditClicked? : Function}) => {

    const [uploadedDocuments, uploadedDocumentsDispatch] = useDocumentReducerContext();

    function deleteDocumentLine(){
        deleteDocument(documentEntry.ID)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                uploadedDocumentsDispatch({
                    type : DocumentEntryReducerActionType.DELETED_DOCUMENT,
                    data : [documentEntry]
                })
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
                <Button onClick={() => {if(onEditClicked) onEditClicked()}}>
                    <icons.Pencil/>
                </Button>

                <Button onClick={() => deleteDocumentLine()}>
                    <icons.Trash/>
                </Button>
            </TableCell>
        </TableRow>
    )
}


export const DocumentTable = () =>{

    const [uploadedDocuments, uploadedDocumentsDispatch] = useDocumentReducerContext();

    const selectedDocumentRef = useRef<UploadedDocumentEntry|null>(null);
    const [isUploadDialogOpen,setUploadDialogOpen] = useState<boolean>(false)
    const [isEditDialogOpen,setEditDialogOpen] = useState<boolean>(false)

    function openPopupforDocument(doc : UploadedDocumentEntry){
        selectedDocumentRef.current = doc;
        setEditDialogOpen(true);
    }

    function openPopupforNew(){
        setUploadDialogOpen(true);
    }


    return <>
        <Toaster/>
        <DocumentUploadDialog openState={[isUploadDialogOpen,setUploadDialogOpen]}/>
        <DocumentEditDialog openState={[isEditDialogOpen,setEditDialogOpen]} documentRef={selectedDocumentRef}/>
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
                    <DocumentTableRow key={doc.ID} documentEntry={doc} onEditClicked={() => {openPopupforDocument(doc)}}/>
                ))}
                <TableRow>
                    <TableCell colSpan={10} align="center">
                        <Button onClick={openPopupforNew}>
                            <icons.Plus/>
                        </Button>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </>
}