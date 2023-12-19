import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BusEventEnum, DomService, EventBusService } from 'core-lib';
import { SubSink } from 'subsink';
import { NewNoteComponent } from './components/new-note/new-note.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { Note } from './model/note.model';
import { NoteService } from './services/note.service';

@Component({
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    styleUrls: [ './notes.component.scss' ],
})
export class NotesComponent implements OnInit {
    notes: Array<Note> = [];
    private subSink = new SubSink();

    constructor(private noteService: NoteService, private matSnack: MatSnackBar, private matDialog: MatDialog, private domService: DomService, private eventBusService: EventBusService) {
    }

    ngOnInit(): void {
        this.domService.appendComponentToSidebar(MainLayoutComponent);
        this.subSink.sink = this.noteService.fetchNotesForCurrentAccount().subscribe(
            res => {
                console.debug(res);
                this.notes = res;
            },
            err => {
                this.matSnack.open('error fetching notes for user');
            });
        this.subSink.sink = this.eventBusService.on(BusEventEnum.NEW_NOTE, () => this.handleCreateNewNote());
    }

    private handleCreateNewNote() {
        this.matDialog.open(NewNoteComponent, { width: '640px', height: '640px', data: {}, hasBackdrop: false, panelClass: 'mat-dialog-container' });
    }
}
