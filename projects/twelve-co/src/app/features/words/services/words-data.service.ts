import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WordsDataService {
    private BASE_HREF = environment.apiUrl;
    private DOC_URL = `${ this.BASE_HREF }documents/word`;


    constructor(private httpClient: HttpClient) {
    }

    getDocumentsForAccount() {
        return this.httpClient.get(this.DOC_URL);
    }
}
