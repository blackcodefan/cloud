export interface Email {
    id: string;
    body: string;
    name: string;
    title: string;
    sender: string;
    chain: number;
    date: string;
    star: boolean;
    read: boolean;
    checked: boolean;
    attachmentSize: number;
}


export interface SentEmail {
    id: string;
    receiver: string;
    copy: number;
    chain: number;
    title: string;
    body: string;
    attachmentSize: number;
    date: string;
    star: boolean;
    checked: boolean;
}