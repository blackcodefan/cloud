import { HttpEventType, HttpResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { DomService, FileSizePipe } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { pipe } from 'rxjs';
import { SubSink } from 'subsink';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { setAppTitle } from '../email/store';
import { AlbumCounterComponent } from './components/album-counter/album-counter.component';
import { AlbumDetailComponent } from './components/album-detail/album-detail.component';
import { AlbumsLeftSidebarComponent, AlbumsRightSidebarComponent } from './layout';
import { AlbumItem, MediaItem } from './model';
import { AlbumService } from './services/album.service';
import { addNewMedia, AlbumState, setAlbumID, setMediaCounter } from './store';
import { getAlbums, selectSelectedAccountId } from './store/album.selectors';

@Component({
    selector: 'app-albums',
    templateUrl: './albums.component.html',
    styleUrls: [ './albums.component.scss' ],
})
export class AlbumsComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('albumItemRightMenuTrigger', { read: MatMenuTrigger, static: true }) albumItemRightMenuHandler!: MatMenuTrigger;
    public mediaList: Array<MediaItem>;
    public gridView: boolean;
    public albumID!: string;
    public searchStatus!: boolean;
    public progressInfos: any;
    public userID: string;
    public uploadedFileCount: number = 0;
    public uploadedFileTotalSize: number = 0;
    public spinnerMessage!: string;
    contextMenuPosition: any = { x: '', y: '' };
    private fileSizePipe = new FileSizePipe();
    private subSink = new SubSink();

    constructor(
        private matDialog: MatDialog,
        public domService: DomService,
        private albumService: AlbumService,
        private authService: AuthService,
        private store$: Store<AlbumState>,
        public cd: ChangeDetectorRef,
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private renderer: Renderer2,
        private spinner: NgxSpinnerService,
    ) {
        this.progressInfos = [];
        this.mediaList = new Array<MediaItem>();
        this.gridView = true;
        this.subSink.sink = this.store$.pipe(select(selectSelectedAccountId)).subscribe(res => this.userID = res as unknown as string);
        this.renderer.listen('window', 'click', (event: any) => {
            if (this.albumItemRightMenuHandler != undefined && this.albumItemRightMenuHandler.menuOpen) {
                this.albumItemRightMenuHandler.closeMenu();
            }
        });
    }

    ngOnInit(): void {
        localStorage.setItem('authData', JSON.stringify({ _id: 1, email: 'jaimedelburgo@outlook.com' }));

        this.route.params.subscribe((res: any) => {
            this.albumID = res.albumID;
            this.getCurrentAlbumMediaList();
            this.store$.select(pipe(getAlbums)).subscribe((albumList: Array<AlbumItem>) => {
                console.log(res.albumID);
                if (res.albumID == 'All') {
                    this.store$.dispatch(setAlbumID({ albumID: this.albumID }));
                    this.store$.dispatch(setAppTitle({ appTitle: 'All Photos' }));
                } else {
                    const currentAlbum = albumList.find(x => x.id == res.albumID);
                    if (currentAlbum) {
                        this.store$.dispatch(setAlbumID({ albumID: this.albumID }));
                        this.store$.dispatch(setAppTitle({ appTitle: currentAlbum.name }));
                    }
                }
            });
        });
    }

    ngAfterViewInit() {
        this.domService.appendComponentToHeader(AlbumCounterComponent);
        this.domService.appendComponentToSidebar(AlbumsLeftSidebarComponent);
        this.domService.appendComponentToRightSide(AlbumsRightSidebarComponent);
        this.albumService.getSearchAlbumStatus().subscribe(res => {
            this.searchStatus = res;
            if (this.searchStatus)
                setTimeout(() => {
                    this.focusSearchElement();
                }, 100);
        });
        this.albumService.getCurrentAlbumMediaStatus().subscribe(res => {
            if (res) {
                this.getCurrentAlbumMediaList();
            }
        });
    }

    getCurrentAlbumMediaList() {
        this.albumService.getMediasByAlbumID(this.albumID, this.userID).subscribe((mediaList: any) => {
            this.mediaList = new Array<MediaItem>();
            mediaList.list.forEach((_mediaItem: any) => {
                const mediaItem: MediaItem = {
                    id: _mediaItem._id,
                    name: _mediaItem.name,
                    mediaUrl: environment.apiUrl + _mediaItem.path,
                    mediaSize: this.fileSizePipe.transform(_mediaItem.size),
                    mediaOriginalSize: _mediaItem.originalSize,
                    mediaType: _mediaItem.type,
                    mediaHeight: 0,
                    mediaWidth: 0,
                    date: new Date(),
                };
                this.mediaList.push(mediaItem);
            });
            this.store$.dispatch(setMediaCounter({ counter: this.mediaList.length }));
            this.spinner.hide();
            this.cd.detectChanges();
        });
    }

    focusSearchElement() {
        const searchInput = document.getElementById('searchAlbum') as HTMLInputElement;
        searchInput.select();
        searchInput.focus();
    }

    hideSearchAlbumContainer() {
        this.albumService.setSearchAlbumStatus(false);
    }

    // drag and drop files and folder part -- Start --//
    onAreaDragOver(event: DragEvent) {
        event.preventDefault();
    }

    onAreaDragEnter(event: DragEvent) {
        event.preventDefault();
    }

    onAreaDragLeave(event: DragEvent) {
        event.stopPropagation();
    }

    onAreaDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        let idx = 0;
        for (let i = 0; i < event.dataTransfer!.files.length; i++) {
            const _URL = window.URL || window.webkitURL;
            const file = event.dataTransfer!.files[i];
            const fileCount = event.dataTransfer!.files.length;
            let mediaUrl = '';
            let mediaType = '';
            let mediaHeight = 280;
            let mediaWidth = 280;
            const mediaSize = this.fileSizePipe.transform(file.size);
            if (file.type.includes('image')) {
                mediaType = 'image';
                this.upload(idx, file, fileCount);
                const _reader = new FileReader();
                _reader.onload = (e: any) => {
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
                _reader.readAsDataURL(file);
            }
            /*  else {
                  mediaType = 'video';
                  const mediaItem = this.albumService.createNewMedia(file.name, mediaUrl, mediaType, file.size,  mediaSize, mediaHeight, mediaWidth);
                  this.store$.dispatch(addNewMedia({mediaItem, albumID: 'all'}));
              }*/
            idx += 1;
        }
    }

    openImage(_mediaItem: MediaItem) {
        this.zone.run(() => {
            const dialogRef = this.matDialog.open(AlbumDetailComponent, {
                panelClass: 'image-preview',
                maxWidth: '100vw',
                maxHeight: '100vh',
                height: '100%',
                width: '100%',
            });
            dialogRef.componentInstance.mediaItem = _mediaItem;
            dialogRef.componentInstance.albumID = this.albumID;
        });
    }

    showAlbumItemRightMenuOpen($event: MouseEvent) {
        $event.preventDefault();
        if (this.albumItemRightMenuHandler.menuOpen) {
            this.albumItemRightMenuHandler.closeMenu();
        }
        this.contextMenuPosition.x = `${ $event.x }px`;
        this.contextMenuPosition.y = `${ $event.y }px`;
        setTimeout(() => {
            this.albumItemRightMenuHandler.openMenu();
            this.albumItemRightMenuHandler.menu.focusFirstItem('mouse');
        }, 300);
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
                    this.cd.detectChanges();
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
                                this.getCurrentAlbumMediaList();
                                this.uploadedFileCount = 0;
                                this.uploadedFileTotalSize = 0;
                            }
                        });
                    }
                }
            }, err => {
                this.progressInfos[idx].value = 0;
                this.cd.detectChanges();
            },
        );
    }

    ngOnDestroy() {
        this.subSink.unsubscribe();
    }

}
