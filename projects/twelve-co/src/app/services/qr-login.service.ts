import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { LoggingService, setConnectedAction, setTokenValueWsAction, UserNotificationService, WebsocketService } from 'core-lib';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { QrData, QrDataSafe, UserLoginData } from '../model';
import { logInAction, State } from '../store';

@Injectable({
    providedIn: 'root',
})
export class QrLoginService {
    baseUrl = `${ environment.apiUrl }users-login`;
    qrUrl = '/qr';
    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
        // responseType: 'text' as 'json'
    };

    constructor(private httpClient: HttpClient, private store: Store<State>, private logging: LoggingService,
                private notification: UserNotificationService, private websocketService: WebsocketService, private domSanitizer: DomSanitizer) {
    }


    /**
     * Get QR code in order to perform login by scanning the code
     */
    getLoginQr(): Observable<QrDataSafe> {
        return this.httpClient.post<QrData>(`${ this.baseUrl }${ this.qrUrl }`, null)
            .pipe(
                map((res) => {
                    const qrData: QrDataSafe = {
                        uuid: res.uuid,
                        qrImage: this.domSanitizer.bypassSecurityTrustUrl(`data:image/png;base64,${ res.qrImage }`),
                    };
                    return qrData;
                }),
            );
    }

    /**
     * Get QR code in order to perform login by scanning the code
     */
    getLoginQrData(): Observable<any> {
        return this.httpClient.get<any>(`${ this.baseUrl }${ this.qrUrl }`, this.httpOptions)
    }


    getLoginQrToken(uuid: string): Observable<UserLoginData> {
        return this.httpClient.post<UserLoginData>(`${ this.baseUrl }`, uuid);
    }

    getReplaceLostDeviceQrToken(uuid: string): Observable<{ data: string, uriData: string, uuid: string }> {
        return this.httpClient.post<{ data: string, uriData: string, uuid: string }>(`${ environment.apiUrl }lost-device/qr`, uuid);
    }

    private setAuthData(tkn: string, username: string) {
        this.store.dispatch(logInAction({ authToken: tkn, loggedIn: true, username }));
        this.store.dispatch(setTokenValueWsAction({ token: tkn }));
        this.store.dispatch(setConnectedAction({ newState: true }));

    }
}
