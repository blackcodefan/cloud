import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InquiryMessage, Message, NewMessage } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  BASE_HREF = environment.apiUrl;

  constructor(private http: HttpClient) {
  }


  /**
   * Save the message for a given box
   * @param newMessage
   */
  createMessage(newMessage: NewMessage): Observable<Message> {
    return this.http.post<Message>(`${this.BASE_HREF}messages`, newMessage);
  }

  /**
   * find a single message
   * @param inqMessage
   */
  findMessage(inqMessage: InquiryMessage) {
    return this.http.post<any>(`${this.BASE_HREF}messages/msg`, inqMessage);
  }

  /**
   * find a single message
   * @param inqMessage
   */
  deleteMessage(inqMessage: InquiryMessage) {
    return this.http.post<any>(`${this.BASE_HREF}messages/delete`, inqMessage);
  }

  /**
   * Get all the messages in a given box
   * @param inqMessage
   */
  listMessages(inqMessage: InquiryMessage) {
    return this.http.post<any>(`${this.BASE_HREF}messages/list`, inqMessage);
  }


  /**
   * print message to PDF and download
   * @param messageId the message ID to be printed
   */

   printMessageToPdf(messageId: string): Observable<Blob> {
    return this.http.get(`${this.BASE_HREF}messages/print/${ messageId }`, {
      observe: 'response',
      responseType: 'blob',
    }).pipe(
      map(res => {
        const blb = res.body as Blob;
        return new Blob([ blb ]);
      }),
    );
  }

}
