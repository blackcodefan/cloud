import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountSummary, StoragesMinDto } from 'core-lib';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthenticityToken, EmailCounts, EmailData, EmailReadStatus, Label, LabelUpdate, Receiver, UpdateEmailChain } from '../model';
import { Pageable } from './../../databank/models/pageable';

@Injectable({
    providedIn: 'root',
})
export class EmailService {
    private BASE_URL = environment.apiUrl;
    private baseUrlAudio = `${ environment.apiUrl }audio/`;
    private EMAIL_URL = `${ this.BASE_URL }emails`;
    private DRAFTS_URL = `${ this.EMAIL_URL }/drafts`;
    private EMAIL_CONTENT_URL = `${ this.EMAIL_URL }/content`;
    private CHAIN_URL = `${ this.EMAIL_URL }/chains`;
    private TRASH_CHAIN_URL = `${ this.EMAIL_URL }/trash/chains`;
    private EMAIL_READ_STATUS = `${ this.EMAIL_URL }/read-status`;
    private EMAIL_VERIFY_AUTHENTICITY = `${ this.EMAIL_URL }/sign-email`;
    private EMAIL_VERIFY_CHAIN_AUTHENTICITY = `${ this.EMAIL_URL }/chain/verify-authenticity`;
    private ADD_EMAIL_CHAIN_MEMEBRS = `${ this.EMAIL_URL }/new-receivers`;
    private STORAGES = `${ this.BASE_URL }storages`;



    private SearchInboxStatus= new BehaviorSubject(false);
    private EmailAllDetailStatus= new BehaviorSubject(true);

    private replyEmailPreObj$ = new BehaviorSubject({
        subject: '',
        sender: '',
        senderName: '',
        chainParentID: '',
        lastEmailInChainId: ''
    });

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    };

    constructor(
        private httpClient: HttpClient
        ) {
    }

    /****   local communication services */
    getReplyEmailPreObj():Observable<any>{
        return this.replyEmailPreObj$.asObservable();
    }

    setReplyEmailPreObj(value: any){
        this.replyEmailPreObj$.next(value);
    }

    getSearchInboxStatus(): Observable<boolean>{
        return this.SearchInboxStatus.asObservable();
    }
    setSearchInboxStatus(status: boolean){
        this.SearchInboxStatus.next(status);
    }

    getEmailDetailStatus():Observable<boolean>{
        return this.EmailAllDetailStatus.asObservable();
    }

    setEmailDetailStatus(value: boolean){
        this.EmailAllDetailStatus.next(value);
    }



    getLabelCode(label: Label) : 'draft' | 'inbox' | 'sent' | 'trash' | 'scheduled' | 'archived' | 'custom'{
        switch(label.name) {
            case 'EMAIL.Inbox': {
                return 'inbox';
            }
            case 'EMAIL.Sent': {
                return 'sent';
            }
            case 'EMAIL.Draft': {
                return 'draft';
            }
            case 'EMAIL.Trash': {
                return 'trash';
            }
            case 'EMAIL.Sent': {
                return 'scheduled';
            }
            case 'EMAIL.Sent': {
                return 'archived';
            }
            default: {
                return 'custom';
            }
        }
    }

    getEmailForId(emailId: string): Observable<EmailData> {
        return this.httpClient.get<EmailData>(`${ this.EMAIL_CONTENT_URL }/${ emailId }`);
    }


    getEmailForLabel(labelId: string): Observable<Pageable<EmailData>> {
        return this.httpClient.get<Pageable<EmailData>>(`${ this.EMAIL_URL }/labels/${labelId }`);
    }

    getEmailForLabelFilteredSorted(labelId: string, filter:string, sortField: string, sortDir: string): Observable<Pageable<EmailData>> {
        return this.httpClient.get<Pageable<EmailData>>(`${ this.EMAIL_URL }/labels/${labelId }?filter=${filter}&sort=${sortField}&dir=${sortDir}`);
    }

    searchEmailsForLabel(labelId: string, searchParam: string): Observable<Pageable<EmailData>> {
        return this.httpClient.get<Pageable<EmailData>>(`${ this.EMAIL_URL }/labels/${labelId }/search/${searchParam}`);
    }

    getChainEmailsForAccount(chainId: string, labelId: string): Observable<Pageable<EmailData>> {
        return this.httpClient.get<Pageable<EmailData>>(`${ this.EMAIL_URL }/${labelId}/chain/${ chainId }`);
    }

    getEmailsCountForAccount(): Observable<EmailCounts> {
        return this.httpClient.get<EmailCounts>(`${ this.EMAIL_URL }/labels/count`);
    }

    saveEmailDraft(emailData: EmailData): Observable<EmailData> {
        return this.httpClient.post<EmailData>(`${ this.DRAFTS_URL }`, emailData);
    }

    sendNewEmail(emailData: any): Observable<EmailData> {
        return this.httpClient.post<EmailData>(`${ this.EMAIL_URL }`, emailData);
    }

    addEmailChainMembers(updateEmailChain: UpdateEmailChain): Observable<any> {
        return this.httpClient.post<any>(`${ this.ADD_EMAIL_CHAIN_MEMEBRS }`, updateEmailChain, this.httpOptions);
    }

    deleteEmail(emailId: string): Observable<any> {
        return this.httpClient.delete<any>(`${ this.EMAIL_URL}/${emailId}`);
    }

    deleteEmailChain(chainId: string): Observable<any> {
        return this.httpClient.delete<any>(`${ this.CHAIN_URL}/${chainId}`);
    }

    trashEmail(emailId: string): Observable<any> {
        return this.httpClient.delete<any>(`${ this.EMAIL_URL}/trash/${emailId}`);
    }

    trashEmailChain(chainId: string): Observable<any> {
        return this.httpClient.delete<any>(`${ this.TRASH_CHAIN_URL}/${chainId}`);
    }

    moveEmailToLabel(emailId: string, labelId: string): Observable<any> {
        return this.httpClient.post<any>(`${ this.EMAIL_URL}/${emailId}/moveto/${labelId}`, this.httpOptions);
    }

    saveEmailReadStatus(emailReadStatus: EmailReadStatus): Observable<EmailData> {
        return this.httpClient.put<EmailData>(`${ this.EMAIL_READ_STATUS }`, emailReadStatus);
    }

    signEmailPdf(emailId: string): Observable<Blob> {
        return this.httpClient.get(`${this.EMAIL_VERIFY_AUTHENTICITY}/${ emailId }`, {
        observe: 'response',
        responseType: 'blob',
        }).pipe(
        map(res => {
            const blb = res.body as Blob;
            return new Blob([ blb ]);
        }),
        );
   }

    verifyChainAuthenticity(chainId: string): Observable<AuthenticityToken> {
        return this.httpClient.post<AuthenticityToken>(`${ this.EMAIL_VERIFY_CHAIN_AUTHENTICITY }`, chainId, this.httpOptions);
    }

    /**
     * Delete specific label for account
     * @param labelId
     */
    removeEmailLabel(labelId: string) {
        return this.httpClient.delete(`${ this.EMAIL_URL }/labels/${ labelId }`);
    }

    /**
     * Get fixed labels for account
     */
    getFixedLabelsForAccount(): Observable<Array<Label>> {
        return this.httpClient.get<Array<Label>>(`${ this.EMAIL_URL }/labels/fixed`);
    }

    /**
     * Get all labels for account
     */
     getLabelsForAccount(): Observable<Array<Label>> {
        return this.httpClient.get<Array<Label>>(`${ this.EMAIL_URL }/labels/all`);
    }

    getViewableTime(_date: any){
        let date_ob = new Date(_date);
        // adjust 0 before single digit date
        let date = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(date_ob);

        // current month
        let month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date_ob);

        // current year
        let year = date_ob.getFullYear();

        // current hours
        let hours = ("0" + date_ob.getHours()).slice(-2);

        // current minutes
        let minutes =  ("0" + date_ob.getMinutes()).slice(-2);

        // current seconds
        let seconds = date_ob.getSeconds();
        return date + " " + month + " " + year + " at " + hours + ":" + minutes;
    }

    getLabelsForLabelId(labelId: string): Observable<Array<Label>> {
        return this.httpClient.get<Array<Label>>(`${ this.EMAIL_URL }/labels/${labelId}`);
    }

    addLabelForAccount(label:string) {
        return this.httpClient.post(`${ this.EMAIL_URL }/labels`,label);
    }

    updateLabelForAccount(label:LabelUpdate) {
        return this.httpClient.put(`${ this.EMAIL_URL }/labels`,label);
    }

    /**
     * Get emails for a given label
     * @param labelId
     */
    getEmailsForLabelId(labelId: string) {
        return this.httpClient.get(`${ this.EMAIL_URL }/labels/${ labelId }`);
    }


    searchAccount(name: string): Observable<Array<AccountSummary>> {
        if (name !== null && name !== undefined && name.length > 2) {
            return this.httpClient.get<Array<AccountSummary>>(`${ this.baseUrlAudio }search-account/${ name }`)
                .pipe(catchError(e => []));
        } else {
            return of([]);
        }

    }


    /**
     * Download a attachment with given id
     * @param storageId
     */
     downloadAttachment(storageId: string): Observable<Blob> {
        return this.httpClient.get(`${ this.STORAGES }/downloads/attachments/${ storageId }`, {
            observe: 'response',
            responseType: 'blob',
        }).pipe(
            map(res => {
                const blb = res.body as Blob;
                return new Blob([ blb ]);
            }),
        );
    }

    uploadFile(newFile: FormData): Observable<HttpEvent<{}>> {

        return this.httpClient.post<HttpEvent<{}>>(`${ this.STORAGES }/uploads`, newFile, { reportProgress: true, observe: 'events' });
    }



    deleteAttachments(storages: StoragesMinDto): Observable<any> {

        return this.httpClient.post<any>(`${ this.STORAGES }/attachments/delete`, storages, this.httpOptions);
    }

    /**
   * print email to PDF and download
   * @param emailId the email ID to be printed
   */
    printEmailToPdf(emailId: string): Observable<Blob> {
        return this.httpClient.get(`${this.EMAIL_URL}/print/${ emailId }`, {
        observe: 'response',
        responseType: 'blob',
        }).pipe(
            catchError((err, caught) => {
                return throwError(err);
            }),
            map(res => {
                const blb = res.body as Blob;
                return new Blob([ blb ]);
            })

        )
   }
}
