import { DocumentTable } from "@/components/ui/documents/DocumentTable"
import { DocumentUploadForm } from "@/components/ui/documents/DocumentUploadForm"

const DocumentsPage = () => {

    return (
        <>
            <DocumentUploadForm/>
            <DocumentTable/>
        </>
    )
}

export default DocumentsPage