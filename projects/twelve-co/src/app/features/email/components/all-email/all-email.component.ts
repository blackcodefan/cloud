import { EmailHelper } from './../../services/email.helper';
import { SubSink } from 'subsink';
import { removeLabel, setLabelList, setSelectedLabel } from './../../store/email.actions';
import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { DomService } from 'core-lib';
import { Router } from '@angular/router';
import { AllEmailHeaderComponent } from './all-email-header/all-email-header.component';
import { pipe } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { EmailService } from '../../services/email.service';
import { EmailCounts, Label } from '../../model';
import { getEmailCounts, getLabels } from '../../store';
import { MatSnackBar } from '@angular/material/snack-bar';
import ElementQueries from 'css-element-queries/src/ElementQueries';
import { ConfirmToDeleteLabelComponent, NewLabelComponent } from '..';

@Component({
    selector: 'app-all-email',
    templateUrl: './all-email.component.html',
    styleUrls: ['./all-email.component.scss'],
})
export class AllEmailComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('labelRightMenuHandler', { read: MatMenuTrigger, static: true })
    labelRightMenuHandler!: MatMenuTrigger;
    //   itemList = ['inbox', 'sent', 'drafts', 'scheduled', 'bin'];
    public labelList!: Array<Label>;
    contextMenuPosition: any = { x: '', y: '' };
    selectedLabel: Label;
    emailCounts: EmailCounts;

    private subSink = new SubSink();

    constructor(
        private domService: DomService,
        private emailService: EmailService,
        private emailHelper: EmailHelper,
        private matDialogService: MatDialog,
        private router: Router,
        private store: Store<any>,
        private renderer: Renderer2,
        private matSnack: MatSnackBar
    ) {
        this.renderer.listen('window', 'click', (event: any) => {
            if (
                this.labelRightMenuHandler != undefined &&
                this.labelRightMenuHandler.menuOpen
            ) {
                this.labelRightMenuHandler.closeMenu();
            }
        });
    }

    ngOnInit(): void {
        // this.domService.setIsLoading(true);
        this.subSink.sink = this.emailService.getLabelsForAccount().subscribe(
            (labels) => {
                this.store.dispatch(setLabelList({ labelList: labels }));
                this.subSink.sink = this.store
                    .select(pipe(getLabels))
                    .subscribe((x: any) => {
                        this.labelList = x;
                        console.log('labels', this.labelList);
                        this.emailHelper.loadEmailsCountForAccount();
                        // check emailnumbers
                        this.subSink.sink = this.store
                            .select(pipe(getEmailCounts))
                            .subscribe((eCounts: EmailCounts) => {
                                this.emailCounts = eCounts;
                            });
                    });
            },
            (error) => {
                console.error('Error while load labels', error);
                this.matSnack.open('Error while load labels', error?.error?.message);
            }
        );
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
        this.domService.setIsLoading(false);
    }

    ngAfterViewInit() {
        this.domService.appendComponentToHeader(
            AllEmailHeaderComponent,
            'email-header'
        );
        this.domService.clearEmailRightSide();
        ElementQueries.listen();
        ElementQueries.init();
        setTimeout(() => {
            this.domService.setIsLoading(true);
        }, 1000)
    }

    getTotalEmailForLabel(labelId: string): number {
        let total = 0;
        for (
            let index = 0;
            index < this.emailCounts.labelsCount.length;
            index++
        ) {
            const element = this.emailCounts.labelsCount[index];
            if (element.labelId === labelId) {
                total = element.emailNo;
            }
        }

        return total;
    }

    getTotalUnreadEmailForLabel(labelId: string): number {
        let total = 0;
        for (
            let index = 0;
            index < this.emailCounts.labelsCount.length;
            index++
        ) {
            const element = this.emailCounts.labelsCount[index];
            if (element.labelId === labelId) {
                total = element.emailNoUnread;
            }
        }

        return total;
    }

    goEmailList(index: string) {
        this.router.navigateByUrl('/features/email/' + index);
    }

    showLabelMenu(event: MouseEvent, item: Label) {
        event.preventDefault();
        if(item.isFixed) {
            return; // don't show menu
        }
        this.selectedLabel = item;
        if (this.labelRightMenuHandler.menuOpen) {
            this.labelRightMenuHandler.closeMenu();
        }
        this.contextMenuPosition.x = `${event.x}px`;
        this.contextMenuPosition.y = `${event.y}px`;
        setTimeout(() => {
            this.labelRightMenuHandler.openMenu();
            this.labelRightMenuHandler.menu.focusFirstItem('mouse');
        }, 300);
    }

    onClickLabel(item: Label) {
        this.selectedLabel = item;
        this.store.dispatch(setSelectedLabel({selectedLabel: item}));
        this.router.navigate(['/apps/emails/emails-list/' + this.emailService.getLabelCode(this.selectedLabel)]);
    }


    renameLabel() {
        const labelPopup = this.matDialogService.open(NewLabelComponent, {
            panelClass: 'new-label',
        });
        labelPopup.componentInstance.label = this.selectedLabel;
    }

    deleteLabel() {
        const confirmPopup = this.matDialogService.open(ConfirmToDeleteLabelComponent, {panelClass:'confirm-to-delete-label'});
        confirmPopup.componentInstance.label = this.selectedLabel;
        // confirmPopup.afterClosed().subscribe((res: any) => {
        //   if(res!=undefined && res.action){
        //     this.emailService.removeEmailLabel(this.selectedLabel.id).subscribe((res: any) => {
        //       this.store.dispatch(removeLabel({id: this.selectedLabel.id}));
        //     }, error => {
        //         this.matSnack.open('Error on delete label', error?.error?.message);
        //     });
        //   }
        // })
    }
}
