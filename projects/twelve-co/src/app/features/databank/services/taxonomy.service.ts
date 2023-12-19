import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Taxonomy } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TaxonomyService {
  BASE_REF = `${ environment.apiUrl }storages/taxonomy`;

  constructor(private httpClient: HttpClient) {
  }


  /**
   * Fetch taxonomy  for a storage
   * @param storageId
   */
  fetchTaxonomyForStorageId(storageId: string): Observable<Taxonomy> {
    return this.httpClient.get<Taxonomy>(`${ this.BASE_REF }/${ storageId }`);
  }

}
