import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table"
import { UploadedDocumentEntry } from "@/types/uploadeddocument"
import { Toaster } from "../toaster";
import { icons } from "lucide-react";
import { Button } from "../button";
import useDownloader from "react-use-downloader"
import { toast } from "@/hooks/use-toast";
import { Progress } from "../progress";
import { Label } from "../label";


export const DocumentTable = () =>{

    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocumentEntry[]>([]);

    useEffect(() => {
        updateDocuments();
    },[]);

    function updateDocuments(){
        fetch("/api/documents").then(res => {
            if(res.status == 200){
                return res.json();
            }
        })
        .then(json => {
            setUploadedDocuments(json);
        })
      }

    
    function deleteDocument(documentID : number){
        fetch(`/api/documents/${documentID}`,{
            method : "DELETE"
        }).then(res => {
            return res.json();
        })
        .then(json => {
            console.log(json);
            updateDocuments();
        })
      }


    const DownloadButton = ({targetDocument} : {targetDocument : UploadedDocumentEntry}) => {

        const {
            size,
            elapsed,
            percentage,
            download,
            cancel,
            error,
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
                <Button disabled={targetDocument.size == null || targetDocument.size ==0} onClick={() => {download(`/api/documents/${targetDocument.ID}/download`,targetDocument.url)}}>
                    <icons.Download/>
                </Button>
            </>)
        }
    }


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

                    <TableRow key={doc.ID}>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>{doc.description}</TableCell>
                        <TableCell>{doc.url}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>{doc.warning}</TableCell>
                        <TableCell>
                            <DownloadButton targetDocument={doc}/>
                        </TableCell>

                        <TableCell>
                            <Button onClick={() => deleteDocument(doc.ID)}>
                                <icons.Trash/>
                            </Button>
                        </TableCell>
                    </TableRow>


                ))}
            </TableBody>
        </Table>
    </>
}