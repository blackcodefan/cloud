import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import {
    AccountSummary,
    BusEventEnum,
    DomService,
    EventBusService,
    FolderTreeContentDto,
    ItemDetails,
    ItemOperationOptionEnum,
    ItemTypeEnum,
    LoggingService,
    NewFolderDetails,
    selectDecryptionStatus,
    StoragesMinDto,
    StoragesStatus,
    StorageStatus,
    UploaderService,
} from 'core-lib';
import { FileSaverService } from 'ngx-filesaver';
import { distinctUntilChanged } from 'rxjs';
import { SubSink } from 'subsink';
import { ImageDetailComponent, PdfPreviewComponentComponent } from '../..';
import { DatabankService } from '../../../services';
import {
    addFileToView,
    addFolderToView,
    DatabankState,
    deleteFolderFromView,
    removeFileFromFolder,
    selectBoxContent,
    selectBoxFolderIds,
    selectNewFolderStatus,
    selectSelectedAccount,
    selectSelectedBox,
    selectSelectedFile,
    setBoxContent,
    setCurrentPreviewType,
    setIsBoxPreview,
    setNewFolderStatus,
    setSelectedFile,
    setSelectedFolder,
} from '../../../store';
import { DuplicationAlertComponent, DuplicationMultipleComponent } from '../../dialogs';
import { MediaPreviewComponent } from '../../media-preview/media-preview.component';
import { DatabankDetailHeaderComponent } from './databank-detail-header/databank-detail-header.component';
import heic2any from "heic2any";

// noinspection DuplicatedCode
@Component({
    selector: 'app-databank-detail',
    templateUrl: './databank-detail.component.html',
    styleUrls: [ './databank-detail.component.scss' ],
})
export class DatabankDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    currentBox: any;
    isFolder: boolean;
    boxId: string;
    folderId: string;
    folderList: Array<FolderTreeContentDto>;
    todayDate: string;
    subSink = new SubSink();
    newFolderCtrl = new UntypedFormControl();
    contextMenuPosition: any = { x: '', y: '' };
    thumbnails: { [thumbnailId: string]: string } = {};
    allowDecrypt: boolean = false;
    private imageExtensions = [ 'jpg', 'jpeg', 'png', 'gif', 'jpeg', 'tiff', 'eps' ];
    @ViewChild('fileRightMenuHandler', { read: MatMenuTrigger, static: true }) fileRightMenuHandler!: MatMenuTrigger;
    private account: AccountSummary;
    private selectedBox: ItemDetails;
    private selectedFile: ItemDetails;

    constructor(
        private domService: DomService,
        private logger: LoggingService,
        private fileSaverService: FileSaverService,
        private matSnack: MatSnackBar,
        private router: Router,
        private store: Store<DatabankState>,
        private route: ActivatedRoute,
        private databankService: DatabankService,
        private matDialog: MatDialog,
        private renderer: Renderer2,
        private uploaderService: UploaderService,
        private eventBus: EventBusService,
    ) {
        this.renderer.listen('window', 'click', (event: any) => {
            if (this.fileRightMenuHandler != undefined && this.fileRightMenuHandler.menuOpen) {
                this.fileRightMenuHandler.closeMenu();
            }
        });
    }

    ngOnInit(): void {
        this.getTodayDate();
        this.subSink.sink = this.store.pipe(
            select(selectDecryptionStatus),
            distinctUntilChanged(),
        ).subscribe((decryptionStatus: boolean) => {
            this.allowDecrypt = decryptionStatus;
            this.subSink.sink = this.store.pipe(select(selectBoxFolderIds)).subscribe((folderIds: Array<string>) => {
                folderIds.forEach(fid => {
                    this.subSink.sink = this.databankService.findAllIconsInStorage(fid).subscribe((thumbnails) => {
                        this.thumbnails = { ...this.thumbnails, ...thumbnails };
                    });
                });
            });

        });
        this.subSink.sink = this.store.pipe(select(selectBoxFolderIds)).subscribe((folderIds: Array<string>) => {
            folderIds.forEach(fid => {
                this.subSink.sink = this.databankService.findAllIconsInStorage(fid).subscribe((thumbnails) => {
                    this.thumbnails = { ...this.thumbnails, ...thumbnails };
                });
            });
        });

        this.subSink.sink = this.eventBus.on(BusEventEnum.UPLOADED_IMAGE, ({ file, itemDetails, folderId }) => this.toBase64(file, itemDetails, folderId));
        this.subSink.sink = this.eventBus.on(BusEventEnum.UPLOADED_FILE, ({ folderId, file }) => this.store.dispatch(addFileToView({ folderId, file })));
        this.subSink.sink = this.store.pipe(select(selectSelectedBox)).subscribe(box => this.selectedBox = box);
        this.subSink.sink = this.store.pipe(select(selectSelectedAccount)).subscribe(acc => this.account = acc);
        this.subSink.sink = this.store.pipe(select(selectBoxContent)).subscribe((content) => {
                this.folderList = content;
        });
        this.boxId = this.route.snapshot.params.folderId;
        this.subSink.sink = this.store.pipe(select(selectSelectedFile)).subscribe(res => this.selectedFile = res);
        this.subSink.sink = this.databankService.listStorageContentAsTree(this.boxId).subscribe((boxContent: Array<FolderTreeContentDto>) => {
            this.store.dispatch(setBoxContent({ boxContent }));
        }, error => {
            this.matSnack.open(`Error fetching content for storage ${ error?.error?.message || '' }`);
        });

        this.subSink.sink = this.store.pipe(select(selectNewFolderStatus)).subscribe((flag: any) => {
            this.isFolder = flag;
            if (this.isFolder) {
                this.focusOnInput();
            }
        });
    }

    private focusOnInput() {
        setTimeout(() => {
            const newFolderElement = document.getElementById('new-folder-title-input') as HTMLInputElement;
            newFolderElement.select();
            newFolderElement.focus();
            this.scrollToRightDetailBox();
        }, 150);
    }

    ngAfterViewInit() {
        this.domService.appendComponentToHeader(DatabankDetailHeaderComponent, '_12co-data-bank-header');
    }

    ngOnDestroy() {
        this.store.dispatch(setNewFolderStatus({ folderStatus: false }));
        this.subSink.unsubscribe();
    }

    scrollToRightDetailBox() {
        const detailElement = document.getElementById('_12co-databank-detail') as HTMLElement;
        detailElement.scrollLeft = detailElement.scrollWidth;
    }

    cancelNewFolder() {
        this.store.dispatch(setNewFolderStatus({ folderStatus: false }));
        this.newFolderCtrl.reset();
    }

    createNewFolder() {
        let newFolderName = this.newFolderCtrl.value as string || '';
        if (newFolderName?.length > 0) {
            if (this.nameExists(newFolderName)) {
                this.matSnack.open(`Folder with name ${ newFolderName } already exists`);
                this.focusOnInput();
                return;
            }
            const folderDetails: NewFolderDetails = {
                accountId: this.account.id,
                folderFullName: newFolderName,
                fileOperationOption: ItemOperationOptionEnum.FILE_NEW,
                parentId: this.selectedBox.itemId,
            };
            this.databankService.createFolder(folderDetails).subscribe((folder: ItemDetails[]) => {
                const newFolder = folder[folder.length - 1];
                this.store.dispatch(setNewFolderStatus({ folderStatus: false }));
                this.newFolderCtrl.reset();
                this.scrollToRightDetailBox();
                this.store.dispatch(addFolderToView({ boxId: this.boxId, folder: newFolder }));
            }, error => {
                this.matSnack.open(`Error creating new folder: ${ error?.error?.message }`);
            });


        }
    }

    uploadFiles(event: any) {
        this.logger.info('--------> uploading files');
        let targetElement = event.target as HTMLInputElement;
        let fileList = targetElement.files as FileList;
        this.uploadFileList(fileList, this.folderId);
        event.target.value = null;
    }

    getTodayDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const monthList = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
        this.todayDate = day + '  ' + monthList[month] + ', ' + year;
    }

    showFileRightMenu(event: MouseEvent, menuData: ItemDetails) {
        event.preventDefault();
        if (this.fileRightMenuHandler.menuOpen) {
            this.fileRightMenuHandler.closeMenu();
        }
        this.fileRightMenuHandler.menuData = menuData;
        this.contextMenuPosition.x = `${ event.x }px`;
        this.contextMenuPosition.y = `${ event.y }px`;
        setTimeout(() => {
            this.store.dispatch(setSelectedFile({ selectedFile: menuData }));
            this.fileRightMenuHandler.openMenu();
            this.fileRightMenuHandler.menu.focusFirstItem('mouse');
        }, 300);
    }

    goInformation(selectedFolder: ItemDetails) {
        this.store.dispatch(setSelectedFolder({ selectedFolder }));
        this.store.dispatch(setCurrentPreviewType({ previewType: 'folder' }));
        this.store.dispatch(setIsBoxPreview({ isPreview: true }));
    }

    goToFileInformation() {
        this.store.dispatch(setCurrentPreviewType({ previewType: 'file' }));
        this.store.dispatch(setIsBoxPreview({ isPreview: true }));
    }


    private uploadFileList(fileList: FileList, curFolderId: string) {
        let filesToUpload = Array.from(fileList);
        //@ts-ignore
        let storagesDto: StoragesStatus = { accountId: this.account?.id, parentId: curFolderId};
        storagesDto.storages = filesToUpload.map((fle) => {
            let newName = fle.name;
            if (/image\/hei(c|f)/.test(fle.type)) {
                newName = newName.replace(/\.[^/.]+$/, ".jpg");
            }
            return {
                itemName: newName,
                type:  newName.match(/.(jpg|jpeg|png|gif)$/i) ? ItemTypeEnum.PICTURE : ItemTypeEnum.FILE,
                itemId: '',
            };
          },
        );

        this.subSink.sink = this.databankService.checkItemsExist(storagesDto).subscribe((res: StorageStatus[]) => {
                const filesNotInStorage = res.filter((status) => !status.exist).map(f => f.itemName); //  file doesn't exist, safe to upload
                const filesWhereActionIsRequired = res.filter((status) => status.exist); // file already exits, user confirm selection
                filesToUpload.filter(f => filesNotInStorage.indexOf(f.name) !== -1 || (/image\/hei(c|f)/.test(f.type))).forEach((file: File) => {
                        this.logger.info(`uploading ${ file.name }`);
                        let convProm: Promise<any>;
                        if (/image\/hei(c|f)/.test(file.type)) {
                            let _blob:Blob = file;
                            let _file:File = file;
                            convProm = heic2any({blob: _blob, toType:"image/jpeg",quality:0}).then((jpgBlob:any) => {

                                //Change the name of the file according to the new format
                                let newName = file.name.replace(/\.[^/.]+$/, ".jpg");

                                //Convert blob back to file
                                file = this.blobToFile(jpgBlob,newName);
                                console.log(file);

                            }).catch(err => {
                                //Handle error
                            });
                        } else {
                            convProm = Promise.resolve(true);
                        }
                        convProm.then(() => {
                            console.log(file);
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('fileDetails', JSON.stringify({
                                accountId: this.account.id,
                                parentId: curFolderId,
                                size: file.size,
                                mimeType: file.type,
                                fileOperationOption: ItemOperationOptionEnum.FILE_NEW,
                                type: ItemTypeEnum.FILE,
                            }));
                            this.uploadSingleFile(formData, file, curFolderId);
                        });
                    },
                );
                if (filesWhereActionIsRequired.length == 1) {
                    const fileName = filesWhereActionIsRequired[0];
                    const fileBlob = filesToUpload.filter(f => f.name === fileName.itemName)?.[0];
                    this.matDialog.open(DuplicationAlertComponent, { data: { storageDto: fileName, file: fileBlob, account: this.account, folderId: curFolderId } });
                } else if (filesWhereActionIsRequired.length > 1) {
                    const duplicationFileUpload = filesWhereActionIsRequired.map(f => {
                        return { fileName: f.itemName, storage: f, fileBlobs: filesToUpload.filter(file => file.name === f.itemName)?.[0] };
                    });
                    this.matDialog.open(DuplicationMultipleComponent, {
                        data: { files: duplicationFileUpload, accountId: this.account.id, parentId: curFolderId },
                    });
                }

            });
    }

    private blobToFile = (theBlob: Blob, fileName:string): File => {
        let b: any = theBlob;

        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        b.lastModified = new Date();
        b.name = fileName;

        //Cast to a File() type
        return <File>theBlob;
    }

    private uploadSingleFile(formData: FormData, file: File, curFolderId: string) {
        this.uploaderService.uploadFile(formData, file, curFolderId);
    }

    /**
     * Check element is image
     * @param value
     * @private
     */
    private isImage(value: ItemDetails) {
        const extension = value?.extension?.toLowerCase()?.replace('.', '') || '';
        return this.imageExtensions.indexOf(extension) !== -1;
    }

    private isMedia(data: ItemDetails) {
        return data.extension!.toLowerCase() === 'mp4a' ||  data.extension!.toLowerCase() === 'flac'
            || data.extension!.toLowerCase() === 'ogg' ||  data.extension!.toLowerCase() === 'oga'
            || data.extension!.toLowerCase() === 'wav' ||  data.extension!.toLowerCase() === 'mp3'
            || data.extension!.toLowerCase() === 'm3u' ||  data.extension!.toLowerCase() === 'mov'
            || data.extension!.toLowerCase() === 'mp4';
    }

    private nameExists = (folderName) => {
        return !!this.folderList.find(b => b.name.toLowerCase() === folderName);
    };

    toBase64 = (file, itemDetails, curFolderId) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (this.allowDecrypt) {
                this.thumbnails[itemDetails.coverPhotoId] = reader.result as unknown as string;
            }

            this.store.dispatch(addFileToView({ folderId: curFolderId, file: itemDetails }));
        };
        reader.onerror = error => reject(error);
    });

    handleDownload() {
        this.subSink.sink = this.databankService.downloadStorage(this.selectedFile.itemId).subscribe(res => {
            this.fileSaverService.save(res, this.selectedFile.name, this.selectedFile.extension);
        });
    }

    handleUploadNewVersion() {
        // this.databankService.uploadFile()
    }

    handleDeleteFile() {
        const fileItem = this.selectedFile;
        const a: StoragesMinDto = {
            accountId: this.account.id, storages: [
                //@ts-ignore
                {
                    itemId: fileItem.itemId,
                    name: fileItem.name,
                    path: fileItem.path as unknown as string,
                    ownerId: fileItem.ownerAccountId,
                    type: ItemTypeEnum.FILE,
                },
            ],
        };
        this.subSink.sink = this.databankService.deleteItems(a).subscribe(res => {
            // todo update res
            // @ts-ignore
            let pathItem = fileItem.path.split('/');
            const folderId = pathItem[pathItem.length - 1] as string;
            this.store.dispatch(removeFileFromFolder({ folderId, fileId: fileItem.itemId }));
        }, error => {
            this.matSnack.open('Error deleting file');
        });
    }

    handlePreview() {
        if (this.isImage(this.selectedFile)) {
            const dialogRef = this.matDialog.open(ImageDetailComponent, { panelClass: 'image-preview' });
            dialogRef.componentInstance.imageId = this.selectedFile.itemId;
        }
        if (this.selectedFile.extension === 'pdf') {
            this.matDialog.open(PdfPreviewComponentComponent, { panelClass: 'image-preview', data: { storageId: this.selectedFile.itemId } });

        }
        if (this.isMedia(this.selectedFile)) {
            this.matDialog.open(MediaPreviewComponent, { panelClass: 'image-preview', data: { storageId: this.selectedFile.itemId, extension: this.selectedFile.extension } });

        }
    }

    handleRename() {

    }

    /**
     * Delete folder and contents
     */
    deleteFolder(folder: ItemDetails) {
        console.debug(folder);
        const fileItem = folder;
        const folderToDelete: StoragesMinDto = {
            accountId: this.account.id, storages: [
                //@ts-ignore
                {
                    itemId: fileItem.itemId,
                    name: fileItem.name,
                    path: fileItem.path as unknown as string,
                    ownerId: fileItem.ownerAccountId,
                    type: ItemTypeEnum.FOLDER,
                },
            ],
        };

        this.subSink.sink = this.databankService.deleteItems(folderToDelete).subscribe(res => {
            this.store.dispatch(deleteFolderFromView({ folderId: folder.itemId, boxId: this.selectedBox.itemId }));
            this.matSnack.open('Folder deleted successfully');
        }, error => {
            this.matSnack.open(`Error deleting folder ${ error?.error?.message }`);
        });
    }

    itemDetailsTrackBy(index, item: ItemDetails) {
        return item.itemId;
    }
}
