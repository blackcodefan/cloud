import { EmailCounts, Label } from './../model/email.model';
import {  EmailDraftItem, EmailViewItem, LabelItem, MediaItem } from '../model';

export interface EmailState {
    mediaList: Array<MediaItem>,
    emailsList: Array<EmailViewItem>,
    // to delete
    emailDraftList: Array<EmailDraftItem>,

    emailCounts: EmailCounts;
    labelList: Array<Label>;

    selectedLabel: Label | undefined;
}

export const emailInitialState: EmailState = {
    mediaList: new Array<MediaItem>(),
    emailsList: [],
    emailDraftList: [],
    emailCounts: {
        labelsCount: []
    },
    labelList: [],
    selectedLabel: undefined
};

