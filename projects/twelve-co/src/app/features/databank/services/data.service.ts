import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ItemDetails, LoggingService, UserNotificationService } from 'core-lib';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = environment.apiUrl;
  private readonly BOXES = `${ this.baseUrl }boxes`;
  private readonly STORAGES = `${ this.baseUrl }storages`;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    // responseType: 'text' as 'json'
  };

  constructor(private httpClient: HttpClient, private logger: LoggingService, private notification: UserNotificationService) {
  }

  /**
   * Get boxes associated to an account
   */
  getBoxes(): Observable<any> {
    return this.httpClient.get(`${ this.baseUrl }storages/boxes`);
  }

  /**
   * Get all boxes
   */
  public listBoxes(): Observable<Array<ItemDetails>> {

    return this.httpClient.get<Array<ItemDetails>>(this.BOXES);
  }
}
