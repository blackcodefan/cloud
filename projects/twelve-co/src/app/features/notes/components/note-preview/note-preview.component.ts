import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { SubSink } from 'subsink';
import { Note } from '../../model/note.model';
import { NoteService } from '../../services/note.service';

@Component({
    selector: 'app-note-preview',
    templateUrl: './note-preview.component.html',
    styleUrls: [ './note-preview.component.scss' ],
})
export class NotePreviewComponent implements OnInit {
    note: Note;
    private subSink = new SubSink();

    constructor(private noteService: NoteService, private matDialogRef: MatDialogRef<NotePreviewComponent>, @Inject(MAT_DIALOG_DATA) data: any, private store: Store<any>) {
        this.note = data.note;
    }

    ngOnInit(): void {
        this.subSink.sink = this.noteService.getMediaFromNotes(this.note.id).subscribe(res => this.note.mediaContent = res);
    }

}
