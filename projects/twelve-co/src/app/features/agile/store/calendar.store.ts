import { Calendar } from '../model';

export interface CalendarState {
    selectedCalendarId: string;
    calendars: Array<Calendar>;
}


export const calendarInitialState: CalendarState = {
// @ts-ignore
    selectedCalendarId: null,
    calendars: [],
};
