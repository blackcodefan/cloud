import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tag } from 'core-lib';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class TagService {

    BASE_URL = `${ environment.apiUrl }tags`;

    constructor(private httpClient: HttpClient) {
    }

    /**
     * Get all tags for an account
     */
    getTagsForAccount(): Observable<Array<Tag>> {
        return this.httpClient.get<Array<Tag>>(this.BASE_URL);
    }

    /**
     * Delete all custom tags for account
     */
    deleteTagsForAccount(): Observable<any> {
        return this.httpClient.delete(this.BASE_URL);
    }

    saveTagForAccount(tag: Tag): Observable<Tag> {
        return this.httpClient.post<Tag>(this.BASE_URL, tag);
    }

    updateTagName(tag: Tag): Observable<Tag> {
        return this.httpClient.patch<Tag>(this.BASE_URL, tag);
    }

    getTagsForAccountAndStorage(storageId: string): Observable<Array<Tag>> {
        return this.httpClient.get<Array<Tag>>(`${ this.BASE_URL }/${ storageId }`);
    }

    saveTagsForAccountAndStorage(storageId: string, taglist: Array<Tag>): Observable<Array<Tag>> {
        return this.httpClient.post<Array<Tag>>(`${ this.BASE_URL }/${ storageId }`, taglist);
    }
}
