import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { BusEvent, BusEventEnum, EventBusService } from 'core-lib';
import { SubSink } from 'subsink';
import { Calendar } from '../../../model';
import { CalendarState, setSelectedCalendarId } from '../../../store';

@Component({
    selector: 'app-calendar-left',
    templateUrl: './calendar-left.component.html',
    styleUrls: [ './calendar-left.component.scss' ],
})
export class CalendarLeftComponent implements OnInit, OnDestroy {
    @ViewChild('inputElement')
    uploadElment: ElementRef;
    calendars: Array<Partial<Calendar>>;
    selectedCalendarId: string;
    private subSink = new SubSink();

    constructor(private eventBus: EventBusService, private store: Store<CalendarState>) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    fileChange($event: Event) {
        // @ts-ignore
        let fileList: FileList = event.target.files;

        if (fileList.length > 0) {
            let file: File = fileList[0];
            console.log('sending for upload');
            this.eventBus.emit(new BusEvent(BusEventEnum.CALENDAR_SINGLE_FILE_UPLOAD, file));
            this.uploadElment.nativeElement.value = null;
        }
    }

    dispatchCreateCalendarEvent() {
        this.eventBus.emit(new BusEvent(BusEventEnum.CREATE_CALENDAR));
    }

    /**
     * Trigger event when calendar is selected
     * @param id
     */
    handleSelectCalendar(id: string | undefined) {
        this.store.dispatch(setSelectedCalendarId({ calendarId: id as string }));
    }

}
