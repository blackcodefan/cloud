import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { FileSizePipe } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { pipe } from 'rxjs';
import { SubSink } from 'subsink';
import { AuthService } from '../../../../../services/auth.service';
import { AlbumMembersComponent } from '../../../components/album-members/album-members.component';
import { AlbumService } from '../../../services/album.service';
import { addNewMedia, AlbumState } from '../../../store';
import { getAlbumID, selectSelectedAccountId } from '../../../store/album.selectors';

@Component({
    selector: 'app-albums-right-sidebar',
    templateUrl: './albums-right-sidebar.component.html',
    styleUrls: [ './albums-right-sidebar.component.scss' ],
})
export class AlbumsRightSidebarComponent implements OnInit, OnDestroy {
    $loading: boolean = false;
    albumID!: string;
    subscription = new SubSink();
    sort: string = 'Date';
    sortMessage: string = 'Oldest';
    progressInfos: any;
    userID: string;
    uploadedFileCount: number = 0;
    uploadedFileTotalSize: number = 0;
    spinnerMessage!: string;
    private fileSizePipe = new FileSizePipe();

    constructor(private albumService: AlbumService, private store$: Store<AlbumState>, private matDialogService: MatDialog,
                private authService: AuthService, private spinner: NgxSpinnerService) {
        this.progressInfos = [];

    }

    ngOnInit(): void {
        this.subscription.sink = this.store$.pipe(select(selectSelectedAccountId)).subscribe(res => this.userID = res as unknown as string);
        this.subscription.sink = this.store$.select(pipe(getAlbumID)).subscribe(id => {
            this.albumID = id;
            this.$loading = true;
        });
    }

    uploadImages($event: Event) {
        let targetElement = $event.target as HTMLInputElement;
        let fileList = targetElement.files as FileList;
        const fileCount = fileList.length;
        let idx = 0;
        Array.prototype.forEach.call(fileList, file => {
            if (file.type.includes('image')) {
                let mediaUrl = '';
                let mediaType = 'image';
                let mediaHeight = 280;
                let mediaWidth = 280;
                this.upload(idx, file, fileCount);
                const mediaSize = this.fileSizePipe.transform(file.size);
                const reader = new FileReader();
                const _URL = window.URL || window.webkitURL;
                reader.onload = (e: any) => {
                    mediaUrl = e.target['result'];
                    const img = new Image();
                    const objectUrl = _URL.createObjectURL(file);
                    img.onload = () => {
                        if (img.width > img.height) {
                            mediaHeight = Math.floor(280 * img.height / img.width);
                        } else {
                            mediaWidth = Math.floor(280 * img.width / img.height);
                        }
                        _URL.revokeObjectURL(objectUrl);
                        const mediaItem = this.albumService.createNewMedia(file.name, mediaUrl, mediaType, file.size, mediaSize, mediaHeight, mediaWidth);
                        this.store$.dispatch(addNewMedia({ mediaItem, albumID: this.albumID }));
                    };
                    img.src = objectUrl;
                };
                reader.readAsDataURL(file);
                idx += 1;
            }
        });
    }

    upload(idx: number, file: File, count: number) {
        this.progressInfos[idx] = { value: 0, fileName: file.name };
        if (idx) {
            this.spinnerMessage = 'Upload the images';
            this.spinner.show();
        }
        this.albumService.upload(file, this.userID, this.albumID).subscribe(
            event => {
                if (event.type === HttpEventType.UploadProgress) {
                    this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total!);
                } else if (event instanceof HttpResponse) {
                    this.uploadedFileCount += 1;
                    this.uploadedFileTotalSize = this.uploadedFileTotalSize + file.size;
                    if (this.uploadedFileCount == count) {
                        const data = {
                            count: this.uploadedFileCount,
                            size: this.uploadedFileTotalSize,
                            albumID: this.albumID,
                            userID: this.userID,
                        };
                        this.albumService.updateFileCounter(data).subscribe((res: any) => {
                            if (res.body != undefined && res.body.success) {
                                this.albumService.updateCurrentAlbumMediaStatus(true);
                                this.uploadedFileCount = 0;
                                this.uploadedFileTotalSize = 0;
                            }
                        });
                    }
                }
            }, err => {
                this.progressInfos[idx].value = 0;
            },
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    goAlbumInvite() {
        this.matDialogService.open(AlbumMembersComponent, { panelClass: 'add-album-member' });
    }

    showAlbumSearchBar() {
        this.albumService.setSearchAlbumStatus(true);
    }

}
