import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreLibModule } from 'core-lib';
import { DocumentOverviewComponent } from './components/document-overview/document-overview.component';
import { DocumentPreviewComponent } from './components/document-preview/document-preview.component';
import { NewDocumentComponent } from './components/new-document/new-document.component';
import { HomeComponent } from './home.component';
import { WordsLeftSidebarComponent } from './layout';


export const routes: Routes = [
    {
        path: '', pathMatch: 'full', component: HomeComponent,
        children: [
            { path: '', pathMatch: 'full', component: DocumentOverviewComponent },
            { path: 'new-document', component: NewDocumentComponent },
            { path: 'document/:id', component: DocumentPreviewComponent },
        ],
    },
];

@NgModule({
    declarations: [
        HomeComponent,
        DocumentPreviewComponent,
        DocumentOverviewComponent,
        WordsLeftSidebarComponent,
        NewDocumentComponent,
    ],
    imports: [
        CommonModule,
        CoreLibModule,
        TranslateModule.forChild(),
        RouterModule.forChild(routes),
    ],
})
export class WordsModule {
}
