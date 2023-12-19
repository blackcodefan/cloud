import { Action, createReducer, on } from '@ngrx/store';
import { EmailDraftItem, EmailViewItem, Label } from '../model';
import {
    addFixedLabels,
    addNewDraftEmail,
    addNewLabel,
    addNewMedia,
    changeEmailDisplayStatus,
    removeEmail,
    removeLabel,
    setAsReadEmail,
    setEmailCounts,
    setEmailsList,
    setFlagEmail,
    setInviteStatusEmail,
    setLabelList,
    setSelectedLabel,
    setStarRedEmail,
    updateDraftEmail,
    updateDraftEmailStatus,
    updateLabel,
} from './email.actions';
import { emailInitialState, EmailState } from './email.store';

const appReducers = createReducer(emailInitialState,
    on(addNewMedia, (state: EmailState, { mediaItem }) => {
        return Object.assign({}, state, { mediaList: [ ...state.mediaList, mediaItem ] });
    }),

    on(setEmailsList, (state: EmailState, { emailsList }) => {
        return Object.assign({}, state, { emailsList });
    }),
    on(removeEmail, (state: EmailState, { emailId }) => {
        return Object.assign({}, state, { emailsList: state.emailsList.filter(item => item.id != emailId) });
    }),
    on(addNewDraftEmail, (state: EmailState, { emailItem }) => {
        return Object.assign({}, state, { emailDraftList: [ ...state.emailDraftList, emailItem ] });
    }),
    on(addFixedLabels, (state: EmailState, { labels }) => {
        return Object.assign({}, state, { fixedLabelList: labels });
    }),
    on(addNewLabel, (state: EmailState, { label }) => {
        return Object.assign({}, state, { labelList: [ ...state.labelList, label ] });
    }),

    on(updateLabel, (state: EmailState, { label }) => {
        const labels: Array<Label> = JSON.parse(JSON.stringify(state.labelList));
        labels.forEach(x => {
            if(x.id === label.id) {
                x.name = label.name;
            }
        })
        return Object.assign({}, state, { labelList: labels });
    }),

    on(removeLabel, (state: EmailState, { id }) => {
        return Object.assign({}, state, { labelList: state.labelList.filter(item => item.id != id) });
    }),
    on(setLabelList, (state: EmailState, { labelList }) => {
        return Object.assign({}, state, { labelList: labelList });
    }),
    on(setSelectedLabel, (state: EmailState, { selectedLabel }) => {
        return Object.assign({}, state, { selectedLabel: selectedLabel });
    }),
    on(setEmailCounts, (state: EmailState, { emailCounts }) => {
        return Object.assign({}, state, { emailCounts: emailCounts });
    }),
    on(setAsReadEmail, (state: EmailState, { emailRead }) => {
        const emailsList = state.emailsList.map((item: EmailViewItem) => {
            if (item.id == emailRead.emailId) {
                return Object.assign({}, { ...item }, { isRead: emailRead.isRead, readOn: emailRead.readOn });
            } else {
                return item;
            }
        });
        return Object.assign({}, { ...state }, { emailsList: emailsList });
    }),
    on(setStarRedEmail, (state: EmailState, { emailID }) => {
        const emailsList = state.emailsList.map((item: EmailViewItem) => {
            if (item.id == emailID) {
                return Object.assign({}, { ...item }, { star: !item.star });
            } else {
                return item;
            }
        });
        return Object.assign({}, { ...state }, { emailsList: emailsList });
    }),
    on(setFlagEmail, (state: EmailState, { emailID, color }) => {
        const emailsList = state.emailsList.map((item: EmailViewItem) => {
            if (item.id == emailID) {
                return Object.assign({}, { ...item }, { flag: color });
            } else {
                return item;
            }
        });
        return Object.assign({}, { ...state }, { emailsList: emailsList });
    }),
    on(setInviteStatusEmail, (state: EmailState, { emailID, inviteStatus }) => {
        const emailsList = state.emailsList.map((item: EmailViewItem) => {
            if (item.id == emailID) {
                return Object.assign({}, { ...item }, { inviteStatus: inviteStatus });
            } else {
                return item;
            }
        });
        return Object.assign({}, { ...state }, { emailsList: emailsList });
    }),
    on(updateDraftEmail, (state: EmailState, { emailItem }) => {
        const emailDraftList = state.emailDraftList.map((item: EmailDraftItem) => {
            if (item.id == emailItem.id) {
                return Object.assign({}, { ...item }, { subject: emailItem.subject, content: emailItem.content, status: emailItem.status });
            } else {
                return item;
            }
        });
        return Object.assign({}, { ...state }, { emailDraftList: emailDraftList });
    }),
    on(updateDraftEmailStatus, (state: EmailState, { emailID, status }) => {
        const emailDraftList = state.emailDraftList.map((item: EmailDraftItem) => {
            if (item.id == emailID) {
                return Object.assign({}, { ...item }, { status: status });
            } else {
                return item;
            }
        });
        return Object.assign({}, { ...state }, { emailDraftList: emailDraftList });
    }),
    on(changeEmailDisplayStatus, (state: EmailState, { emailID, status }) => {
        const emailList = state.emailDraftList.map((item: EmailDraftItem) => {
            if (item.id == emailID) {
                return Object.assign({}, { ...item }, { status: status });
            } else {
                return item;
            }
        });
        return Object.assign({}, { ...state }, { emailList: emailList });
    }),
);

export function emailReducers(state: EmailState | undefined, action: Action) {
    return appReducers(state, action);
}
