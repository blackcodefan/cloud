import { AccountMin } from './../../../../../../../dist/core-lib/lib/model/ulla-types.d';
import { Receiver } from './receiver.model';


export interface Label {
    id: string;
    name: string;
    order: number;
    isFixed: boolean;
}

export interface LabelUpdate {
    id: string;
    name: string;
}

export interface EmailData {
    id?: string;
    subject: string;
    body: any;
    receivers: Array<Receiver>;
    receiversCc: Array<Receiver>;
    receiversBcc: Array<Receiver>;
    attachmentList?: Array<EmailAttachment>;
    created: Date;
    createdBy?: AccountMin;
    chainId?: string;
    readOn?: Date;
    invited?: boolean;
}

export interface UpdateEmailChain {
    chainId: string;
    receivers: Array<Receiver>;
}

export interface LabelCount {
    labelId: string;
    emailNo: number;
    emailNoUnread: number;
}

export interface EmailCounts {
    labelsCount: Array<LabelCount>;
}


export interface AuthenticityToken {
    authenticityToken: string;
    isValid: boolean;
}
export interface EmailDraftItem {
    id: string,
    subject: string,
    content: any,
    receivers: Array<Receiver>,
    receiversCc: Array<Receiver>,
    receiversBcc: Array<Receiver>,
    attachmentList: Array<EmailAttachment>,
    status: EmailShowStatus.Minimize | EmailShowStatus.ZoomIn | EmailShowStatus.ZoomOut | EmailShowStatus.InVisible
    date: Date,
}

export interface EmailViewItem{
    id: string,
    subject: string,
    content: string,
    attachmentList: any,
    isNew: boolean,
    senderId: number,
    sender: string,
    senderUserName: string,
    receivers: Array<any>,
    ccReceivers: Array<any>,
    bccReceivers: Array<any>,
    size: number,
    flag: string,
    date: Date,
    invite: boolean,
    inviteStatus: string,
    chainCounter: number,
    chainParentID: string,
    inCopyCounter: number,
    showDetail: boolean,
    showReceiversDetail: boolean,
    checked: boolean,
    star: boolean,
    isRead: boolean;
    readOn?: Date;
}

export enum EmailShowStatus {
    Minimize = 'Minimize',
    ZoomIn = 'ZoomIn',
    ZoomOut = 'ZoomOut',
    InVisible = 'InVisible'
}


export interface ReceiverSubmitItem {
    name: string,
    email: string
}

export interface BoxEmailItem {
    id: string,
    subject: string,
    sender: string,
    senderUserName: string,
    copyright: string,
    content: Array<BoxEmailContentItem>,
    attachment: boolean,
    attachmentList: Array<EmailAttachment>,
    submitDate: string,
    hide: boolean,
}

export interface BoxEmailContentItem {
    type: string,
    content: any;
    caretPosition: number;
}

export interface BoxEmailAttachmentFileItem {
    attachmentFileType: string,
    attachmentFileName: string,
    attachmentFileExtension: string,
    attachmentImageUrl: string,
    attachmentFileSize: string,
    attachmentFileOriginalSize: number,
    attachmentFile: any
    attachmentId: string;
}

export interface EmailAttachment {
    attachmentFileType: string,
    attachmentFileName: string,
    attachmentFileExtension: string,
    attachmentFileSize: number,
    attachmentFile: any,
    /**
     * storage attachment id
     */
    attachmentId: string;
    /**
     * email attachment id
     */
    emailAttachmentId: string | null;
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


export interface EmailReadStatus {
    emailId: string;
    isRead: boolean;
    emailLabelId: string
}

export interface EmailRead {
    emailId: string;
    isRead: boolean;
    readOn: Date;
}

