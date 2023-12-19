import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Tag } from 'core-lib';
import { SubSink } from 'subsink';
import { TagService } from '../../services/tag.service';
import { DatabankState } from '../../store';

@Component({
    selector: 'app-new-tag',
    templateUrl: './new-tag.component.html',
    styleUrls: [ './new-tag.component.scss' ],
})
export class NewTagComponent implements OnInit, OnDestroy {
    newTagName!: string;
    actionType!: string;
    tagList: Array<Tag>;
    private subSink = new SubSink();
    @ViewChild('input') matInput!: ElementRef<HTMLInputElement>;
    inputFormControl = new UntypedFormControl({ value: null, disabled: false }, [ Validators.required, Validators.minLength(1), Validators.maxLength(20) ]);

    constructor(private dialogRef: MatDialogRef<NewTagComponent>, private matDialog: MatDialog, private snackbar: MatSnackBar, @Inject(MAT_DIALOG_DATA) data: any,
                private tagService: TagService, private store$: Store<DatabankState>) {
        console.info('data=>>>', data);
        this.tagList = data?.tagList || [];
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    ngOnInit(): void {
        this.inputFormControl.setValue(this.newTagName);

    }

    closeModal() {
        this.dialogRef.close();
    }

    setNewTagName(event: any) {
        this.newTagName = event.target.value;
        if (event.keyCode === 13) {
            this.saveNewTag();
        }
    }

    removeNewTagName() {
        this.inputFormControl.setValue('');
    }

    saveNewTag() {
        if (this.inputFormControl.valid) {
            this.newTagName = this.inputFormControl.value;
            if (this.newTagName.trim() == '') {
                this.snackbar.open('The title of tag cannot be empty.', 'close');
            } else {
                if (this.confirmDuplicateTagName()) {
                    this.snackbar.open('The tag name "' + this.newTagName + '" is already taken.', 'close');
                } else {
                    if (this.actionType == 'create') {
                        //@ts-ignore
                        this.subSink.sink = this.tagService.saveTagForAccount({ id: null, internal: false, name: this.newTagName, tagCode: null }).subscribe((newTagItem) => {
+                            this.dialogRef.close(newTagItem);
                        }, err => {
                            this.snackbar.open(err?.error?.message, 'error');
                        });

                    } else {
                        this.dialogRef.close({ save: true, tagName: this.newTagName });
                    }
                }
            }
        } else {
            this.snackbar.open('The title of tag cannot be empty.', 'close');
        }
    }

    manageTags() {
        this.dialogRef.close();
    }

    // Findout the  name is duplicated or not

    confirmDuplicateTagName(): boolean {
        return this.tagList!.findIndex((x: any) => x.name == this.newTagName) !== -1;
    }

}
