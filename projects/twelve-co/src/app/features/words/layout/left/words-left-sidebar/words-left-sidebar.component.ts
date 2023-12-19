import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BusEvent, BusEventEnum, EventBusService } from 'core-lib';
import { SubSink } from 'subsink';
import { WordsDataService } from '../../../services/words-data.service';

@Component({
    selector: 'app-words-left-sidebar',
    templateUrl: './words-left-sidebar.component.html',
    styleUrls: [ './words-left-sidebar.component.scss' ],
})
export class WordsLeftSidebarComponent implements OnInit {
    @ViewChild('inputElement')
    uploadElment: ElementRef;
    selectedCalendarId: string;
    private subSink = new SubSink();

    constructor(private wordService: WordsDataService, private eventBus: EventBusService) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    dispatchCreateWord() {
        this.eventBus.emit(new BusEvent(BusEventEnum.CREATE_CALENDAR));
    }

    fileChange($event: Event) {
        // @ts-ignore
        let fileList: FileList = event.target.files;

        if (fileList.length > 0) {
            let file: File = fileList[0];
            console.log('sending for upload');
            this.eventBus.emit(new BusEvent(BusEventEnum.WORD_SINGLE_FILE, file));
            this.uploadElment.nativeElement.value = null;
        }
    }
}
