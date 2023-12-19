import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import {
    AccountSummary,
    AudioCallIdResponseDto,
    CallDataDto,
    CallDirectionEnum,
    CallHistoryCreateDTO,
    CallHistoryModalComponent,
    CallHistoryService,
    CallsService,
    CallTypeEnum,
    ConferenceUserService,
    Contact,
    ContactsService,
    CountdownService,
    DialOutDialogComponent,
    DomService,
    InvitationService,
    LoaderService,
    LoggingService,
    RegisterHistoryDTO,
    selectCallsSummary,
    selectSelectedAccount,
    setCallsSummary,
    UserNotificationService,
    WebsocketService,
} from 'core-lib';
import { interval, Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { State } from '../../../../store';

@Component({
    selector: 'app-calls',
    templateUrl: './calls.component.html',
    styleUrls: [ './calls.component.scss' ],
})
export class CallsComponent implements OnInit {
    contextMenuPosition = { x: '0px', y: '0px' };
    subsink = new SubSink();
    searching = false;
    searchText: string;
    searchFormControl = new UntypedFormControl({ value: '', disabled: false });
    sortAscending = true;
    searchResult: Array<Contact> = [];
    missedCalls: number = 0;
    receivedCalls: number = 0;
    madeCalls: number = 0;
    recordings: number = 0;
    selectedTabIndex: number = 0;
    accountsInTwelveco: Observable<Array<AccountSummary>>;
    private selectedAccount: AccountSummary;


    constructor(private store: Store<State>, private userNotificationService: UserNotificationService, private router: Router,
                private materialDialogService: MatDialog, private callHistoryService: CallHistoryService, private domService: DomService,
                private confUsrService: ConferenceUserService, private route: ActivatedRoute, private location: Location,
                private logger: LoggingService, private countDownService: CountdownService, private contactsService: ContactsService,
                private callService: CallsService, private invitationService: InvitationService, private loader: LoaderService,
                private websocketService: WebsocketService) {
    }


    ngOnInit(): void {
        this.domService.setIsLoading(true);
        this.subsink.sink = this.searchFormControl.valueChanges.pipe(debounceTime(500)).subscribe(res => this.searchText = res);
        this.subsink.sink = this.store.pipe(select(selectSelectedAccount)).subscribe(account => this.selectedAccount = account);
        this.subsink.sink = this.callService.getCallsSummaryForAccount(this.selectedAccount.id).subscribe(callData => {
            this.store.dispatch(setCallsSummary({ callsSummary: callData }));
        });
        this.accountsInTwelveco = this.getAccountsInTwelveco();
        this.contactsService.findMembersInMyContacts().subscribe(res => {
            console.debug(res);
            this.searchResult = res;
        });


        this.subsink.sink = this.store.pipe(select(selectCallsSummary)).subscribe((callsSummary: CallDataDto) => {
            this.receivedCalls = callsSummary.received;
            this.recordings = callsSummary.recordings;
            this.madeCalls = callsSummary.sent;
            this.missedCalls = callsSummary.missed;
        });

        this.subsink.sink = interval(30000).pipe(switchMap(_ => this.callService.getCallsSummaryForAccount(this.selectedAccount.id)))
            .subscribe(callData => {
                this.store.dispatch(setCallsSummary({ callsSummary: callData }));
            }, error => {
                this.logger.error('Error fetching calls summary');
                this.userNotificationService.showError('Error fetching calls statistics');
            });

    }

    ngOnDestroy(): void {
        this.subsink.unsubscribe();
        this.domService.clearComponentSidebar();
    }

    findMembersInMyContacts() {
        this.subsink.sink = this.contactsService.findMembersInMyContacts().subscribe((list: Array<Contact>) => {
            this.searchResult = list;
        }, error => {
            this.logger.error('could not load contacts');
        });
    }

    onContextMenu(event: MouseEvent) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
    }

    navigateToDetails() {

    }

    showMessage() {
        alert('clicked');
    }

    getDetails(id: number) {
        this.router.navigate([ `preview/${ id }` ], { relativeTo: this.route });
    }


    /**
     *
     * @param accountName
     * @param username
     * @param accountId
     * @param accountInitials
     */

    navigate(url: string) {
        this.router.navigate([ `${ url }` ], { relativeTo: this.route });
    }

    goBack() {
        this.location.back();
    }

    createConference() {

    }

    public onTabSelect(e: any) {
        console.log(e);
    }

    onCallClicked(callingAccount: AccountSummary) {
        console.log('call $event: ', callingAccount);
        this.callService.makeCall(this.selectedAccount.id, callingAccount.id as number, CallTypeEnum.AUDIO_CALL).subscribe((res: AudioCallIdResponseDto) => {
            let callId = res.callId;
            if (callId === null || callId === undefined) { // the server could not create a conference for the current user
                this.userNotificationService.showError('Could not retrieve callid');
            } else { // the conference was created succesfully all good
                this.logger.info(callingAccount);
                this.subsink.sink = this.callHistoryService.initialiseHistory(this.buildHistory(callingAccount, callId)).subscribe(_ => {
                    this.logger.info('initialized history');
                }, (error) => this.logger.error(`error loggin history ${ error }`));

                const windowRef = this.materialDialogService.open(DialOutDialogComponent, {
                    data: { contact: callingAccount, callId },
                    hasBackdrop: false,
                });
            }
        }, (error) => {
            this.userNotificationService.showError('Error creating call: ', error?.error?.message);
            this.logger.error('Error creating call: ', error);
        });
    }

    onContactCallClicked(callingAccount: Contact) {
        console.log('call $event: ', callingAccount);
        this.callService.makeCall(this.selectedAccount.id, callingAccount.contactAccountId as number, CallTypeEnum.AUDIO_CALL).subscribe((res: AudioCallIdResponseDto) => {
            let callId = res.callId;
            if (callId === null || callId === undefined) { // the server could not create a conference for the current user
                this.userNotificationService.showError('Could not retrieve callid');
            } else { // the conference was created succesfully all good
                this.logger.info(callingAccount);
                this.subsink.sink = this.callHistoryService.initialiseHistory(this.buildHistoryWithContact(callingAccount, callId)).subscribe(_ => {
                    this.logger.info('initialized history');
                }, (error) => this.logger.error(`error loggin history ${ error }`));

                const windowRef = this.materialDialogService.open(DialOutDialogComponent, {
                    data: { contact: callingAccount, callId },
                    hasBackdrop: false,
                });
            }
        }, (error) => {
            this.userNotificationService.showError('Error creating call: ', error?.error?.message);
            this.logger.error('Error creating call: ', error);
        });
    }

    onVideoCallClicked(callingAccount: AccountSummary) {
        console.log('call $event: ', callingAccount);
        this.callService.makeCall(this.selectedAccount.id, callingAccount.id as number, CallTypeEnum.VIDEO_CALL).subscribe((res: AudioCallIdResponseDto) => {
            let callId = res.callId;
            if (callId === null || callId === undefined) { // the server could not create a conference for the current user
                this.userNotificationService.showError('Could not retrieve callid');
            } else { // the conference was created succesfully all good
                this.logger.info(callingAccount);
                this.subsink.sink = this.callHistoryService.initialiseHistory(this.buildHistory(callingAccount, callId)).subscribe(_ => {
                    this.logger.info('initialized history');
                }, (error) => this.logger.error(`error loggin history ${ error }`));

                const windowRef = this.materialDialogService.open(DialOutDialogComponent, {
                    data: { contact: callingAccount, callId },
                    hasBackdrop: false,
                });
            }
        }, (error) => {
            this.userNotificationService.showError('Error creating call: ', error?.error?.message);
            this.logger.error('Error creating call: ', error);
        });
    }

    /**
     * Invite contact to join
     * @param contact
     */
    invite(contact: Contact) {
        this.loader.showLoader();
        this.invitationService.inviteContact(this.selectedAccount.id, contact.id).subscribe(res => {
            this.loader.hideLoader();
            this.userNotificationService.showSuccess('Invitation sent');
        }, error => {
            this.loader.hideLoader();
            this.userNotificationService.showError('Error sending invite: ', error?.error?.message);
        });
    }

    toggleSearch() {
        this.searching = !this.searching;
    }

    toggleSort() {
        this.sortAscending = !this.sortAscending;
    }

    deleteSearchContent() {
        this.searchText = '';
        // this.searching = false;
    }

    handleCallHistory() {
        this.materialDialogService.open(CallHistoryModalComponent, {
            width: '1200px',
            height: '640px',
            data: { accountId: this.selectedAccount.id },
        });
    }

    buildHistory(contact: AccountSummary, callId: string): CallHistoryCreateDTO {
        const chc = new CallHistoryCreateDTO();
        chc.callId = callId;
        chc.ownerId = this.selectedAccount.id;
        chc.participants = [ this.buildHistoryElemnet(callId, this.selectedAccount.id, CallDirectionEnum.CALLED), this.buildHistoryElemnet(callId, contact.id, CallDirectionEnum.MISSED) ];
        return chc;
    }

    buildHistoryWithContact(contact: Contact, callId: string): CallHistoryCreateDTO {
        const chc = new CallHistoryCreateDTO();
        chc.callId = callId;
        chc.ownerId = this.selectedAccount.id;
        chc.participants = [ this.buildHistoryElemnet(callId, this.selectedAccount.id, CallDirectionEnum.CALLED), this.buildHistoryElemnet(callId, contact.contactAccountId, CallDirectionEnum.MISSED) ];
        return chc;
    }

    buildHistoryElemnet(callId: string, accountId: number | null, callDirection: CallDirectionEnum): RegisterHistoryDTO {
        const rhd = new RegisterHistoryDTO();
        rhd.callId = callId;
        rhd.accountId = accountId;
        rhd.callDirectionEnum = callDirection;
        return rhd;
    }

    getAccountsInTwelveco(): Observable<Array<AccountSummary>> {
        return this.callService.getAccounts();
    }

    handleIndexChange($event: number) {
        this.selectedTabIndex = $event;

    }
}
