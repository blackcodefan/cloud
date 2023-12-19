import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { BusEvent, BusEventEnum, EventBusService } from 'core-lib';
import { SubSink } from 'subsink';
import { ExcelState } from '../../../store';

@Component({
    selector: 'app-excel-left',
    templateUrl: './excel-left.component.html',
    styleUrls: [ './excel-left.component.scss' ],
})
export class ExcelLeftComponent implements OnInit {
    @ViewChild('inputElement')
    uploadElment: ElementRef;
    private subSink = new SubSink();

    constructor(private eventBus: EventBusService, private store: Store<ExcelState>) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.subSink.unsubscribe();
    }

    fileChange(event: any) {

        // @ts-ignore
        let fileList: FileList = event.target.files;

        if (fileList.length > 0) {
            let file: File = fileList[0];
            console.log('sending for upload');
            this.eventBus.emit(new BusEvent(BusEventEnum.EXCEL_SINGLE_FILE, file));
            this.uploadElment.nativeElement.value = null;
        }
    }

    dispatchCreateCalendarEvent() {
        this.eventBus.emit(new BusEvent(BusEventEnum.CREATE_CALENDAR));
    }


}
