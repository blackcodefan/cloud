import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { clearWsState, LoggingService, setConnectedAction, setTokenValueWsAction, UserNotificationService, WebsocketService } from 'core-lib';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { logInAction, setLoggedInState, State } from '../store';

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    BASE_URL = `${ environment.apiUrl }`;
    baseUrl = `${ environment.apiUrl }auth/login`;
    logoutUrl = `${ environment.apiUrl }auth/logout`;
    private BEARER = 'Bearer ';

    constructor(private httpClient: HttpClient, private store: Store<State>, private logging: LoggingService,
                private notification: UserNotificationService, private websocketService: WebsocketService) {
    }


    /**
     * Perform login
     * @param username name of the user to login
     * @param password of the user logging in
     * @param otp code from the mobile app
     */
    login(username: string, password: string, otp: number): Observable<any> {
        return this.httpClient.post(this.baseUrl, { username, password, otpCode: otp }, { observe: 'response' })
            .pipe(
                tap((response: any) => this.logging.info(response)), // todo remove
                tap((response: any) => this.setAuthData(response.headers.get('authorization').substring(this.BEARER.length), username)),
                tap((response: any) => tap(_ => this.store.dispatch(setLoggedInState({ loggedIn: true })))),
            );
    }

    /**
     * Perform QR login
     * @param token JWT token to login
     * @param username
     */
    qrLogin(token: string, username: string): Observable<any> {
        return this.httpClient.post(this.baseUrl, { username: username, password: null, otpCode: null, token: token }, { observe: 'response' })
            .pipe(
                tap((response: any) => this.logging.info(response)), // todo remove
                tap((response: any) => this.setAuthData(response.headers.get('authorization').substring(this.BEARER.length), username)),
                tap((response: any) => tap(_ => this.store.dispatch(setLoggedInState({ loggedIn: true })))),
            );
    }

    /**
     * Logout current user
     *  - close the websocket connection
     *  - clear the websocket state
     *  - clear the logged in state
     */
    logout(): Observable<any> {
        return this.httpClient.post(this.logoutUrl, {})
            .pipe(
                tap(_ => this.websocketService.disconnect()),
                tap(_ => this.store.dispatch(clearWsState())),
                tap(_ => this.store.dispatch(setLoggedInState({ loggedIn: false }))),
            );
    }

    private setAuthData(tkn: string, username: string) {
        this.store.dispatch(logInAction({ authToken: tkn, loggedIn: true, username }));
        this.store.dispatch(setTokenValueWsAction({ token: tkn }));
        this.store.dispatch(setConnectedAction({ newState: true }));

    }


    /**
     * Download zip for blockchain activity for root storage
     * @param selectedBoxId id of the storage for whom to get the box
     */

    downloadSignedFile(storageId: string): Observable<Blob> {
        return this.httpClient.get(`${ this.BASE_URL }blockchain/box/${ storageId }`, {
            observe: 'response',
            responseType: 'blob',
        }).pipe(
            map(res => {
                const blb = res.body as Blob;
                return new Blob([ blb ]);
            }),
        );
    }


    handleForgotPassword(email: string): Observable<any> {
        return this.httpClient.post(`${ this.BASE_URL }registrations/forgot-password`, { email });
    }

    handleAddNewDevice(email: string): Observable<any> {
        return this.httpClient.post(`${ this.BASE_URL }registrations/lost-device`, { email });
    }
}
