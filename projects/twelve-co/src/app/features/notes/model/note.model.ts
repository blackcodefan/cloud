// todo remove optional from id field and media content
import { RoleEnum } from 'core-lib';

export interface Note {
    id?: string;
    title: string;
    content: string;
    mediaContent?: Array<NoteBlobData>;
    members?: Array<NoteParticipantData>;
}

export interface NoteBlobData {
    id: string;
    type: NoteBlobDataEnum;
    content?: any;
}

export enum NoteBlobDataEnum {
    IMAGE = 'IMAGE', VIDEO = 'VIDEO'
}

interface NoteParticipantData {
    id: string | number;
    name: string;
    role: RoleEnum;

}

export interface NoteSave {
    attachments: Array<File>;
    title: string;
    content: string;
    members: Array<NoteSaveMember>;
}

export interface NoteSaveMember {
    id?: number;
    email: string;
}
