import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { DatabankState, selectSelectedBox, setNewFolderStatus } from '../../../../store';

@Component({
    selector: 'app-databank-detail-header',
    templateUrl: './databank-detail-header.component.html',
    styleUrls: [ './databank-detail-header.component.scss' ],
})
export class DatabankDetailHeaderComponent implements OnInit {
    currentBox: any;
    loading: Boolean = false;

    constructor(private route: ActivatedRoute, private router: Router, private store: Store<DatabankState>) {
    }

    ngOnInit(): void {
        this.store.pipe(select(selectSelectedBox)).subscribe(res => {
            if (res.itemId != '') {
                this.currentBox = res;
                this.loading = true;
            }
        });
    }

    goBack() {
        this.router.navigateByUrl('/apps/databank');
    }

    newFolder() {
        this.store.dispatch(setNewFolderStatus({ folderStatus: true }));
    }
}
