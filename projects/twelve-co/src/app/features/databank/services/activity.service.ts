import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Activity } from 'core-lib';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Member } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  BASE_URL = `${ environment.apiUrl }activity`;

  constructor(private http: HttpClient) {
  }

  /**
   *
   * @param boxId
   */
  getActivityForBox(boxId: string): Observable<Array<Activity>> {
    return this.http.get<Array<Activity>>(`${ this.BASE_URL }/boxes/${ boxId }`);
  }

  // todo search in 12co
  searchMember(searchText: string): Observable<Array<Member>> {
    const params = new HttpParams().set('searchTerm', searchText);
    return this.http.get<Array<Member>>(`${ this.BASE_URL }/search/${ searchText }`, { params });
  }
}
