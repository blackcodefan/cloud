import { createAction, props } from '@ngrx/store';
import { Calendar } from '../model';

export const setSelectedCalendarId = createAction('[CALENDAR] select calendar ', props<{ calendarId: string }>());
export const setCalendars = createAction('[CALENDAR] set available calendars ', props<{ calendars: Array<Calendar> }>());
export const addCalendar = createAction('[CALENDAR] add calendar to collection', props<{ calendar: Calendar }>());
