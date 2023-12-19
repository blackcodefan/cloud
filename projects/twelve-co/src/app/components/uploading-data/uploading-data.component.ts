import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BusEvent, BusEventEnum, EventBusService, UploaderService,UploadDetail, UploadWrapper } from 'core-lib';
import { interval, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import {clearUploadQueue, DatabankState, removeUploadFromQueue, selectUploadState} from '../../features/databank/store';
@Component({
    selector: 'app-uploading-data',
    templateUrl: './uploading-data.component.html',
    styleUrls: [ './uploading-data.component.scss' ],
})
export class UploadingDataComponent implements OnInit {

    uploadNotificationData: Array<UploadDetail>;
    @Input() boxId: any;
    @Output() closeUploadNotify = new EventEmitter();
    panelOpenState = true;
    progress$!: Observable<string>;
    uploadingContext: UploadWrapper;
    itemsPending: number = 0;
    totalItems = 0;

    constructor(
        private store: Store<DatabankState>,
        private uploadService: UploaderService,
        private eventBus: EventBusService) {
    }

    ngOnInit(): void {
        this.progress$ = interval(300).pipe(
            map(val => '.'.repeat(val % 4)),
        );
        this.store.pipe(
            select(selectUploadState),
            distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
            .subscribe((uploadList: UploadWrapper) => {
                this.uploadingContext = uploadList;
                this.uploadNotificationData = Object.keys(uploadList).map(k => uploadList[k]);
                this.totalItems = Object.keys(uploadList).length;
                this.itemsPending = Object.keys(uploadList).length - [ ...Object.entries(this.uploadingContext).map((entry) => entry[1]) ].map(e => e.done).length;
            });
    }

    removeAllNotifications() {
        this.store.dispatch(clearUploadQueue());
    }

    /**
     * Cancel upload for current upload item
     */
    handleCancelUpload(uploadItem: UploadDetail) {
        console.debug('clicked cancel upload');
        this.eventBus.emit(new BusEvent(BusEventEnum.CANCEL_UPLOAD, uploadItem));
        this.uploadService.handleCancelUploadForItem(uploadItem.uuid);
        this.store.dispatch(removeUploadFromQueue({notificationId: uploadItem.uuid}));
    }
}
