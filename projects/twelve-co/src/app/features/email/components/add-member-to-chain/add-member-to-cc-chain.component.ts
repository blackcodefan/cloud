import { setEmailsList } from './../../store/email.actions';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ResizedEvent } from 'angular-resize-event';
import { AccountSummary } from 'core-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, switchMap } from 'rxjs';
import { SubSink } from 'subsink';
import { EmailViewItem, Label, Receiver, ReceiverSubmitItem, UpdateEmailChain } from '../../model';
import { EmailService } from '../../services/email.service';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-add-member-to-chain',
    templateUrl: './add-member-to-cc-chain.component.html',
    styleUrls: [ './add-member-to-cc-chain.component.scss' ],
})
export class AddMemberToCcChainComponent implements OnInit, OnDestroy {
     @ViewChild('searchReceiverInput') searchReceiverInput!: ElementRef<HTMLInputElement>;

    separatorKeysCodes: number[] = [ ENTER, COMMA, SPACE ];
    receiverCtrl = new UntypedFormControl();
    isToGroupIcon: boolean = false;
    isToGroupRightMenu: boolean = false;
    newToChipListCreated!: boolean;
    formData: FormData;
    account: AccountSummary;
    emailId: string;
    chainId: string;
    label: Label;
    filteredReceivers: Array<Receiver>;
    receivers: Array<Receiver> = [];
    fullNameReceivers: ReceiverSubmitItem[] = [];

    private subSink = new SubSink();

    constructor(
        private emailService: EmailService,
        private router: Router,
        private store: Store<any>,
        private spinner: NgxSpinnerService,
        public matDialogRef: MatDialogRef<AddMemberToCcChainComponent>,
        private matSnack: MatSnackBar,
        private translateService: TranslateService
    ) {
        this.formData = new FormData();
        this.subSink.sink = this.receiverCtrl.valueChanges
            .pipe(
                debounceTime(300),
                switchMap(txt => this.emailService.searchAccount(txt)),
            ).subscribe((res) => this.filteredReceivers = res.map(obj => ({
                accountId: obj.id,
                name: obj.fullName,
                accountName: obj.accountName,
                email: null,
                receiverId: null
            })));
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe()
    }

    focusInMemberToInput() {
        setTimeout(() => {
            this.isToGroupIcon = true;
        }, 300);
    }

    focusOutMemberToInput() {
        setTimeout(() => {
            if (!this.isToGroupRightMenu)
                this.isToGroupIcon = false;
        }, 300);
    }



    ChipListResized(flag: string, $event: ResizedEvent) {
        const chipListDiff = Math.round($event.newRect.height - 8);
        if ((chipListDiff % 31) > 20) {
            this.newToChipListCreated = true;
        } else {
            this.newToChipListCreated = false;
        }
    }

    // validate user email
    validateEmail(receiver: Receiver): boolean {
        const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (receiver.email ) {
            if (receiver.email.match(validRegex)) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    memberToRightMenuOpened() {
        this.isToGroupRightMenu = true;
    }

    memberToRightMenuClosed() {
        this.isToGroupRightMenu = false;
    }


    // handle receiver part
    addReceiver(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // create receiver with only email
        const receiver = {
            accountId: null,
            name: null,
            accountName: null,
            email: value,
            receiverId: null
        }
        // Add our fruit
        if (value) {
            this.receivers.push(receiver);
            this.fullNameReceivers.push({ name: value, email: '' });
        }

        // Clear the input value
        event.chipInput!.clear();

        this.receiverCtrl.setValue(null);
    }

    removeReceiver(fruit: Receiver): void {
        const index = this.receivers.indexOf(fruit);

        if (index >= 0) {
            this.receivers.splice(index, 1);
            this.fullNameReceivers.splice(index, 1);
        }
    }

    selectedReceiver(event: MatAutocompleteSelectedEvent): void {
        this.receivers.push(event.option.value);
        this.searchReceiverInput.nativeElement.value = '';
        this.receiverCtrl.setValue(null);
    }

    displayName(receiver: Receiver) {
        return receiver.accountId ? receiver.accountName : receiver.email;
    }

    addEmailChainMembers() {
        this.spinner.show();
                const updateEmailChain: UpdateEmailChain = {
                    chainId: this.chainId,
                    receivers: this.receivers,
                };
                this.emailService.addEmailChainMembers(updateEmailChain).subscribe(response => {
                    this.spinner.hide();
                        const emailList: Array<EmailViewItem> = [];
                        this.subSink.sink = this.emailService.getChainEmailsForAccount(this.emailId, this.label.id).subscribe( result => {
                            if (result != undefined && result.content != undefined && result.content.length > 0) {
                                const emailRes = result.content;
                                for (let i = 0; i < emailRes.length; i++) {
                                    const emailItem: EmailViewItem = {
                                        id: emailRes[i].id!,
                                        subject: emailRes[i].subject,
                                        content: this.account.allowDecrypt ? JSON.parse(emailRes[i].body)[0].content : emailRes[i].body,
                                        attachmentList: emailRes[i].attachmentList,
                                        isNew: false,
                                        senderId: emailRes[i].createdBy?.id!,
                                        sender: emailRes[i].createdBy?.name!,
                                        senderUserName: emailRes[i].createdBy?.fullName!,
                                        size: 0,
                                        flag: '',
                                        date: emailRes[i].created,
                                        invite: false,
                                        inviteStatus: '',
                                        chainCounter: emailRes.length,
                                        chainParentID: emailRes[i].chainId!,
                                        receivers: emailRes[i].receivers,
                                        ccReceivers: emailRes[i].receiversCc,
                                        bccReceivers: emailRes[i].receiversBcc,
                                        inCopyCounter: emailRes[i].receiversCc.length,
                                        showDetail: true,
                                        showReceiversDetail: false,
                                        checked: false,
                                        star: false,
                                        isRead: emailRes[i].readOn !== undefined ? true : false,
                                        readOn: emailRes[i].readOn
                                    };
                                    emailList.push(emailItem);
                                }
                                this.store.dispatch(setEmailsList({emailsList: emailList}));
                            }
                        }, error => {
                            console.error('Erorr while retrieve chain emails', error);
                            this.matSnack.open('Error load chain', error?.error?.message);
                        });

                    this.matDialogRef.close();

                }, error => {
                    console.error('Error while adding new members', error);
                    this.matSnack.open(this.translateService.instant('EMAIL.error_add_members'), error?.error?.message);
                    this.spinner.hide();
                });
    }
}
