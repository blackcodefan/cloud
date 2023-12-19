import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Membership } from 'core-lib';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChangePermission, RemoveMemberDto } from '../models';

@Injectable({
    providedIn: 'root',
})
export class MembersService {
    BASE_URL = `${ environment.apiUrl }members`;

    constructor(private httpClient: HttpClient) {
    }

    /**
     * Get members for a storage id
     * @param storageId
     */
    getMembersForStorageId(storageId: string): Observable<Array<Membership>> {
        return this.httpClient.get<Array<Membership>>(`${ this.BASE_URL }/folder/${ storageId }`);
    }

    changePermissionOnBoxForAccount(changePermission: ChangePermission): Observable<Membership> {
        return this.httpClient.post<Membership>(`${ this.BASE_URL }/permissions`, changePermission);
    }

    revokeMembership(removeMember: RemoveMemberDto) {
        return this.httpClient.post(`${ this.BASE_URL }/delete`, removeMember);
    }

    uninvite(data: any, boxId: string) {
        return this.httpClient.post(`${ this.BASE_URL }/uninvite/${ boxId }`, data);
    }
}
