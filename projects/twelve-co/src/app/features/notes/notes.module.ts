import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { CoreLibModule } from 'core-lib';
import { SessionStorageService } from '../../services';
import { storageMetaReducer } from '../../storage-metareducer';
import { NewNoteComponent } from './components/new-note/new-note.component';
import { NotePreviewComponent } from './components/note-preview/note-preview.component';
import { NoteComponent } from './components/note/note.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SingleNoteLfetComponent } from './layout/single-note-lfet/single-note-lfet.component';
import { NotesComponent } from './notes.component';
import { NOTE_CONFIG_TOKEN, NOTE_LOCAL_STORAGE_KEY, NOTE_STORAGE_KEYS, noteReducers } from './store';

export const routes: Routes = [ { path: '', pathMatch: 'full', component: NotesComponent } ];

export function getnoteConfig(localStorageKey: string, storageService: SessionStorageService) {
    return { metaReducers: [ storageMetaReducer(localStorageKey, storageService) ] };
}

@NgModule({
    declarations: [
        NoteComponent,
        NotesComponent,
        NewNoteComponent,
        MainLayoutComponent,
        SingleNoteLfetComponent,
        NotePreviewComponent,
    ],
    imports: [
        CommonModule,
        CoreLibModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        StoreModule.forFeature('noteStateKey', noteReducers, NOTE_CONFIG_TOKEN),

    ],
    providers: [
        {
            provide: NOTE_LOCAL_STORAGE_KEY,
            useValue: 'noteStorage',
        },
        {
            provide: NOTE_STORAGE_KEYS,
            useValue: [ 'noteStorageKey' ],
        },
        {
            provide: NOTE_CONFIG_TOKEN,
            deps: [
                NOTE_LOCAL_STORAGE_KEY,
                SessionStorageService,
            ],
            useFactory: getnoteConfig,
        },
    ],
})
export class NotesModule {
}
