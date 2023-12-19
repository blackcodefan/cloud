import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { pipe } from 'rxjs';
import { AlbumState } from '../../store';
import { getAlbumCounter } from '../../store/album.selectors';

@Component({
    selector: 'app-album-counter',
    templateUrl: './album-counter.component.html',
    styleUrls: [ './album-counter.component.scss' ],
})
export class AlbumCounterComponent implements OnInit {
    counter!: number;

    constructor(
        private store$: Store<AlbumState>,
        private cd: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.store$.select(pipe(getAlbumCounter)).subscribe(counter => {
            this.counter = counter;
            this.cd.detectChanges();
        });
    }

}
