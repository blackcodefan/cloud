import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { DomService } from 'core-lib';
import { SubSink } from 'subsink';
import { CalendarLeftComponent } from './components/layout/calendar-left/calendar-left.component';
import { Calendar } from './model';
import { CalendarState, selectAvailableCalendars } from './store';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: [ './calendar.component.scss' ],
})
export class CalendarComponent implements OnInit, OnDestroy {
    selectedSetting!: string;
    sidebarStatus: boolean = true;
    calendars: Array<Partial<Calendar>>;
    private subSink = new SubSink();

    constructor(private router: Router, private cdk: ChangeDetectorRef, private domService: DomService, private store: Store<CalendarState>) {
    }

    ngOnInit(): void {
        this.domService.appendComponentToSidebar(CalendarLeftComponent);
        this.subSink.sink = this.store.pipe(select(selectAvailableCalendars)).subscribe(res => this.calendars = res);
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    handleDifferentSetting(newApp: any) {
        console.log('handling different setting');
        this.selectedSetting = newApp as string;
        this.cdk.detectChanges();
    }

    showSidebar() {
        this.sidebarStatus = true;
    }

}
