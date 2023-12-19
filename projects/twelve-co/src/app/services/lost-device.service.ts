import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class LostDeviceService {

    BASE_HREF = `${ environment.apiUrl }password`;

    constructor(private httpClient: HttpClient) {
    }


    /**
     * Resets the password for the current user
     * @param userEmail
     */
    replaceLostDevice(userEmail: string): Observable<any> {
        return this.httpClient.post(`${ this.BASE_HREF }/lost-device`, userEmail);
    }

}
