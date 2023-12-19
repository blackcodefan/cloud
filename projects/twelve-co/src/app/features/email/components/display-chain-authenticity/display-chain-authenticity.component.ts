import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { AuthenticityToken } from '../../model';

@Component({
  selector: 'app-display-chain-authenticity',
  templateUrl: './display-chain-authenticity.component.html',
  styleUrls: ['./display-chain-authenticity.component.scss']
})
export class DisplayChainAuthenticityComponent implements OnInit {

    authenticityToken: AuthenticityToken;

    private subSink = new SubSink();

    constructor(
        private matDialogRef: MatDialogRef<DisplayChainAuthenticityComponent>
    ) {}

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    ngOnInit(): void {}

    closeActionModal() {
        this.matDialogRef.close();
    }
}
