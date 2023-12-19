import {AfterViewInit, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AccountSummary, DomService, isNumeric, ItemDetails, ItemOperationOptionEnum, LoaderService, LoggingService } from 'core-lib';
import ElementQueries from 'css-element-queries/src/ElementQueries';
import { switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { DatabankService } from '../../../services';
import {
    addNewBox,
    DatabankState,
    removeBox,
    renameBox,
    selectAllBoxes,
    selectNewBoxStatus,
    selectSelectedAccount,
    setCurrentPreviewType,
    setIsBoxPreview,
    setIsNewBoxStatus,
    setSelectedBox,
    setSelectedBoxById,
} from '../../../store';
import { DatabankListHeaderComponent } from './databank-list-header/databank-list-header.component';

// noinspection DuplicatedCode
@Component({
    selector: 'app-databank-list',
    templateUrl: './databank-list.component.html',
    styleUrls: [ './databank-list.component.scss' ],
})
export class DatabankListComponent implements OnInit, AfterViewInit, OnDestroy {
    boxes: Array<ItemDetails>;
    newBoxCtrl = new UntypedFormControl();
    subSink = new SubSink();
    isNewBox: boolean = false;
    selectedBox: ItemDetails;
    scroll: Boolean = false;
    boxImages: { [imageId: string]: string } = {};
    private selectedAccount: AccountSummary;

    constructor(
        private domService: DomService,
        private loader: LoaderService,
        private matSnack: MatSnackBar,
        private logger: LoggingService,
        private translateService: TranslateService,
        private databankService: DatabankService,
        private store: Store<DatabankState>,
        private router: Router,
    ) {
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.setDatabankScroll();
    }
    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectSelectedAccount)).subscribe(selectSelectedAccount => this.selectedAccount = selectSelectedAccount);
        this.subSink.sink = this.store.pipe(select(selectNewBoxStatus)).subscribe((status: any) => {
            this.isNewBox = status;
            if (this.isNewBox) {
                setTimeout(() => {
                    const newBoxInput = this.domService.getElementByID('new-box-title-input') as HTMLInputElement;
                    newBoxInput.select();
                    newBoxInput.focus();
                }, 150);
            }
        });

        this.subSink.sink = this.store.pipe(select(selectAllBoxes)).pipe(
            tap(boxes => this.boxes = boxes), // setting boxes in the store
            switchMap(boxes => this.databankService.findFolderIconsForIds(this.selectedAccount.id, boxes.filter(c => c.coverPhotoId && c.coverPhotoId.length > 0).map(c => c.coverPhotoId))),
        ).subscribe(res => {
            Object.keys(res).forEach(coverId => this.boxImages[coverId] = res[coverId]);
        });

    }

    ngAfterViewInit() {
        this.domService.appendComponentToHeader(DatabankListHeaderComponent, '_12co-data-bank-header');
        ElementQueries.listen();
        ElementQueries.init();
        setTimeout(()=> {
            this.setDatabankScroll();
        }, 500);
    }

    ngOnDestroy() {
        this.store.dispatch(setIsNewBoxStatus({ isNewBox: false }));
        this.subSink.unsubscribe();
    }

    setDatabankScroll() {
        this.scroll = this.databankHasScroll();
    }

    databankHasScroll() {
        const boxList = this.domService.getElementByID('all-boxes-container') as HTMLElement;
        return boxList?.scrollHeight > boxList?.clientHeight;
    }

    goBoxDetail(selectedBox: ItemDetails) {
        this.store.dispatch(setSelectedBox({ selectedBox }));
        this.router.navigateByUrl('/apps/databank/box/' + selectedBox.itemId);
    }

    setBoxInformation(selectedBox: ItemDetails) {
        this.store.dispatch(setSelectedBoxById({ selectedBox: selectedBox.itemId }));
        this.store.dispatch(setCurrentPreviewType({ previewType: 'box' }));
        this.store.dispatch(setIsBoxPreview({ isPreview: true }));
    }

    setBoxPreview(isPreview: boolean) {
        this.store.dispatch(setIsBoxPreview({ isPreview }));
    }

    createNewBox(rename: boolean = false) {
        this.store.dispatch(setIsNewBoxStatus({ isNewBox: true }));
        if (rename) { // should rename box
            // todo implement
        } else {
            this.saveNewBox();
        }
    }

    cancelNewBox() {
        this.store.dispatch(setIsNewBoxStatus({ isNewBox: false }));
    }

    changeBoxBg($event: Event) {
        let targetElement = $event.target as HTMLInputElement;
        let fileList = targetElement.files as FileList;
        const formData = new FormData();
        formData.append('userID', this.selectedAccount.id as unknown as string);
        formData.append('boxID', this.selectedBox.itemId);
        formData.append('boxImage', fileList[0]);
        /*
        this.dataBankService.setBgToBox(formData).subscribe((res: any) => {
            if (res.body && res.body.success) {
                this.store.dispatch(changeBoxBgImage({ boxID: this.selectedBox._id, bgImage: res.body.data.imgUrl }));
            } else if (res.body && !res.body.success) {
                alert('Something went wrong, Please try again later');
            }
        });

         */
    }


    removeImage() {
        /*
        this.dataBankService.removeBoxBG(this.selectedBox._id).subscribe((res: any) => {
            if (res.body && res.body.success) {
                this.store.dispatch(changeBoxBgImage({ boxID: this.selectedBox._id, bgImage: '' }));
            } else if (res.body && !res.body.success) {
                alert(res.body.data.msg);
            }
        });

         */
    }

    selectBox(item: any) {
        this.selectedBox = item;
    }

    saveNewBox() {
        let processedNewBoxName: string | null = null;
        if (this.newBoxCtrl.value) {
            processedNewBoxName = this.newBoxCtrl.value.replace(/(\r\n|\n|\r)/gm, '').trim();
        }
        if (processedNewBoxName === null || processedNewBoxName?.length == 0) {
            this.matSnack.open(this.translateService.instant('EMPTY_BOX_TITLE_ERROR'), 'Close');
        } else {
            if (this.boxes.filter(b => b.itemId !== 'new-box-id').map(b => b.name).indexOf(processedNewBoxName) !== -1) {
                this.matSnack.open('Box with same name already exists, please choose another one', 'error');
                return;
            }
            this.loader.showLoader();
            this.subSink.sink = this.databankService.createBox({
                accountId: this.selectedAccount.id,
                tagColor: undefined,
                parentId: undefined,
                fileOperationOption: ItemOperationOptionEnum.FILE_NEW,
                folderFullName: processedNewBoxName,
            }).subscribe(newBox => {
                this.loader.hideLoader();
                this.matSnack.open('box created succesfully');
                this.store.dispatch(setIsNewBoxStatus({ isNewBox: false }));
                console.log('response after creating new box: ', newBox);
                this.store.dispatch(addNewBox({ singleBoxItem: newBox }));
            }, error => {
                this.loader.hideLoader();
                this.matSnack.open(`${ error?.error?.message }`, 'error');
            });
        }
    }

    renameBox() {
        if (this.newBoxCtrl.valid) {
            if (!this.boxWithSameNameExists(this.newBoxCtrl.value)) {
                this.databankService.rename(this.selectedAccount.id, this.selectedBox.itemId, this.newBoxCtrl.value).subscribe((itemDetails: ItemDetails) => {
                    this.store.dispatch(renameBox({ boxId: itemDetails.itemId, boxName: itemDetails.name }));
                    this.matSnack.open('Box name changed');
                });
            } else {
                this.matSnack.open('There already exists a box with the same name');
            }
        } else {
            this.matSnack.open('Box name is incorrect');
        }
    }

    /**
     * Builds a new name
     * @private
     */
    private buildNewName(): string {
        let defaultBoxName = this.translateService.instant('NEW_BOX_NAME');

        let untitled = this.boxes.filter(b => b.name.trim().indexOf(defaultBoxName) !== -1).map(c => c.name);
        if (untitled.length == 0) {
            return defaultBoxName;
        }
        let boxEndSuffix = untitled.map(s => s.replace(defaultBoxName, ''))
            .map(s => {
                const res = s.split(' ');
                return res[res.length - 1] || s;
            }) // get the last element before a space
            .filter(s => {
                this.logger.info(`(${ s })`);
                return isNumeric(s);
            })
            .map(c => Number.parseInt(c));// cast to number
        if (boxEndSuffix.length === 0) {
            if (untitled.length > 0) {
                return `${ defaultBoxName } 1`;
            } else {
                return `${ defaultBoxName }`;
            }
        }
        let lastIndexValue = boxEndSuffix.sort()[boxEndSuffix.length - 1];
        return `${ defaultBoxName } ${ lastIndexValue + 1 }`;
    }

    private boxWithSameNameExists(boxName: string): boolean {
        const duplicatedBoxItemIndex = this.boxes.findIndex((x: any) => x.name == boxName);
        return duplicatedBoxItemIndex != -1;
    }

    handleDeleteBox(box: ItemDetails) {
        this.subSink.sink = this.databankService.deleteBox(box.itemId, this.selectedAccount.id).subscribe(res => {
            this.store.dispatch(removeBox({ boxId: box.itemId }));
        }, error => {
            this.matSnack.open(`Error deleting box ${ error?.error?.message || '' }`);
        });
    }
}
