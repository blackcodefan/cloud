import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from '../../../store';
import { calendarStateKey } from '../model';
import { CalendarState } from './calendar.store';

export const appState = createFeatureSelector<State>('appStateKey');
export const calendarState = createFeatureSelector<CalendarState>(calendarStateKey);
export const selectSelectedAccount = createSelector(appState, (state) => state.selectedAccount);
export const selectSelectedCalendar = createSelector(calendarState, (state) => state.selectedCalendarId);
export const selectAvailableCalendars = createSelector(calendarState, (state) => state.calendars);
