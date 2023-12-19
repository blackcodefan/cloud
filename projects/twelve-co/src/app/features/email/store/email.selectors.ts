import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmailState } from './email.store';
import { emailStateKey } from './email.token';

export const emailState = createFeatureSelector<any>(emailStateKey);

export const getLabels = createSelector(emailState, (state: EmailState) => {
    return state.labelList;
});
export const getSelectedLabel = createSelector(emailState, (state: EmailState) => {
    return state.selectedLabel;
});
export const getEmailsList = createSelector(emailState, (state: EmailState) => {
    return state.emailsList;
});

export const getEmailByID = (emailID: string) => createSelector(emailState, (state: EmailState) => {
    return state.emailsList.find(x => x.id == emailID);
});

export const getEmailDraftList = createSelector(emailState, (state: EmailState) => {
    return state.emailDraftList;
});
export const getEmailCounts = createSelector(emailState, (state: EmailState) => {
    return state.emailCounts;
});
// export const getInboxEmailContentByID = (emailID: string) => createSelector(emailState, (state: EmailState) => {
//     return state.emailInboxList.find(x => x.id == emailID);
// });
// export const getSentEmailContentByID = (emailID: string) => createSelector(emailState, (state: EmailState) => {
//     return state.emailSentList.find(x => x.id == emailID);
// });
export const getDraftEmailContentByID = (emailID: string) => createSelector(emailState, (state: EmailState) => {
    return state.emailDraftList.find(x => x.id == emailID);
});



