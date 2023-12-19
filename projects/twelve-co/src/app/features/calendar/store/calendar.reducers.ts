import { Action, createReducer, on } from '@ngrx/store';
import { addCalendar, setCalendars, setSelectedCalendarId } from './calendar.actions';
import { calendarInitialState, CalendarState } from './calendar.store';

const calendarReducers = createReducer(
    calendarInitialState,
    on(setSelectedCalendarId, (state, { calendarId }) => ({ ...state, selectedCalendarId: calendarId })),
    on(setCalendars, (state, { calendars }) => ({ ...state, calendars: calendars })),
    on(addCalendar, (state, { calendar }) => ({ ...state, calendars: [ ...state.calendars, calendar ] })),
);

export function calendarAppReducers(state: CalendarState, action: Action) {
    return calendarReducers(state, action);
}
