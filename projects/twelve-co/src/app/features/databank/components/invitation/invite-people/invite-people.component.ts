import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { BusEvent, BusEventEnum, EventBusService, InvitationService, InviteMembersDto, RoleEnum } from 'core-lib';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, filter, switchMap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { v4 } from 'uuid';
import { Member } from '../../../models';
import { ActivityService } from '../../../services/activity.service';
import { DatabankState, selectSelectedBoxId } from '../../../store';

@Component({
    selector: 'app-invite-people',
    templateUrl: './invite-people.component.html',
    styleUrls: [ './invite-people.component.scss' ],
    providers: [
        { provide: MatFormFieldControl, useExisting: '' },
    ],
})
export class InvitePeopleComponent implements OnInit {
    _test: boolean;
    peopleList: boolean;
    comments: string;
    permissionOptions = { [RoleEnum.ADMIN]: 'Co Owner', [RoleEnum.GUEST]: 'Can View', [RoleEnum.MEMBER]: 'Can edit' };
    isPermission = false;
    isExpiration = false;
    expirationKey: string;
    emailInvalid: boolean;
    emailDuplicated: boolean;
    dateInvalid: boolean;
    _12CoEmailInvalid: boolean;
    memberInputFocused: boolean;
    _12coDirectorySpinner: boolean;
    selectable = true;
    removable = true;
    expanded = false;
    separatorKeysCodes: number[] = [ ENTER, COMMA ];
    memberCtrl = new UntypedFormControl();
    filteredMembers: Array<Member>;
    filtered12CoMembers: Observable<Member[]>;
    invitationList: Array<InviteMembersDto> = [];
    allMembers: Member[] = [];

    groupMembers: Member[] = [];
    group_allComplete: boolean = false;
    placeHolder: string = 'Insert a mame, email or alias';
    inviteMessagePlaceholder: string = 'Message (optional)';
    @ViewChild('memberInput') memberInput!: ElementRef<HTMLInputElement>;
    @ViewChild('12coMemberInput') _12coMemberInput!: ElementRef<HTMLInputElement>;
    @ViewChild('matExpansionPanel') _matExpansionPanel: any;
    public dateControl = new UntypedFormControl();
    public minDate!: Date;
    selectedRole: RoleEnum = RoleEnum.GUEST;
    readonly RoleEnum = RoleEnum;
    expirationDate: Date | null;
    private subSink = new SubSink();
    private selectedBoxId: string;

    constructor(private matDialogRef: MatDialogRef<InvitePeopleComponent>, private activityService: ActivityService, private invitationService: InvitationService,
                private matSnack: MatSnackBar, private store: Store<DatabankState>, private cdk: ChangeDetectorRef, private eventBus: EventBusService) {


    }

    ngOnInit(): void {
        this._12coDirectorySpinner = false;
        this.peopleList = false;
        this.memberInputFocused = false;
        this.comments = '';
        this.expirationKey = '';
        this.dateInvalid = false;
        this.setPermissions(RoleEnum.MEMBER);
        this.minDate = new Date();
        this.emailInvalid = false;
        this.emailDuplicated = false;
        this._12CoEmailInvalid = false;
        this.subSink.sink = this.store.pipe(select(selectSelectedBoxId)).subscribe(bid => this.selectedBoxId = bid);
        this.subSink.sink = this.memberCtrl.valueChanges.pipe(
            debounceTime(300),
            filter(searchText => !!searchText),
            switchMap(searchText => this.activityService.searchMember(searchText).pipe(catchError(e => of([])))),
            catchError(e => of([])),
        ).subscribe(searchResult => {
            this.filteredMembers = searchResult;
        }, error => {
            this.filteredMembers = [];
        });
    }


    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
            this.emailInvalid = false;
            if (this.invitationList.findIndex(x => x.emailAddress == value) != -1) {
                this.emailDuplicated = true;
            } else {
                this.emailDuplicated = false;
                if (value) {
                    this.invitationList.push({ id: v4(), emailAddress: value, name: value, boxId: this.selectedBoxId, role: RoleEnum.ADMIN });
                }
            }
            // Clear the input value
            event.chipInput!.clear();
            this.memberCtrl.setValue(null);
            if (this.invitationList.length > 0) {
                this.placeHolder = '';
            }
        } else {
            this.emailInvalid = true;
        }
    }

    memberInputFocusIn() {
        this.memberInputFocused = true;
        this.placeHolder = '';
    }

    memberInputFocusOut() {
        this.memberInputFocused = false;
        this.placeHolder = 'Enter a name or an email';
    }

    setInputValue(evt: any) {
        if (evt.target.value == '') {
            this.emailInvalid = false;
        }
    }

    remove(memberID: string | number): void {
        if (this.invitationList.length === 0) {
            return;
        }
        // find existing accounts
        const index = this.invitationList.findIndex(x => x.id == memberID);
        if (index >= 0) {
            this.invitationList.splice(index, 1);
        }
        // find existing accounts
        const index2 = this.invitationList.findIndex(x => x.emailAddress === memberID);
        if (index2 >= 0) {
            this.invitationList.splice(index2, 1);
        }
        if (index >= 0) {
            this.invitationList.splice(index, 1);
        }
        this.cdk.detectChanges();

        // cleanup
        if (this.invitationList.length == 0) {
            this.placeHolder = 'Enter a name or an email';
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        const selectedMember = this.filteredMembers.find(x => x.id = event.option.value);
        const invitation: InviteMembersDto = {
            id: v4(),
            accountId: selectedMember!.id,
            role: this.selectedRole,
            boxId: this.selectedBoxId,
            name: `${ selectedMember!.firstName || '' } ${ selectedMember!.lastName || '' }`,
        };
        this.invitationList.push(invitation!);
        this.memberInput.nativeElement.value = '';
        this.memberCtrl.setValue(null);
        if (this.invitationList.length > 0) {
            this.placeHolder = '';
        }
    }


    inviteMessageFocusIn() {
        this.inviteMessagePlaceholder = '';
    }

    inviteMessageFocusOut() {
        this.inviteMessagePlaceholder = 'Message (optional)';
    }

    test(evt: boolean) {
        setTimeout(() => {
            this._test = evt;
        });
    }

    setPermissions(permission: RoleEnum) {
        this.selectedRole = permission;
    }

    showPeopleInvited() {
        this.peopleList = true;
    }

    cancelPeopleInvited() {
        this.peopleList = false;
    }


    closeModal() {
        this.matDialogRef.close();
    }

    setComments(evt: any) {
        this.comments = evt.target.value;
    }

    sendInvitation() {
        if (this.dateControl.value) {
            const date = new Date(Date.parse(this.dateControl.value));
            console.log(date);
            this.expirationDate = date;
        }
        this.invitationList.forEach(l => {
            l.role = this.selectedRole;
            // @ts-ignore
            l.expirationDate = this.expirationDate || null;
        });
        this.subSink.sink = this.invitationService.invite(this.invitationList).subscribe(res => {
            this.matSnack.open(`Member invited`);
            this.eventBus.emit(new BusEvent(BusEventEnum.REFRESH_MEMBERS, {}));
            this.matDialogRef.close();
        }, error => {
            this.matSnack.open(`Error creating invitation ${ error?.error?.message || '' }`);
        });
    }

    disableIsExpiration() {
        this.isExpiration = false;
    }

    updateAllComplete() {
        console.info('method not implemented');
        // this.group_allComplete = this.groupMembers != null && this.groupMembers.every(t => t.completed);
    }

    someComplete(): boolean {
        if (this.groupMembers == null) {
            return false;
        }
        console.info('method not implemented');
        return true;
        // return this.groupMembers.filter(t => t.completed).length > 0 && !this.group_allComplete;
    }

    setAll(completed: boolean) {
        this.group_allComplete = completed;
        if (this.groupMembers == null) {
            return;
        }
        console.info('method not implemented');
        // this.groupMembers.forEach(t => t.completed = completed);
    }

    expandPanel(event: any) {
        event.stopPropagation();
        if (!(event.target.classList.value == 'mat-checkbox-inner-container mat-checkbox-inner-container-no-side-margin')) {
            this.expanded = !this.expanded;
            if (!this.expanded) {
                this._matExpansionPanel.open(); // Here's the magic
            } else {
                this._matExpansionPanel.close();
            }
        } else {
            if (this.expanded) {
                this._matExpansionPanel.open(); // Here's the magic
            } else {
                this._matExpansionPanel.close();
            }
        }
    }
}
