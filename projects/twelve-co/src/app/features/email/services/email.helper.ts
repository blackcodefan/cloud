import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AccountSummary, StoragesMinDto } from 'core-lib';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { EmailCounts, EmailData, EmailReadStatus, Label } from '../model';
import { setEmailCounts } from '../store';
import { Pageable } from './../../databank/models/pageable';
import { EmailService } from './email.service';

@Injectable({
    providedIn: 'root',
})
export class EmailHelper {


    constructor(
        private emailService: EmailService,
        private store: Store<any>
        ) {
    }


    loadEmailsCountForAccount() {
        this.emailService.getEmailsCountForAccount().subscribe(emailCounts => {
            this.store.dispatch(setEmailCounts({emailCounts}));
        }, error => {
            console.error('Error while retrieve email countsl', error);
        })
    }

}
