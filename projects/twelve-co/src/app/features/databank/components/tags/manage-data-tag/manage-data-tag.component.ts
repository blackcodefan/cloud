import { Component, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { ItemDetails, Tag } from 'core-lib';
import { SubSink } from 'subsink';
import { TagService } from '../../../services/tag.service';
import { DatabankState, removeTag, removeTagDisableStatus, renameTag, selectSelectedStorage, setTagsForStorage, updateTagDisableStatus } from '../../../store';
import { ManageTagListComponent } from '../manage-tag-list/manage-tag-list.component';
import { NewTagComponent } from '../../new-tag/new-tag.component';

@Component({
    selector: 'app-manage-data-tag',
    templateUrl: './manage-data-tag.component.html',
    styleUrls: [ './manage-data-tag.component.scss' ],
})
export class ManageDataTagComponent implements OnInit {
    contextPosition = { x: '', y: '' };
    tagList: Array<Tag>;
    selectedTagID!: string;
    @Input() storageId!: string;
    @Input() selectedDataIDs!: Array<string>;
    currentDialog!: HTMLElement;
    selectedTagList: Array<Tag> = [];
    @ViewChild('tagActionMenuTrigger', { read: MatMenuTrigger, static: false }) tagActionMenuTrigger!: MatMenuTrigger;
    private selectedStorage: ItemDetails;
    private subSink = new SubSink();

    constructor(
        private renderer: Renderer2,
        public _matDialogRef: MatDialogRef<ManageTagListComponent>,
        private matSnack: MatSnackBar,
        private tagService: TagService,
        private matDialog: MatDialog,
        private store$: Store<DatabankState>,
    ) {
        this.renderer.listen('window', 'click', (event: any) => {
            this.selectedTagID = '';
            if (this.tagActionMenuTrigger.menuOpen)
                this.tagActionMenuTrigger.closeMenu();
        });
    }

    ngOnInit(): void {
        this.currentDialog = document.getElementById(this._matDialogRef.id) as HTMLElement;
        this.subSink.sink = this.tagService.getTagsForAccount().subscribe((tagList: Array<Tag>) => this.tagList = tagList);
        this.subSink.sink = this.store$.pipe(select(selectSelectedStorage)).subscribe(selectedStorage => this.selectedStorage = selectedStorage);
        let tagIndex = 0;
        /*if (this._selectedTagList.findIndex(x => x.u_value == 'default_1') != -1) {
            tagIndex = 0;
            this.store$.dispatch(updateTagDisableStatus({ tagIndex }));
        } else if (this._selectedTagList.findIndex(x => x.u_value == 'default_2') != -1) {
            tagIndex = 1;
            this.store$.dispatch(updateTagDisableStatus({ tagIndex }));
        } else if (this._selectedTagList.findIndex(x => x.u_value == 'default_3') != -1) {
            tagIndex = 2;
            this.store$.dispatch(updateTagDisableStatus({ tagIndex }));
        }
        */

        /*
        this.store$.pipe(select(getAppInfo)).subscribe((x: any) => {
            this.tagList = x.tagList;
        });*/
    }

    setTagAction(evt: MouseEvent, tagID: string) {
        evt.preventDefault();
        this.selectedTagID = tagID;
        if (this.tagActionMenuTrigger.menuOpen) {
            this.tagActionMenuTrigger.closeMenu();
        }
        this.contextPosition.x = evt.clientX + 'px';
        this.contextPosition.y = evt.clientY + 'px';
        setTimeout((x: any) => {
            this.tagActionMenuTrigger.openMenu();
            this.tagActionMenuTrigger.menu.focusFirstItem('mouse');
        }, 300);
    }

    newTag() {
        this.currentDialog.style.visibility = 'hidden';
        const newTagDialog = this.matDialog.open(NewTagComponent, { panelClass: 'new-tag-popup', hasBackdrop: false, data: { tagList: this.tagList } });
        newTagDialog.componentInstance.actionType = 'create';
        newTagDialog.afterClosed().subscribe((res: Tag) => {
            this.currentDialog.style.visibility = 'initial';
            this.tagList = [ ...this.tagList, res ];
        });
    }

    renameTag() {
        this.currentDialog.style.visibility = 'hidden';
        const selectedTagID = this.selectedTagID;
        const selectedTag = this.tagList.find((x: any) => x.id == this.selectedTagID);
        const newTagDialog = this.matDialog.open(NewTagComponent, { panelClass: 'new-tag-popup', hasBackdrop: false });
        newTagDialog.componentInstance.actionType = 'rename';
        // newTagDialog.componentInstance.newTagName = selectedTag.name;
        newTagDialog.afterClosed().subscribe((x: any) => {
            if (x != undefined && x.save) {
                const tagName = x.tagName;
                this.store$.dispatch(renameTag({ selectedTagID, tagName }));
                this.currentDialog.style.visibility = 'initial';
            }
        });
    }

    removeTag() {
        const selectedTagID = this.selectedTagID;
        this.store$.dispatch(removeTag({ selectedTagID }));
    }

    selectTag(evt: MatCheckboxChange, tagID: string, tagIndex: number) {
        if (evt.checked) {
            this.store$.dispatch(updateTagDisableStatus({ tagIndex }));
            const selectedTagItem = this.tagList.find((x: any) => x.id == tagID);
            this.selectedTagList.push(selectedTagItem!);
        } else {
            this.store$.dispatch(removeTagDisableStatus({ tagIndex }));
            const selectedTagItemIndex = this.selectedTagList.findIndex((x: any) => x.id == tagID);
            this.selectedTagList.splice(selectedTagItemIndex, 1);
        }
    }

    saveTags() {
        this.tagService.saveTagsForAccountAndStorage(this.storageId, this.tagList).subscribe(res => {
            this.store$.dispatch(setTagsForStorage({ storageId: this.storageId, tags: res }));
            this.matSnack.open('Saved tags');
            this._matDialogRef.close();
        }, error => {
            this.matSnack.open('Error saving tags for storage');
        });
    }

    confirmSelectedTag(tagID: string): boolean {
        const currentSelectedTagIndex = this.selectedTagList.findIndex(x => x.id == tagID);
        return currentSelectedTagIndex != -1;
    }

    disabled(tag: Tag): boolean {
        if (!tag.internal) {
            return false;
        }
        return this.selectedTagList.filter(l => l.internal && l.id !== tag.id).length > 0;
    }
}
