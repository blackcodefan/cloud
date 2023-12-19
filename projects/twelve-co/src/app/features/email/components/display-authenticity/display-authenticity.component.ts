import { SubSink } from 'subsink';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthenticityToken } from '../../model';

@Component({
    selector: 'app-display-authenticity',
    templateUrl: './display-authenticity.component.html',
    styleUrls: ['./display-authenticity.component.scss'],
})
export class DisplayAuthenticityComponent implements OnInit, OnDestroy {
    authenticityToken: AuthenticityToken;

    private subSink = new SubSink();

    constructor(
        private matDialogRef: MatDialogRef<DisplayAuthenticityComponent>
    ) {}

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    ngOnInit(): void {}

    closeActionModal() {
        this.matDialogRef.close();
    }
}
