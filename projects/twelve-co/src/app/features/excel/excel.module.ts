import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { CoreLibModule } from 'core-lib';
import { NewDocumentComponent } from './components/new-document/new-document.component';
import { excelStateKey } from './constants';
import { HomeComponent } from './home.component';
import { ExcelLeftComponent } from './layout/left/excel-left/excel-left.component';
import { excelAppReducers } from './store';


export const routes: Routes = [ {
    path: '', pathMatch: 'full', component: HomeComponent, children: [
        { path: '', component: NewDocumentComponent },
    ],
} ];

@NgModule({
    declarations: [
        HomeComponent,
        ExcelLeftComponent,
        NewDocumentComponent,
    ],
    imports: [
        CommonModule,
        CoreLibModule,
        TranslateModule.forChild(),
        RouterModule.forChild(routes),
        StoreModule.forFeature(excelStateKey, excelAppReducers),
    ],
})
export class ExcelModule {
}
