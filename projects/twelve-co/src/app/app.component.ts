import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import {
    AccountsService,
    AccountSummary,
    AllowDecryptMessage,
    AudioCallAnswer,
    AudioCallComponent,
    BusEvent,
    BusEventEnum,
    CallingWsMessageDto,
    CryptoService,
    EventBusService,
    IncomingCallsComponent,
    ItemDetails,
    LoggingService,
    logoutAction,
    NotificationContent,
    NotificationService,
    parseWsMessage,
    selectDecryptionState,
    setCallId,
    setDecryptionStateAction,
    UploadWrapper,
    User,
    WebsocketService,
    WsMessage,
    WsMessageType,
} from 'core-lib';
import { filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { NotificationComponent, UserSwitchAccountDialogComponent } from './components';
import {
    selectCurrentApplication,
    selectCurrentFolder,
    selectInvitationsCount,
    selectLoggedInState,
    selectOwnerImage,
    selectSelectedAccount,
    selectSidebarOpenedStatus,
    selectUploadState,
    setInvitation,
    setInvitations,
    setOwnerImage,
    setSelectedAccount,
    State,
} from './store';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.scss' ],
})
export class AppComponent implements OnInit {
    // @ts-ignore
    subscriber: User = null;
    allowDecrypt: boolean = false;
    accountPhoto: string;
    loggedIn: boolean = false;
    sidebarOpened: boolean;
    isOverlaySidebar: boolean = false;
    currentApp: string;
    sidebarStatus: boolean = true;
    selectedAccount: AccountSummary;
    invitationCount: number = 0;
    showUploadWidget: boolean = false;
    currentFolder: ItemDetails;
    route: ActivatedRoute;
    username: string;
    private subSink = new SubSink();
    private dialogRef: MatDialogRef<any>;
    uploadQueueEmpty: boolean;

    constructor(private translateService: TranslateService, private matIconRegistry: MatIconRegistry, public router: Router, private store: Store<State>,
                private dialog: MatDialog, private logger: LoggingService, private accountsService: AccountsService, private domSanitizer: DomSanitizer,
                private cryptoService: CryptoService, private snack: MatSnackBar, private cdr: ChangeDetectorRef, private websocketService: WebsocketService,
                private eventBusService: EventBusService, private notificationService: NotificationService, private eventBus: EventBusService,
                private activatedRoute: ActivatedRoute) {
        this.translateService.setDefaultLang('en');
        const languages = [ 'ro', 'en', 'es', 'cn' ];
        this.translateService.addLangs(languages);
        languages.forEach(l => this.translateService.reloadLang(l));
        this.translateService.use('en');
        this.configureIcons();
    }

    configureIcons() {
        this.matIconRegistry.addSvgIcon('devices', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/icons/line_6x6_87_Mesa de trabajo 1.svg'));
    }

    ngOnInit(): void {
        this.route = this.activatedRoute;
        this.subSink.sink = this.store.pipe(select(selectOwnerImage)).subscribe((image) => this.accountPhoto = image);
        this.subSink.sink = this.store.pipe(select(selectInvitationsCount)).subscribe((invitationCount) => this.invitationCount = invitationCount);
        this.subSink.sink = this.store.pipe(select(selectCurrentFolder)).subscribe((currentFolder) => this.currentFolder = currentFolder);
        this.subSink.sink = this.store.pipe(select(selectSidebarOpenedStatus)).subscribe(value => {
            this.sidebarStatus = value;
            this.cdr.detectChanges();
        });

        this.subSink.sink = this.store.pipe(select(selectUploadState)).subscribe((res: UploadWrapper) => {
            console.debug(res);
            this.uploadQueueEmpty = Object.keys(res).length === 0;
        });

        this.subSink.sink = this.store.pipe(select(selectLoggedInState)).subscribe(value => this.loggedIn = value);

        this.subSink.sink = this.store.pipe(select(selectSelectedAccount), filter(ac => !!ac && !!ac.id)).subscribe(selectedAccount => {
            this.selectedAccount = selectedAccount;
            this.allowDecrypt = this.selectedAccount !== undefined ? this.selectedAccount.allowDecrypt : false;
            this.subSink.sink = this.accountsService.getPhotoForAccount(this.selectedAccount.id).subscribe((accountPhotoDto) => {
                //@ts-ignore
                this.store.dispatch(setOwnerImage({ ownerImage: accountPhotoDto.image }));
            });
            this.subSink.sink = this.notificationService.findNotificationsForAccount()
                .pipe(filter(c => !!c))
                .subscribe(res => {
                    this.store.dispatch(setInvitations({ invitations: res.length > 0 ? res.map(c => c.metadata) : [] }));
                });
        });

        this.subSink.sink = this.store.pipe(select(selectCurrentApplication)).subscribe((res: string) => this.currentApp = res);
        this.subSink.sink = this.store.pipe(
            select(selectDecryptionState),
            filter(acc => !!acc))
            .subscribe(value => {
                if (this.selectedAccount?.id === value.accountId) {
                    this.allowDecrypt = value.allowDecrypt;
                    const account = Object.assign({}, this.selectedAccount, { allowDecrypt: this.allowDecrypt });
                    this.store.dispatch(setSelectedAccount({ selectedAccount: account }));
                }
            });
        this.eventBus.on(BusEventEnum.UPLOAD_COMPONENT, (status) => {
            if (status) {
                this.dialog.open(NotificationComponent, { panelClass: 'notification-popup', position: { top: '16px', left: '16px' } });
            }
        });
        this.subSink.sink = this.store.pipe(select(selectUploadState)).subscribe(res => {
            this.showUploadWidget = Object.keys(res).length > 0;

        });


        this.subSink.sink = this.websocketService.wsMessageEventEmitter.subscribe((wsMessage: WsMessage) => {
            console.log('-------- ws event received: ', wsMessage);
            if (wsMessage.wsMessageType === WsMessageType.INVITATION_SHARE_BOX) {
                let notificationData: NotificationContent = parseWsMessage<NotificationContent>(wsMessage);
                this.store.dispatch(setInvitation({ invitation: notificationData }));
            }
            if (wsMessage.wsMessageType === WsMessageType.AUDIO_CALLING) {
                let callingMessage: CallingWsMessageDto = parseWsMessage<CallingWsMessageDto>(wsMessage);
                const windowRef = this.openWindow(callingMessage.callId, callingMessage.accountName, callingMessage.callerName, callingMessage.accountId, callingMessage.callerName);
            }

            if (wsMessage.wsMessageType === WsMessageType.CANCEL_RINGING) {
                let callingMessage: CallingWsMessageDto = parseWsMessage<CallingWsMessageDto>(wsMessage);
                this.eventBusService.emit(new BusEvent(BusEventEnum.CANCEL_RINGING, callingMessage));
            }

            if (wsMessage.wsMessageType === WsMessageType.ANSWER_CALL) {
                let wsMsgContent: AudioCallAnswer = parseWsMessage<AudioCallAnswer>(wsMessage);
                this.store.dispatch(setCallId({ callId: wsMsgContent.callId }));
                this.dialog.open(AudioCallComponent, { data: { callId: wsMsgContent.callId }, hasBackdrop: false, height: '640px', width: '840px' });
                this.dialogRef.close();
            }
            if (wsMessage.wsMessageType === WsMessageType.DECRYPT) {
                let decryptState = parseWsMessage<AllowDecryptMessage>(wsMessage);
                this.store.dispatch(setDecryptionStateAction({ decryptState }));
            }
        });
    }

    showNotificationContent() {
        this.dialog.open(NotificationComponent, { panelClass: 'notification-popup', position: { top: '16px', left: '16px' } });
    }

    openSideBarPopup() {
        this.isOverlaySidebar = true;

    }

    showSidebar() {
        this.sidebarOpened = true;
    }

    hideSideBarPopup() {
        this.isOverlaySidebar = false;
    }

    showSwitchAccount() {
        this.dialog.open(UserSwitchAccountDialogComponent, {
            height: '480px',
            width: '640px',
        });
    }

    signOut() {
        this.logger.info('logging out');
        this.store.dispatch(logoutAction());
        this.router.navigate([ '/' ]);
    }

    updateDecryptPermission() {
        if (this.allowDecrypt) {
            this.subSink.sink = this.cryptoService.revokeDecryptPermission({ accountId: this.selectedAccount.id, allowDecrypt: false }).subscribe(result => {
                this.allowDecrypt = false;
                const account = Object.assign({}, this.selectedAccount, { allowDecrypt: this.allowDecrypt });
                this.store.dispatch(setSelectedAccount({ selectedAccount: account }));
            });
        } else {
            this.subSink.sink = this.cryptoService.requestDecryptPermission({ accountId: this.selectedAccount.id, allowDecrypt: true }).subscribe(result => {
                // create a request permission to decrypt; have to be approved by an device connected with this account
                this.snack.open('Please give decrypt  permission on the device ', 'close');
            });
        }
    }

    openWindow(callId: string, accountName: string, username: string, accountId: number, accountInitials: string): any {
        // todo move to dedicated item
        const windowRef = this.dialog.open(IncomingCallsComponent, {
            data: {
                username,
                accountId,
                callId,
                accountName,
                accountInitials,
            },
            width: '300px',
            height: '250px',
        });
        return windowRef;
    }

}
