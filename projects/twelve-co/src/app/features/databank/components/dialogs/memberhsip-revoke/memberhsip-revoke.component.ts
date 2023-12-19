import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { BusEvent, BusEventEnum, EventBusService, ItemDetails, Membership } from 'core-lib';
import { SubSink } from 'subsink';
import { MembersService } from '../../../services/members.service';
import { DatabankState, selectSelectedBox } from '../../../store';

@Component({
    selector: 'app-memberhsip-revoke',
    templateUrl: './memberhsip-revoke.component.html',
    styleUrls: [ './memberhsip-revoke.component.scss' ],
})
export class MemberhsipRevokeComponent implements OnInit, OnDestroy {
    selectedMembership: Membership;
    private subSink = new SubSink();
    private selectedBox: ItemDetails;

    constructor(@Inject(MAT_DIALOG_DATA) data: { selectedMember: Membership }, private ref: MatDialogRef<MemberhsipRevokeComponent>, private membershipService: MembersService,
                private store: Store<DatabankState>, private matSnack: MatSnackBar, private eventBus: EventBusService) {
        this.selectedMembership = data.selectedMember;
    }

    ngOnInit(): void {
        this.subSink.sink = this.store.pipe(select(selectSelectedBox)).subscribe((selectedBox) => this.selectedBox = selectedBox);
    }

    handleClick(answer: boolean) {
        if (!answer) {
            this.ref.close();
        } else {
            this.subSink.sink = this.membershipService.revokeMembership({ storageId: this.selectedBox.itemId, membershipId: this.selectedMembership.id }).subscribe(res => {
                this.eventBus.emit(new BusEvent(BusEventEnum.REMOVE_MEMBERSHIP, this.selectedMembership.id));
            }, (error => {
                this.matSnack.open(`Error deleting membership ${ error?.error?.message ? error?.error?.message : '' }`);
            }));
        }
    }

    ngOnDestroy() {
        this.subSink.unsubscribe();
    }
}
