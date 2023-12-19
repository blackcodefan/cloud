import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { AccountSummary, EventBusService, ItemDetails, ItemOperationOptionEnum, ItemTypeEnum, LoggingService, StorageDto, UploaderService } from 'core-lib';
import { SubSink } from 'subsink';
import { DuplicationHandleTypeEnum } from '../../../models';
import { DatabankService } from '../../../services';
import { DatabankState, selectSelectedFolder } from '../../../store';

@Component({
    selector: 'app-duplication-alert',
    templateUrl: './duplication-alert.component.html',
})
export class DuplicationAlertComponent implements OnInit {
    fileName: string;
    readonly DuplicationHandleTypeEnum = DuplicationHandleTypeEnum;
    private storage: StorageDto;
    private account: AccountSummary;
    private readonly file: File;
    private readonly folderId: string;
    private subSink = new SubSink();
    private selectedFolder: ItemDetails;

    constructor(@Inject(MAT_DIALOG_DATA) private data: { storageDto: StorageDto, file: File, account: AccountSummary, folderId: string }, private uploaderService: UploaderService,
                private matSnack: MatSnackBar, public matDialogRef: MatDialogRef<DuplicationAlertComponent>, private _focusMonitor: FocusMonitor, private databankService: DatabankService,
                private store: Store<DatabankState>, private logger: LoggingService, private eventBusService: EventBusService) {
        this.fileName = (data.storageDto as any).itemName;
        this.storage = data.storageDto;
        this.file = data.file;
        this.account = data.account;
        this.folderId = data.folderId;
        //     storageDto: file, file: fileBlob
    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectSelectedFolder)).subscribe(res => this.selectedFolder = res);
    }

    ngAfterViewInit() {
        this._focusMonitor.stopMonitoring(document.getElementById('cancelButton') as HTMLElement);
    }


    handleClick(action: DuplicationHandleTypeEnum) {
        if (action !== DuplicationHandleTypeEnum.CANCEL) {
            let data = new FormData();
            data.append('file', this.file);
            let decision: ItemOperationOptionEnum;
            switch (action) {
                case DuplicationHandleTypeEnum.DUPLICATE:
                case DuplicationHandleTypeEnum.ADD_VERSION:
                    decision = ItemOperationOptionEnum.NEW_VERSION;
                    break;
                default:
                    decision = ItemOperationOptionEnum.REPLACE;
                    break;
            }
            data.append('fileDetails', JSON.stringify({
                accountId: this.account.id,
                parentId: this.folderId,
                size: this.file.size,
                mimeType: this.file.type,
                fileOperationOption: decision,
                type: ItemTypeEnum.FILE,
            }));
            this.uploadSingleFile(data, this.file);
            this.matDialogRef.close();
        } else {
            this.matDialogRef.close();
        }
    }

    private uploadSingleFile(formData: FormData, file: File) {
        this.uploaderService.uploadFile(formData, file, this.selectedFolder.itemId);
        /*
                this.subSink.sink = this.databankService.uploadFile(formData).subscribe((response: HttpEvent<any>) => {
                    if (response.type === HttpEventType.Response) {
                        this.logger.info('Upload complete');
                        const itemDetails: ItemDetails = response.body as unknown as ItemDetails;
                        this.store.dispatch(removeUploadFromQueue({ notificationId: (itemDetails)?.name }));
                        this.store.dispatch(addFileToView({ folderId: this.folderId, file: itemDetails }));
                        if (itemDetails.coverPhotoId && itemDetails.coverPhotoId.length > 1) {
                            this.subSink.sink = this.databankService.findItemIcon(itemDetails.coverPhotoId).subscribe(icon => {
                                this.eventBusService.emit(new BusEvent(BusEventEnum.ADDING_ICON, { itemDetails, icon }));
                            });
                        }
                    }
                    if (response.type === HttpEventType.UploadProgress) {
                        const percentDone = Math.round(100 * response.loaded / response.total!);
                        this.logger.info('Progress ' + percentDone + '%');
                        this.store.dispatch(setUploadingItemAction({
                            item: {
                                fileName: file.name,
                                sizeUploaded: response.loaded!,
                                size: response.total!,
                                progress: percentDone,
                                done: response.loaded === response.total,
                                errorStatus: false,
                            },
                        }));
                    }
                    this.logger.info('uploaded file');

                }, (error => {
                    this.logger.error('Error uploading file ', error?.error);
                    this.matSnack.open(`Error uploading file : ${ error?.error?.message ?? '' }`, 'error');
                    this.store.dispatch(setUploadingItemAction({
                        item: {
                            fileName: file.name,
                            sizeUploaded: file.size,
                            size: file.size!,
                            progress: 0,
                            done: false,
                            errorStatus: true,
                            error: error?.error?.message,
                        },
                    }));
                }));
            }*/
    }
}
