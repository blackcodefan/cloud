import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/twelve-co/src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockEmailService {
    private SearchInboxStatus= new BehaviorSubject(false);
    private EmailAllDetailStatus= new BehaviorSubject(true);

    constructor(
        private _http: HttpClient
    ) {
    }



    sendNewInvite(formData: any){
        const req = new HttpRequest('POST', `${environment.emailUrl}/emails/add-invite`, formData, {
            reportProgress: true,
            responseType: 'json'
        });
        return this._http.request(req);
    }

    sendNewEmail(formData: any){
        const req = new HttpRequest('POST', `${environment.emailUrl}/emails/add`, formData, {
            reportProgress: true,
            responseType: 'json'
        });
        return this._http.request(req);
    }

    acceptInviteByID(id: string){
        const req = new HttpRequest('GET', `${environment.emailUrl}/emails/accept-invite/${id}`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    rejectInviteByID(id: string){
        const req = new HttpRequest('GET', `${environment.emailUrl}/emails/reject-invite/${id}`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    removeEmailChainItem(id: string){
        console.log(id);
        const req = new HttpRequest('GET', `${environment.emailUrl}/emails/remove-chainItem/${id}`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    getEmailList(){
        const sender = JSON.parse(localStorage.getItem('authData')!).email;
        const req = new HttpRequest('GET', `${environment.emailUrl}/emails/sent-list/${sender}`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    getInboxList(){
        const sender = JSON.parse(localStorage.getItem('authData')!).email;
        const req = new HttpRequest('GET', `${environment.emailUrl}/emails/inbox-list/${sender}`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    getEmailContentByID(emailID: string){
        const req = new HttpRequest('GET', `${environment.emailUrl}/emails/emailDetail/${emailID}`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    getEmailsCount(emailID : string){
        const req = new HttpRequest('GET',`${environment.emailUrl}/emails/get-emailCount/${emailID}`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    setAsRead(emailID: string){
        const req = new HttpRequest('GET', `${environment.emailUrl}/emails/setAsRead/${emailID}`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    setStarRead(emailID: string){
        const req = new HttpRequest('GET', `${environment.emailUrl}/emails/setStarRed/${emailID}`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    setFlag(emailID: string, color: string){
        const formData = {
            emailID: emailID,
            color: color
        }
        const req = new HttpRequest('POST', `${environment.emailUrl}/emails/setFlag`, formData,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    searchReceivers(){
        const req = new HttpRequest('GET', `${environment.emailUrl}/auth/filter`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    addNewLabel(formData: any){
        const req = new HttpRequest('POST', `${environment.emailUrl}/labels/add`, formData, {
            responseType: 'json'
        });
        return this._http.request(req);
    };

    removeLabel(labelID: string){
        const req = new HttpRequest('GET', `${environment.emailUrl}/labels/delete/` + labelID, {
            responseType: 'json'
        });
        return this._http.request(req);
    }

    getLabelList(userID : string){
        const req = new HttpRequest('GET',`${environment.emailUrl}/labels/list/${userID}`,{
            responseType: 'json'
        });
        return this._http.request(req);
    }

    getNowTime(){
        let date_ob = new Date();
        // adjust 0 before single digit date
        let date = ("0" + date_ob.getDate()).slice(-2);

        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

        // current year
        let year = date_ob.getFullYear();

        // current hours
        let hours = ("0" + date_ob.getHours()).slice(-2);

        // current minutes
        let minutes =  ("0" + date_ob.getMinutes()).slice(-2);

        // current seconds
        let seconds = date_ob.getSeconds();
        return  month+ "/" +  date+ "/" + year + " " + hours + ":" + minutes;
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
}
