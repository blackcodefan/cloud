import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { CoreLibModule } from 'core-lib';
import { CalendarComponent } from './calendar.component';
import { CalendarPlaygrountComponent } from './components/calendar-playgrount/calendar-playgrount.component';
import { CalendarViewComponent } from './components/calendar-view/calendar-view.component';
import { DocumentViewComponent } from './components/document-view/document-view.component';
import { CalendarLeftComponent } from './components/layout/calendar-left/calendar-left.component';
import { CreateCalendarComponent } from './components/modals/create-calendar/create-calendar.component';
import { calendarStateKey } from './model';
import { calendarAppReducers } from './store';

export const routes: Routes = [
    {
        path: '', component: CalendarComponent, children: [
            { path: '', redirectTo: 'calendar-view', pathMatch: 'full' },
            { path: 'calendar-view', component: CalendarViewComponent },
        ],
    },
];

@NgModule({
    declarations: [
        CalendarComponent, CalendarViewComponent, DocumentViewComponent, CreateCalendarComponent, CalendarPlaygrountComponent, CalendarLeftComponent,
    ],
    imports: [
        CommonModule,
        CoreLibModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        StoreModule.forFeature(calendarStateKey, calendarAppReducers),

    ],
})
export class CalendarModule {
}
