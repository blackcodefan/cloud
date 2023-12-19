import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { pipe } from 'rxjs';
import { SubSink } from 'subsink';
import { v4 } from 'uuid';
import { AuthService } from '../../../../../services/auth.service';
import { ConfirmToDeleteAlbumComponent } from '../../../components/confirm-to-delete-album/confirm-to-delete-album.component';
import { NewAlbumComponent } from '../../../components/new-album/new-album.component';
import { albumCatItem, AlbumItem, MediaItem } from '../../../model';
import { AlbumService } from '../../../services/album.service';
import { addNewAlbumCat, AlbumState, removeAlbumByID, setAlbumList } from '../../../store';
import { getAlbumCatList, selectSelectedAccountId } from '../../../store/album.selectors';

@Component({
    selector: 'app-albums-left-sidebar',
    templateUrl: './albums-left-sidebar.component.html',
    styleUrls: [ './albums-left-sidebar.component.scss' ],
})
export class AlbumsLeftSidebarComponent implements OnInit {
    public albumList!: Array<albumCatItem>;
    private subSink = new SubSink();

    constructor(
        private router: Router,
        private store$: Store<AlbumState>,
        private authService: AuthService,
        private matDialogService: MatDialog,
        private albumService: AlbumService,
        public cd: ChangeDetectorRef,
        public matDialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.subSink.sink = this.store$.pipe(select(selectSelectedAccountId)).subscribe(res => {
                const userID = res as unknown as string;
                this.albumService.getAlbumList(userID).subscribe((result: any) => {
                    if (result.body != undefined) {
                        const AlbumList = new Array<AlbumItem>();
                        if (result.body.list.length > 0) {
                            result.body.list.forEach((_albumItem: any) => {
                                const albumItem: AlbumItem = {
                                    id: _albumItem.id,
                                    name: _albumItem.name,
                                    originalSize: _albumItem.originalSize,
                                    size: _albumItem.size,
                                    counter: _albumItem.counter,
                                    mediaList: Array<MediaItem>(),
                                };
                                AlbumList.push(albumItem);
                            });
                            this.store$.dispatch(setAlbumList({ albumList: AlbumList }));
                        }
                    }
                    this.store$.select(pipe(getAlbumCatList)).subscribe(res => {
                        this.albumList = res;
                        this.cd.detectChanges();
                    });
                });
            },
        );
        ;
    }

    goWelcome() {
        this.router.navigateByUrl('/welcome');
    }

    newAlbum() {
        const currentDialog = this.matDialogService.open(NewAlbumComponent, { panelClass: 'new-album' });
        currentDialog.afterClosed().subscribe(res => {
            if (res.data != undefined) {
                const data: albumCatItem = {
                    name: res.data,
                    _id: v4(),
                    originalSize: 0,
                    size: '0',
                    counter: 0,
                };
                /*   this.store$.dispatch(addNewAlbumCat({album: data}));*/
                // fixme
                const submitData = {
                    userID: 'some user id',
                    albumData: data,
                };
                this.albumService.addNewAlbumCategory(submitData).subscribe((res: any) => {
                    if (res.body != undefined && res.body.success) {
                        this.store$.dispatch(addNewAlbumCat({ album: data }));
                    }
                });
            }
        });
    }

    reloadCurrentPage() {
        window.location.reload();
    }

    removeAlbum(_id: string) {
        const confirmRemoveAlbum = this.matDialog.open(ConfirmToDeleteAlbumComponent, { panelClass: 'confirm-to-delete-album' });
        confirmRemoveAlbum.afterClosed().subscribe(x => {
            if (x && x.action) {
                this.store$.dispatch(removeAlbumByID({ albumID: _id }));
                location.href = '/features/albums/All';
            }
        });
    }
}
