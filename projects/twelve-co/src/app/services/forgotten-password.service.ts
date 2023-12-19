import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ForgottenPasswordService {

    BASE_HREF = `${ environment.apiUrl }password`;

    constructor(private httpClient: HttpClient) {
    }

    /**
     * Updates the password for the current user
     * @param token
     * @param password
     * @param newPwdConf
     */
    updatePassword(token: string, password: string): Observable<any> {
        return this.httpClient.post(`${this.BASE_HREF}/update`, { token,  password });
    }

    /**
     * Resets the password for the current user
     * @param userEmail
     */
    resetPassword(userEmail: string): Observable<any> {
        return this.httpClient.post(`${ this.BASE_HREF }/reset`, userEmail);
    }

}
