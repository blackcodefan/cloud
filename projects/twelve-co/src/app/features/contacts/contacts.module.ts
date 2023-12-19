import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { CoreLibModule } from 'core-lib';
import { environment } from '../../../environments/environment';
import {
    ContactListComponent,
    ContactsRightComponentComponent,
    Invite12coContactsComponent,
    NewContactComponent,
    PlaceholderContactsLayoutComponent,
    PlaceholderEditContactLayoutComponent,
    PlaceholderNewContactLayoutComponent,
    Search12coContactsComponent,
    SidebarContactsLayoutComponent,
} from './components';
import { EditContactComponent } from './components/edit-contact/edit-contact.component';
import { NewGroupComponent } from './components/new-group/new-group.component';
import { SearchContactsComponent } from './components/popup/search-contacts/search-contacts.component';
import { ContactsComponent } from './contacts.component';
import { ContactEmailPipe, SortContactByPipe, SortGroupsByPipe } from './pipes';
import { ContactNumberHtmlPipe } from './pipes/contact-number-html.pipe';
import { ContactSearchPipe } from './pipes/contact-search.pipe';
import { FilterPropertyPipe } from './pipes/filter-property.pipe';
import { contactsStorekey } from './static-data';
import { contactsAppReducer } from './store';
import { ContactFilterInternalPipe } from './pipes/contact-filter-internal.pipe';
import { CountFormArrayPipe } from './pipes/count-form-array.pipe';

const routes: Routes = [
    {
        path: '',
        component: ContactsComponent,
        children: [
            {
                path: '',
                redirectTo: 'list',
            }, {
                path: 'list',
                component: ContactListComponent,
            }, {
                path: 'new-contact',
                component: NewContactComponent,
            }, {
                path: 'edit-contact',
                component: EditContactComponent,
            },
        ],
    },
];


@NgModule({
    declarations: [
        ContactListComponent,
        SearchContactsComponent,
        ContactsComponent,
        NewContactComponent,
        Search12coContactsComponent,
        EditContactComponent,
        Invite12coContactsComponent,
        PlaceholderContactsLayoutComponent,
        SidebarContactsLayoutComponent,
        PlaceholderNewContactLayoutComponent,
        ContactEmailPipe,
        FilterPropertyPipe,
        SortGroupsByPipe,
        SortContactByPipe,
        PlaceholderEditContactLayoutComponent,
        ContactsRightComponentComponent,
        NewGroupComponent,
        ContactSearchPipe,
        ContactNumberHtmlPipe,
        ContactFilterInternalPipe,
        CountFormArrayPipe,
    ],
    imports: [
        CommonModule,
        TranslateModule.forChild(),
        CoreLibModule.forChild(environment),
        RouterModule.forChild(routes),
        StoreModule.forFeature(contactsStorekey, contactsAppReducer),
    ],
})
export class ContactsModule {
}
