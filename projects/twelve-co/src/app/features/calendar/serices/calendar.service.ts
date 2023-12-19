import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { upperFirst } from 'core-lib';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Calendar, CalendarEvent } from '../model';

@Injectable({
    providedIn: 'root',
})
export class CalendarService {
    BASE_HREF = environment.apiUrl;
    CALENDAR_HREF = `${ this.BASE_HREF }calendar`;

    constructor(private http: HttpClient) {
    }


    /**
     * Get all canedar events for accountl
     */
    fetchCalendar(calendarId: string | null): Observable<Array<Calendar>> {
        if (calendarId) {
            // return this.http.get<Array<Calendar>>(this.CALENDAR_HREF, { params: new HttpParams().set('calendarId', calendarId) }).pipe(map(e => this.toFirstCase(e)));
            return this.http.get<Array<Calendar>>(this.CALENDAR_HREF, { params: new HttpParams().set('calendarId', calendarId) });

        } else {
            // return this.http.get<Array<Calendar>>(this.CALENDAR_HREF).pipe(map(e => this.toFirstCase(e)));
            return this.http.get<Array<Calendar>>(this.CALENDAR_HREF);
        }

    }

    /**
     * Save calendar event for account
     * @param calendarEvent
     */
    saveCalendarEvent(calendarEvent: CalendarEvent): Observable<any> {
        let newCalendar = {};
        Object.keys(calendarEvent).forEach(key => newCalendar[this.camelize(key)] = calendarEvent[key]);
        return this.http.post(this.CALENDAR_HREF, newCalendar);
    }

    /**
     * Save calendar event for account
     * @param calendarEvent
     */
    saveCalendarEvents(calendarEvents: Array<CalendarEvent>): Observable<any> {
        return this.http.post(`${ this.CALENDAR_HREF }/events`, calendarEvents);
    }


    getCalendarsMin(): Observable<any> {
        return this.http.get(`${ this.CALENDAR_HREF }/available`);

    }

    uploadIcalFile(data: File): Observable<Calendar> {
        let httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data' }),
            reportProgress: true,
        };
        const formData = new FormData();
        formData.append('file', data);
        return this.http.post<Calendar>(`${ this.CALENDAR_HREF }/uploads`, formData);
    }

    uploadHeaders() {
        return {
            'Accept': 'application/json',
            'mimeType': 'application/octet-stream',
        };
    }

    editCalendarEvent(calendarEvent: CalendarEvent) {
        let newCalendar = {};
        Object.keys(calendarEvent).forEach(key => newCalendar[this.camelize(key)] = calendarEvent[key]);
        return this.http.patch(`${ this.CALENDAR_HREF }`, newCalendar);
    }

    removeCalendarEvent(calendarEvent: CalendarEvent) {
        let newCalendar = {};
        Object.keys(calendarEvent).forEach(key => newCalendar[this.camelize(key)] = calendarEvent[key]);
        return this.http.delete(`${ this.CALENDAR_HREF }/${ newCalendar['id'] }`, newCalendar);
    }

    private camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
            if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    }

    private toFirstCase(input: Array<CalendarEvent>): Array<CalendarEvent> {
        return input.map(e => {
            let out = {} as CalendarEvent;
            Object.keys(e).forEach(key => {
                const value = e[key];
                if (key.toLowerCase().indexOf('time') !== -1 && value !== null && value !== undefined) {
                    out[upperFirst(key)] = new Date(value);
                } else {
                    out[upperFirst(key)] = value;
                }

            });
            return out;

        });
    }


}
