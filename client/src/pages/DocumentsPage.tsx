import { DocumentTable } from "@/components/ui/documents/DocumentTable"
import { DocumentEntryReducerActionType, DocumentEntryReducerContext, reducer } from "@/hooks/documentEntryReducer"
import { getUploadedDocuments } from "@/services/uploadedDocumentService";
import { useEffect, useReducer } from "react"

const DocumentsPage = () => {

    const documentEntryReducerContext = DocumentEntryReducerContext;
    const [documentEntries, documentEntryDispatch] = useReducer(reducer,[]);

    function RefreshDocuments(){
        getUploadedDocuments()
            .then((res) => documentEntryDispatch({
                type : DocumentEntryReducerActionType.SET_DOCUMENTS,
                data : res
            }))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        RefreshDocuments();
    },[])


    return (
        <>
            <documentEntryReducerContext.Provider value={[documentEntries,documentEntryDispatch]}>
                <DocumentTable/>
            </documentEntryReducerContext.Provider>
        </>
    )
}

export default DocumentsPage