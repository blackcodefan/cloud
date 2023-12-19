import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { pipe } from 'rxjs';
import { MediaItem } from '../../model';
import { AlbumState } from '../../store';
import { getMediaListByAlbumID } from '../../store/album.selectors';

@Component({
    selector: 'app-album-detail',
    templateUrl: './album-detail.component.html',
    styleUrls: [ './album-detail.component.scss' ],
})
export class AlbumDetailComponent implements OnInit {
    @Input() mediaItem!: MediaItem;
    @Input() albumID!: string;
    mediaList!: Array<MediaItem>;
    currentIndex!: number;

    constructor(
        private matDialog: MatDialogRef<AlbumDetailComponent>,
        private store$: Store<AlbumState>,
    ) {
    }

    ngOnInit(): void {
        console.log(this.albumID);
        this.store$.select(pipe(getMediaListByAlbumID(this.albumID))).subscribe((x: Array<MediaItem>) => {
            this.mediaList = x;
            this.currentIndex = this.mediaList.findIndex(x => x.id == this.mediaItem.id);
        });
    }

    close_modal() {
        this.matDialog.close();
    }

    nextImage(id: string) {
        this.currentIndex = this.mediaList.findIndex(x => x.id == id);
        this.currentIndex++;
        this.mediaItem = this.mediaList[this.currentIndex];
    }

    prevImage(id: string) {
        this.currentIndex = this.mediaList.findIndex(x => x.id == id);
        this.currentIndex--;
        this.mediaItem = this.mediaList[this.currentIndex];
    }

}
