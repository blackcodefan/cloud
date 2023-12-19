import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { select, Store } from '@ngrx/store';
import { DatabankState, getAppInfo, removeTag, renameTag } from '../../../store';
import { NewTagComponent } from '../../new-tag/new-tag.component';

@Component({
  selector: 'app-manage-tag-list',
  templateUrl: './manage-tag-list.component.html',
  styleUrls: [ './manage-tag-list.component.scss' ],
})
export class ManageTagListComponent implements OnInit {
  contextPosition = { x: '', y: '' };
  tagList: any;
  selectedTagID: string;
  currentDialog!: HTMLElement;
  @ViewChild('tagActionMenuTrigger', { read: MatMenuTrigger, static: false }) tagActionMenuTrigger!: MatMenuTrigger;

  constructor(
    private renderer: Renderer2,
    public _matDialogRef: MatDialogRef<ManageTagListComponent>,
    private matDialog: MatDialog,
    private store$: Store<DatabankState>,
  ) {
    this.selectedTagID = '';
    this.renderer.listen('window', 'click', (event: any) => {
      this.selectedTagID = '';
      this.tagActionMenuTrigger.closeMenu();
    });
  }

  ngOnInit(): void {
    this.currentDialog = document.getElementById(this._matDialogRef.id) as HTMLElement;
    this.store$.pipe(select(getAppInfo)).subscribe((x: any) => {
      this.tagList = x.tagList;
    });
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
    const newTagDialog = this.matDialog.open(NewTagComponent, { panelClass: 'new-tag-popup', hasBackdrop: false });
    newTagDialog.componentInstance.actionType = 'create';
    newTagDialog.componentInstance.newTagName = '';
    newTagDialog.afterClosed().subscribe(x => {
      this.currentDialog.style.visibility = 'initial';
    });
  }

  renameTag() {
    this.currentDialog.style.visibility = 'hidden';
    const selectedTagID = this.selectedTagID;
    const selectedTag = this.tagList.find((x: any) => x.id == this.selectedTagID);
    const newTagDialog = this.matDialog.open(NewTagComponent, { panelClass: 'new-tag-popup' });
    newTagDialog.componentInstance.actionType = 'rename';
    newTagDialog.componentInstance.newTagName = selectedTag.value;
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

}
