import { UploadedDocumentEntry} from "@/types/uploadeddocument"
import { createContext, useContext } from "react";


export enum DocumentEntryReducerActionType {
    CREATED_DOCUMENT,
    UPDATED_DOCUMENT,
    DELETED_DOCUMENT,
    SET_DOCUMENTS
}

type DocumentEntryReducerAction = {
    type : DocumentEntryReducerActionType,
    data : UploadedDocumentEntry[]
}


export const reducer = (state : UploadedDocumentEntry[],action : DocumentEntryReducerAction) : UploadedDocumentEntry[] => {
    
    switch (action.type) {
        case DocumentEntryReducerActionType.CREATED_DOCUMENT:
            return [...state,...action.data];
        case DocumentEntryReducerActionType.UPDATED_DOCUMENT:
            return state.map((entry) => {
                let match = action.data.find(x => x.ID == entry.ID);
                if(match) return match;
                else return entry;
            })
        case DocumentEntryReducerActionType.DELETED_DOCUMENT:
            return state.filter(entry => !action.data.map(x => x.ID).includes(entry.ID));
        case DocumentEntryReducerActionType.SET_DOCUMENTS:
            return action.data;
        default:
            throw new Error("Invalid action");
    }
}

export const DocumentEntryReducerContext = createContext<[UploadedDocumentEntry[],React.Dispatch<DocumentEntryReducerAction>] | undefined>(undefined);

export const useDocumentReducerContext = () =>{
    const context = useContext(DocumentEntryReducerContext);
    
    if(context === undefined){
        throw new Error("DocumentEntryReducerContext is undefined");
    }

    return context;
}