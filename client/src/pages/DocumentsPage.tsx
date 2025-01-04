import { DocumentEditDialog } from "@/components/ui/documents/DocumentEditDialog"
import { DocumentTable } from "@/components/ui/documents/DocumentTable"
import { DocumentUploadDialog } from "@/components/ui/documents/DocumentUploadDialog"
import { UploadedDocumentEntry } from "@/types/uploadeddocument"
import { useRef, useState } from "react"

const DocumentsPage = () => {

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

    return (
        <>
            <DocumentUploadDialog openState={[isUploadDialogOpen,setUploadDialogOpen]}/>
            <DocumentEditDialog openState={[isEditDialogOpen,setEditDialogOpen]} documentRef={selectedDocumentRef}/>
            <DocumentTable onRowEditing={openPopupforDocument} onNewRow={openPopupforNew}/>
        </>
    )
}

export default DocumentsPage