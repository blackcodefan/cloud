import { Account } from 'core-lib';

export interface MessageBody {
    type: string;
    content: string;
    caretPosition: number;
}
export interface NewMessage {
  subject: string;
  body: Array<MessageBody>;
  // the id of the parent box
  boxId: string;
  // the account of the user who perform the action
  accountId?: number;
  // the list of the account in the copyrights
  accountCopyrightIds?: Array<number>;
}

export interface InquiryMessage {
   // the message id
   id?: string;
   // the folder where it is the message
   boxId: string;
   // account
   accountId?: number;

}

export interface Message {
    id: string;
    reated: Date;
    subject: string;
    // private List<MessageMembershipDto> messageMembershipList;
    messageBody: Array<MessageBody>;
    parentBoxId: string;
    createdBy: Account;
}

