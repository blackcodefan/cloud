import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { AccountSummary, Activity, ItemDetails, Membership, RoleEnum } from 'core-lib';
import { FileSaverService } from 'ngx-filesaver';
import { switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { BlockchainCheckerService } from '../../../../../../../../core-lib/src/lib/services';
import { ActivityService, DatabankService, MembersService } from '../../../services';
import { DatabankState, selectAllBoxes, selectSelectedAccount, selectSelectedBox, setNewBoxName, setSelectedBoxById, updateBoxDescription } from '../../../store';

@Component({
    selector: 'app-databank-preview-box',
    templateUrl: './databank-preview-box.component.html',
    styleUrls: [ './databank-preview-box.component.scss' ],
})
export class DatabankPreviewBoxComponent implements OnInit {
    isBoxMemberPreview: boolean = false;
    isBoxActivityPreview: boolean = false;
    separatorKeysCodes: number[] = [ ENTER, COMMA, SPACE ];
    memberCtrl = new UntypedFormControl();
    members: string[] = [];
    initialMembers: string[] = [];
    RoleEnum = RoleEnum;
    @ViewChild('searchMemberInput') searchMemberInput!: ElementRef<HTMLInputElement>;
    @ViewChild('titleEditForm') boxTitleInput!: ElementRef<HTMLInputElement>;
    @ViewChild('descriptionFc') descriptionInput!: ElementRef<HTMLInputElement>;
    isAddMember: boolean = false;
    isEditTitle: boolean = false;
    isEditDescription: boolean = false;
    selectedBox: ItemDetails;
    activities: Array<any>;
    titleInputFormControl: UntypedFormControl;
    boxDescriptionFc: UntypedFormControl;
    private subSink = new SubSink();
    private account: AccountSummary;
    private boxes: Array<ItemDetails>;
    _members: Membership[];

    constructor(private store: Store<DatabankState>, private datbankService: DatabankService, private activityService: ActivityService, private filesaverService: FileSaverService,
                private blockchainService: BlockchainCheckerService, private matSnack: MatSnackBar, private memberService: MembersService) {
    }

    ngOnInit(): void {

        this.subSink.sink = this.store.pipe(
            select(selectSelectedBox),
            tap(box => this.selectedBox = box),
            switchMap(box => this.activityService.getActivityForBox(box.itemId)),
        ).subscribe((activity: Array<Activity>) => {
            console.debug(activity);
            this.activities = activity.map(c => Object.assign({}, c, { timestamp: new Date(c.timestamp) }));
            console.debug(this.activities);
            this.subSink.sink = this.memberService.getMembersForStorageId(this.selectedBox.itemId).subscribe((res) => {
                this._members = res;
            });
        });


        this.subSink.sink = this.store.pipe(select(selectSelectedAccount)).subscribe((selectedAccount) => this.account = selectedAccount);
        this.subSink.sink = this.store.pipe(select(selectAllBoxes)).subscribe((selectedAccount) => this.boxes = selectedAccount);
        // this.service.searchReceivers().subscribe((result: any) => {
        //     if (result.body != undefined) {
        //         for (let i = 0; i < result.body.res.length; i++) {
        //             this.initialMembers.push(result.body.res[i].name + ' - ' + result.body.res[i].email);
        //         }
        //     }
        // });
        // this.filteredMembers = this.memberCtrl.valueChanges.pipe(
        //     startWith(null),
        //     map((receiver: string | null) => (receiver ? this.filterMembers(receiver) : this.allMembers.slice())),
        // );
    }

    setBoxMemberPreviewStatus() {
        if (!this.isBoxMemberPreview)
            this.isBoxActivityPreview = false;
        setTimeout(() => {
            this.isBoxMemberPreview = !this.isBoxMemberPreview;
        }, 50);
    }

    enableBoxMemberPreviewStatus() {
        if (!this.isBoxMemberPreview)
            this.isBoxActivityPreview = false;
        setTimeout(() => {
            this.isBoxMemberPreview = true;
        }, 50);
    }

    setBoxActivityPreviewStatus() {
        if (!this.isBoxActivityPreview)
            this.isBoxMemberPreview = false;
        setTimeout(() => {
            this.isBoxActivityPreview = !this.isBoxActivityPreview;
        }, 50);
    }

    addMember(value: any) {
        console.log('bbb');
        // const value = (event.value || '').trim();
        //
        // // Add our fruit
        // if (value) {
        //   this.members.push(value);
        // }
        this.members.push(value);
        // Clear the input value
        // event.chipInput!.clear();

        this.memberCtrl.setValue(null);
        this.isAddMember = false;
        this.enableBoxMemberPreviewStatus();
    }

    selectMember($event: MatAutocompleteSelectedEvent) {
        this.members.push($event.option.value);
        this.searchMemberInput.nativeElement.value = '';
        this.memberCtrl.setValue(null);
        this.isAddMember = false;
        this.enableBoxMemberPreviewStatus();
    }

    private filterMembers(value: string): any {
        const filterValue = value.toLowerCase();
        return this.initialMembers.filter(member => member.toLowerCase().includes(filterValue));
    }

    setIsAddMember(b: boolean) {
        this.isAddMember = b;
        if (this.isAddMember) {
            setTimeout(() => {
                const memberInput = document.getElementsByClassName('searchMemberInput')[0] as HTMLInputElement;
                memberInput?.select();
                memberInput?.focus();
            }, 10);
        }
    }

    removeMembers(member: Membership) {
        // this.members = this.members.filter(x => x != member);
    }

    focusOut() {
        setTimeout(() => {
            this.setIsAddMember(false);
        }, 100);
    }

    cancelTitleEdit() {
        this.isEditTitle = false;
    }

    saveNewTitle() {
        if (this.titleInputFormControl.valid) {
            if (this.checkNameValid()) {
                this.datbankService.rename(this.account.id, this.selectedBox.itemId, this.titleInputFormControl.value).subscribe((res: ItemDetails) => {
                    this.store.dispatch(setNewBoxName({ boxId: res.itemId, boxName: res.name }));
                    this.store.dispatch(setSelectedBoxById({ selectedBox: res.itemId }));
                    this.isEditTitle = false;
                }, error => {
                    this.matSnack.open(`Could not rename box ${ error?.error?.message }`);
                });

            } else {
                this.matSnack.open(`There already exists a box with the name ${ this.titleInputFormControl.value }`);
            }
        } else {
            if (this.titleInputFormControl.errors!['minLength']) {
                this.matSnack.open('Box name should be at least 1 charlong');
            }
            if (this.titleInputFormControl.errors!['required']) {
                this.matSnack.open('Box name must not be empty');
            }
        }


    }

    enableTitleEdit() {
        setTimeout(() => {
            this.boxTitleInput?.nativeElement?.focus();
        }, 150);
        this.titleInputFormControl = new UntypedFormControl({ value: this.selectedBox.name, disabled: false }, [ Validators.required, Validators.minLength(1) ]);
        this.isEditTitle = true;
    }

    /**
     * Check name already exists
     * @private
     */
    private checkNameValid(): boolean {
        let box = this.boxes.find(b => b.name === this.titleInputFormControl.value);
        return box === undefined || box === null;
    }

    saveDescription() {
        const description = this.boxDescriptionFc.value;
        if (description?.length > 0) {
            const boxId = this.selectedBox.itemId;
            this.datbankService.addDescription(this.account.id, boxId, description).subscribe(box => {
                this.store.dispatch(updateBoxDescription({ description, boxId }));
                this.store.dispatch(setSelectedBoxById({ selectedBox: box.itemId }));
                this.isEditDescription = false;
            }, (error) => {

                this.matSnack.open(`Error saving box description ${ error?.error?.message }`);
            });
        }
        ;
    }

    handlePrintBlockChain() {
        this.subSink.sink = this.blockchainService.downloadSignedFile(this.selectedBox.itemId).subscribe(res => {
            this.filesaverService.save(res, `activity-${this.selectedBox.name}.zip`, 'zip');
        }, error => this.matSnack.open('Error downloading actiivty'));
    }

    handleDescriptionEdit() {
        this.isEditDescription = true;
        this.boxDescriptionFc = new UntypedFormControl({ value: this.selectedBox.description || '', disabled: false });
        setTimeout(() => {
            this.descriptionInput?.nativeElement?.focus();
        }, 150);
    }

    discardSaveDescription() {
        this.isEditDescription = false;
    }
}
