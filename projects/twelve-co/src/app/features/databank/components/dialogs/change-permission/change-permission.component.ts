import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Membership } from 'core-lib';

@Component({
    selector: 'app-change-permission',
    templateUrl: './change-permission.component.html',
    styleUrls: [ './change-permission.component.scss' ],
})
export class ChangePermissionComponent implements OnInit {
    selectedMembership: Membership;
    sm: string;
    checked: boolean;

    constructor(@Inject(MAT_DIALOG_DATA) data: { selectedMember: Membership }, private ref: MatDialogRef<ChangePermissionComponent>) {
        this.selectedMembership = data.selectedMember;
    }

    ngOnInit(): void {
    }

    /**
     * Handle click value
     * @param clickValue
     */
    handleClick(clickValue: boolean) {
        if (!clickValue) {
            this.ref.close();
        }
    }

    handleChange(event: MatRadioChange) {
        this.sm = event.value;
        if (event.value === 'GUEST') {
            this.checked = false;
        }
    }
}
