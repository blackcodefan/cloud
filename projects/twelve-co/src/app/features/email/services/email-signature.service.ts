import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class EmailSignatureService {
    private BASE_URL = environment.apiUrl;
    private EMAIL_SIGNATURE_URL = `${ this.BASE_URL }emails/signatures`;


    constructor(private httpClient: HttpClient) {
    }

    /**
     * Save a signature for an account
     * @param emailSignatureContent
     */
    saveSignatureForAccount(emailSignatureContent: any) {
        return this.httpClient.post(`${ this.EMAIL_SIGNATURE_URL }`, emailSignatureContent);
    }

    /**
     * Get all signatures for an account
     */
    getEmailSignaturesForAccount() {
        return this.httpClient.get(`${ this.EMAIL_SIGNATURE_URL }`);
    }

    /**
     * Delete a signature for an email
     * @param signatureId
     */
    deleteEmailSignature(signatureId: string) {
        return this.httpClient.delete(`${ this.EMAIL_SIGNATURE_URL }/${ signatureId }`);
    }

}
