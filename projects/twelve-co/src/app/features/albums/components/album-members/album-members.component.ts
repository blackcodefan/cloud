import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { ResizedEvent } from 'angular-resize-event';
import { map, Observable, startWith } from 'rxjs';
import { EmailService } from '../../../email/services/email.service';
import { albumMemberItem } from '../../model';

@Component({
    selector: 'app-album-members',
    templateUrl: './album-members.component.html',
    styleUrls: [ './album-members.component.scss' ],
})
export class AlbumMembersComponent implements OnInit {
    albumMemberCtrl = new UntypedFormControl();
    filteredMembers!: Observable<string[]>;
    separatorKeysCodes: number[] = [ ENTER, COMMA, SPACE ];
    isAlbumMemberGroupIcon: boolean = false;
    isAlbumMemberGroupRightMenu: boolean = false;
    newAlbumMemberChipListCreated!: boolean;
    allAlbumMembers: string[] = [];
    members: string[] = [];
    fullNameMembers: albumMemberItem[] = [];
    initialMembers: string[] = [];
    initialMemberEmails: string[] = [];
    initialMemberNames: string[] = [];
    @ViewChild('searchAlbumMemberInput') searchAlbumMemberInput!: ElementRef<HTMLInputElement>;

    constructor(
        public matDialogRef: MatDialogRef<AlbumMembersComponent>,
        private _emailService: EmailService,
    ) {
        this.filteredMembers = this.albumMemberCtrl.valueChanges.pipe(
            startWith(null),
            map((receiver: string | null) => (receiver ? this._filterMembers(receiver) : this.allAlbumMembers.slice())),
        );
        // fixme update with proper service
        // this._emailService.searchReceivers().subscribe((res: any) => {
        //     if (res.body != undefined) {
        //         for (let i = 0; i < res.body.res.length; i++) {
        //             this.initialMembers.push(res.body.res[i].name + ' - ' + res.body.res[i].email);
        //             this.initialMemberEmails.push(res.body.res[i].email);
        //             this.initialMemberNames.push(res.body.res[i].name);
        //         }
        //     }
        // });
    }

    ngOnInit(): void {

    }

    focusInAlbumMemberToInput() {
        setTimeout(() => {
            this.isAlbumMemberGroupIcon = true;
        }, 300);
    }

    focusOutAlbumMemberToInput() {
        setTimeout(() => {
            if (!this.isAlbumMemberGroupRightMenu)
                this.isAlbumMemberGroupIcon = false;
        }, 300);
    }

    addAlbumMember($event: MatChipInputEvent) {
        const value = ($event.value || '').trim();

        // Add our fruit
        if (value) {
            this.members.push(value);
            this.fullNameMembers.push({ name: value, email: '' });
        }

        // Clear the input value
        $event.chipInput!.clear();

        this.albumMemberCtrl.setValue(null);
    }

    removeAlbumMember(user: any) {
        const index = this.members.indexOf(user);

        if (index >= 0) {
            this.members.splice(index, 1);
            this.fullNameMembers.splice(index, 1);
        }
    }

    validateEmail(email: string) {
        const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        const findIndex = this.initialMemberNames.findIndex(x => x == email);
        if (findIndex == -1) {
            return !!email.match(validRegex);
        } else {
            return true;
        }
    }

    selectedAlbumMember($event: MatAutocompleteSelectedEvent) {
        const index = this.initialMembers.findIndex(x => x == $event.option.viewValue);
        this.members.push(this.initialMemberNames[index]);
        this.fullNameMembers.push({ name: this.initialMemberNames[index], email: this.initialMemberEmails[index] });
        this.searchAlbumMemberInput.nativeElement.value = '';
        this.albumMemberCtrl.setValue(null);
    }

    albumMemberRightMenuOpened() {
        this.isAlbumMemberGroupRightMenu = true;
    }

    albumMemberRightMenuClosed() {
        this.isAlbumMemberGroupRightMenu = false;
    }

    ChipListResized(to: string, $event: ResizedEvent | any) {
        const chipListDiff = Math.round($event.newRect.height - 8);
        this.newAlbumMemberChipListCreated = (chipListDiff % 31) > 20;
    }

    sendAlbumInvite() {

    }

    private _filterMembers(value: string): any {
        const filterValue = value.toLowerCase();
        return this.initialMembers.filter(receiver => receiver.toLowerCase().includes(filterValue));
    }
}
