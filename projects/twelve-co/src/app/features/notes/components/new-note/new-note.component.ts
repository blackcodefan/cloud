import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { ContentChange } from 'ngx-quill';
import { NoteService } from '../../services/note.service';
import { addNote } from '../../store';
import { NoteState } from '../../store/note.store';

@Component({
    selector: 'app-new-note',
    templateUrl: './new-note.component.html',
    styleUrls: [ './new-note.component.scss' ],
})
export class NewNoteComponent implements OnInit {
    previewData = [];
    filesToUpload = new Array<File>();
    title: string = '';
    content: string = '';
    invitees = [];

    constructor(private matSnack: MatSnackBar, private noteService: NoteService, private dialogRef: MatDialogRef<NewNoteComponent>, private store: Store<NoteState>) {
    }

    ngOnInit(): void {
    }

    contentChange(contentDelta: ContentChange) {
        this.content = contentDelta.text;
    }

    handleSaveNote() {

        this.noteService.saveNote({ content: this.content, title: this.title, attachments: [], members: [] }).subscribe(res => {
            this.store.dispatch(addNote({ note: res }));
            this.dialogRef.close();
        }, error => {
            console.error(error);
            this.matSnack.open('error saving note');
        });

    }

    handleCancel() {
        this.dialogRef.close();
    }

    handleFileUpload($event: Event) {

    }
}
