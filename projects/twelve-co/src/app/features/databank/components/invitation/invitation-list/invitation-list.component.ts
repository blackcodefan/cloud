import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { BusEventEnum, DomService, EventBusService, NotificationService, UserInvitation, WebsocketService, WsMessage, WsMessageType } from 'core-lib';
import { SubSink } from 'subsink';
import { setInvitations } from '../../../../../store';
import { DatabankState } from '../../../store';

@Component({
    selector: 'app-invitation-list',
    templateUrl: './invitation-list.component.html',
    styleUrls: [ './invitation-list.component.scss' ],
})
export class InvitationListComponent implements OnInit, OnDestroy {
    invitationList: Array<UserInvitation>;
    contextBoxInfoPosition = { x: '', y: '' };
    selectedInvitationData: UserInvitation;
    invitationDetail: UserInvitation;
    @ViewChild('BoxInfoMenuTrigger', { read: MatMenuTrigger, static: false }) BoxInfoMenuTrigger!: MatMenuTrigger;
    private subSink = new SubSink();

    constructor(private domService: DomService, private notificationService: NotificationService, private store: Store<DatabankState>, private eventBus: EventBusService,
                private matSnack: MatSnackBar, private websocketService: WebsocketService) {
    }

    ngOnInit(): void {
        this.domService.clearComponentSidebar();
        this.refreshInvitationList();
        this.subSink.sink = this.eventBus.on(BusEventEnum.HANDLE_INVITATION_ACTION, (clickValue) => this.handleClick(clickValue));
        this.subSink.sink = this.websocketService.wsMessageEventEmitter.subscribe((res: WsMessage) => {
            if (res.wsMessageType === WsMessageType.INVITATION_ACCEPTED) {
                console.log('Received invitation accepted answer');
            }
        });
    }

    setInvitationItem(userInvitation: UserInvitation) {
        this.selectedInvitationData = userInvitation;
    }

    clearInvitationItem(evt: any) {
        console.log(evt!.target.classList);
        if (!evt!.target.classList.contains('databank-invitation-common-item') && !evt!.target.classList.contains('sidebar-center-item') && !evt!.target.classList.contains('box-image-invite')) {
            console.log('clearing selected invitation');
            //@ts-ignore
            this.selectedInvitationData = null;
            if (this.BoxInfoMenuTrigger.menuOpen)
                this.BoxInfoMenuTrigger.closeMenu();
            this.domService.clearComponentSidebar();
        }
    }

    // when hover box image


    hoverBoxImage(evt: any, invitation: UserInvitation) {
        const selectedElement = evt.target;
        const bindingElement = selectedElement.getBoundingClientRect();
        this.contextBoxInfoPosition.x = bindingElement.left + 'px';
        this.contextBoxInfoPosition.y = bindingElement.top + 130 + 'px';
        this.invitationDetail = invitation;
        setTimeout((x: any) => {
            this.BoxInfoMenuTrigger.openMenu();
            this.BoxInfoMenuTrigger.menu.focusFirstItem('mouse');
        }, 150);
    }

    leaveBoxImage(evt: any) {
        this.BoxInfoMenuTrigger.closeMenu();
        setTimeout((x: any) => {
            // @ts-ignore
            this.invitationDetail = null;
        }, 150);


    }

    ngOnDestroy(): void {
    }

    /**
     * Handle click value on invitation
     * @param clickValue
     * @private
     */
    private handleClick(clickValue) {
        console.log(`handling invitation `, this.selectedInvitationData);
        this.subSink.sink = this.notificationService.answerInvitation(this.selectedInvitationData.id, clickValue).subscribe(res => {
            this.matSnack.open(`Answered invitation from ${ this.selectedInvitationData.inviterAccountName }`);
            this.refreshInvitationList();
        }, error => {
            this.refreshInvitationList();
            this.matSnack.open(`Error processing invitation answer ${ error?.error?.message || '' }`);
        });
    }

    private refreshInvitationList() {
        this.subSink.sink = this.notificationService.findNotificationsForAccount().subscribe((res: Array<UserInvitation>) => {
            this.invitationList = res;
            this.store.dispatch(setInvitations({ invitations: res.length > 0 ? res.map(c => c.metadata) : [] }));
            if (res.length === 0) {
                this.domService.clearComponentSidebar();
            }
        });

    }
}
