import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { ItemOperationOptionEnum, ItemTypeEnum, LoggingService } from 'core-lib';
import { SubSink } from 'subsink';
import { UploaderService } from '../../../../../../../../core-lib/src/lib/services';
import { DuaplicationUploadEntities, DuplicationFileUpload, DuplicationHandleTypeEnum } from '../../../models';
import { DatabankService } from '../../../services';
import { DatabankState } from '../../../store';

@Component({
    selector: 'app-duplication-multiple',
    templateUrl: './duplication-multiple.component.html',
    styleUrls: [ './duplication-multiple.component.scss' ],
})
export class DuplicationMultipleComponent implements OnInit {
    readonly DuplicationHandleTypeEnum = DuplicationHandleTypeEnum;
    files: Array<DuplicationFileUpload> = [];
    accountId: number;
    folderId: string;
    selectionGroup: UntypedFormArray = new UntypedFormArray([]);
    private subSink = new SubSink();

    constructor(@Inject(MAT_DIALOG_DATA) private data: DuaplicationUploadEntities, private dialogref: MatDialogRef<DuplicationMultipleComponent>,
                private databankService: DatabankService, private logger: LoggingService, private store: Store<DatabankState>, private matSnack: MatSnackBar,
                private uploaderService: UploaderService) {
        this.files = data.files;
        this.folderId = data.parentId;
        this.accountId = data.accountId;
    }

    ngOnInit(): void {
        this.files.forEach((fle) => {
            this.selectionGroup.push(new UntypedFormControl(null));
        });
    }

    handleCancel() {
        this.dialogref.close();
    }

    handleSubmit() {
        const sze = this.files.length;
        for (let index = 0; index < sze; index++) {
            const item: DuplicationFileUpload = this.files[index];
            const action = this.selectionGroup.at(index).value as DuplicationHandleTypeEnum;
            this.handleClick(action, item, this.folderId);
        }
        this.dialogref.close();
    }

    /**
     *
     * @param idx
     * @param actionType
     */
    handleChangeForFile(idx: number, actionType: DuplicationHandleTypeEnum) {
        this.selectionGroup.at(idx).patchValue(actionType);
    }

    get submitDisabled() {
        return this.selectionGroup.controls.filter(f => !!f.value).length !== this.files.length;
    }

    handleReplaceAll() {
        this.selectionGroup.controls.forEach(c => c.patchValue(DuplicationHandleTypeEnum.REPLACE));
    }

    handleAddVersionAll() {
        this.selectionGroup.controls.forEach(c => c.patchValue(DuplicationHandleTypeEnum.ADD_VERSION));
    }

    handleClick(action: DuplicationHandleTypeEnum, duplicationFileUpload: DuplicationFileUpload, curFolderId: string) {
        let data = new FormData();
        data.append('file', duplicationFileUpload.fileBlobs);
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
            accountId: this.accountId,
            parentId: this.folderId,
            size: duplicationFileUpload.fileBlobs.size,
            mimeType: duplicationFileUpload.fileBlobs.type,
            fileOperationOption: decision,
            type: ItemTypeEnum.FILE,
        }));
        this.uploaderService.uploadFile(data, duplicationFileUpload.fileBlobs, curFolderId);

    }

    private uploadSingleFile(formData: FormData, file: File, curFolderId: string) {
        this.uploaderService.uploadFile(formData, file, curFolderId);

        // this.subSink.sink = this.databankService.uploadFile(formData).subscribe((response: HttpEvent<any>) => {
        //     if (response.type === HttpEventType.Response) {
        //         this.logger.info('Upload complete');
        //         this.store.dispatch(removeUploadFromQueue({ notificationId: (response.body as unknown as ItemDetails)?.name }));
        //         this.store.dispatch(addFileToView({ folderId: curFolderId, file: response.body as unknown as ItemDetails }));
        //     }
        //     if (response.type === HttpEventType.UploadProgress) {
        //         const percentDone = Math.round(100 * response.loaded / response.total!);
        //         this.logger.info('Progress ' + percentDone + '%');
        //         this.store.dispatch(setUploadingItemAction({
        //             item: {
        //                 fileName: file.name,
        //                 sizeUploaded: response.loaded!,
        //                 size: response.total!,
        //                 progress: percentDone,
        //                 done: response.loaded === response.total,
        //                 errorStatus: false,
        //             },
        //         }));
        //     }
        //     this.logger.info('uploaded file');
        //
        // }, (error => {
        //     this.logger.error('Error uploading file ', error?.error);
        //     this.matSnack.open(`Error uploading file : ${ error?.error?.message ?? '' }`, 'error');
        //     this.store.dispatch(setUploadingItemAction({
        //         item: {
        //             fileName: file.name,
        //             sizeUploaded: file.size,
        //             size: file.size!,
        //             progress: 0,
        //             done: false,
        //             errorStatus: true,
        //             error: error?.error?.message,
        //         },
        //     }));
        // }));
    }

}
