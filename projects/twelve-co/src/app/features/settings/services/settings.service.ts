import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Device } from 'core-lib';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    baseUrl: string;
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    };

    constructor(@Inject('env') env: any, private httpClient: HttpClient, private domSanitizer: DomSanitizer) {
        this.baseUrl = `${ env.apiUrl }`;
    }

    /**
     * Fetch language for the profile
     */
    getProfileLanguage(): Observable<any> {
        return this.httpClient.get(`${ this.baseUrl }settings/languages`, this.httpOptions);
    }

    /**
     * Fetch language for the profile
     */
    setProfileLanguage(languageCodeId: number): Observable<any> {
        return this.httpClient.post(`${ this.baseUrl }settings/languages`, { languageCodeId }, this.httpOptions);
    }


    /**
     * Fetch profile general information
     */
    getProfileGeneralInformation(): Observable<any> {
        return this.httpClient.get(`${ this.baseUrl }settings/general-information`, this.httpOptions);
    }

    /**
     * Set the profile general information
     * @param firstName
     * @param lastName
     * @param countryId
     * @param birthday
     * @param accountName
     */
    setProfileGeneralInformation(firstName: string, lastName: string, countryId: string | number, birthday: Date, accountName: string): Observable<any> {
        return this.httpClient.post(`${ this.baseUrl }settings/general-information`, {
            firstName,
            lastName,
            countryId,
            birthday,
            accountName,
        }, this.httpOptions);
    }

    getProfilePicture(): Observable<any> {
        return this.httpClient.get(`${ this.baseUrl }settings/photo`, this.httpOptions);
    }

    /**
     * Save profile picture
     */
    setProfilePicture(imageBlob: File): Observable<any> {
        const postData = new FormData();
        postData.set('fileName', imageBlob.name);
        postData.set('fileSize', imageBlob.size.toString(10));
        postData.set('image', imageBlob);
        return this.httpClient.post(`${ this.baseUrl }settings/photo`, postData, this.httpOptions);
    }

    /**
     * Get Profile devices (phones tablets
     */
    getProfileDevices(): Observable<Array<Device>> {
        return this.httpClient.get<Array<Device>>(`${ this.baseUrl }devices`, this.httpOptions);
    }

    getQrCode(accountId: number): Observable<SafeUrl> {
        const url = `${ this.baseUrl }auth/otp/${ accountId }/qr`;
        return this.httpClient.post(url, null, { responseType: 'text' }).pipe(
            map((res: string) => {
                return this.domSanitizer.bypassSecurityTrustUrl(`data:image/jpg;base64,${ res }`);
            }),
        );
    }

    getQrCodeData(): Observable<any> {
        const url = `${ this.baseUrl }auth/otp/qr`;
        return this.httpClient.get(url, this.httpOptions);
    }

}
