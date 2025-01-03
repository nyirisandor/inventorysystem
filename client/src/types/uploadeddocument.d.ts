export interface UploadedDocumentEntry {
    ID : number;
    url : string;
    title : string;
    description : string;
    size : number;
    warning : string | null;
}