import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BusEventEnum, Contact, ContactItemInformation, ContactItemInformationCategory, ContactsService, DomService, EventBusService } from 'core-lib';
import { SubSink } from 'subsink';
import { ContactsState, selectSelectedContact, selectSelectedGroupId } from '../../store';
import { PlaceholderEditContactLayoutComponent } from '../layout';

@Component({
    selector: 'app-edit-contact',
    templateUrl: './edit-contact.component.html',
    styleUrls: [ './edit-contact.component.scss' ],
})
export class EditContactComponent implements OnInit, OnDestroy {
    contactFormGroup: UntypedFormGroup;
    current_focused: string;
    contactImageUrl: string;
    statusList = {
        'isDepartment': false,
        'isJobTitle': false,
        'isBirthday': false,
        'isNote': false,
        'isAddress': false,
    };
    selectedContact: Contact;
    private subSink = new SubSink();
    private selectedGroupId: number;

    constructor(private router: Router, private store$: Store<ContactsState>, private formBuilder: UntypedFormBuilder, private matSnack: MatSnackBar, private renderer: Renderer2,
                private domService: DomService, private eventBus: EventBusService, private contactService: ContactsService) {
        this.current_focused = 'none';
    }

    ngOnInit(): void {
        this.domService.appendComponentToSidebar(PlaceholderEditContactLayoutComponent);
        this.subSink.sink = this.eventBus.on(BusEventEnum.EDITING_CONTACT, (val) => this.handleEditContact(val));
        this.contactFormGroup = this.formBuilder.group({
            firstName: new UntypedFormControl(''),
            middleName: new UntypedFormControl(''),
            lastName: new UntypedFormControl(''),
            emails: new UntypedFormArray([]),
            phones: new UntypedFormArray([]),
        });
        this.store$.pipe(select(selectSelectedGroupId)).subscribe(selectedGroupId => {
            this.selectedGroupId = selectedGroupId;
        });
        this.store$.pipe(select(selectSelectedContact)).subscribe(currentContact => {
            console.error(currentContact);
            this.selectedContact = currentContact;
            console.log('current contact: ', currentContact);
            this.contactFormGroup.controls.firstName.patchValue(currentContact.firstName);
            this.contactFormGroup.controls.middleName.patchValue(currentContact.middleName);
            this.contactFormGroup.controls.lastName.patchValue(currentContact.lastName);
            currentContact.optionList.filter(o => o.category === ContactItemInformationCategory.EMAIL).forEach(c => {
                this.addEmail(c.value);
            });
            currentContact.optionList.filter(o => o.category === ContactItemInformationCategory.PHONE).forEach(c => {
                this.addPhoneNumber(c.value);
            });
        })
        ;
    }

    ngAfterViewInit() {
        this.renderer.listen('body', 'keydown', (event => {
            if (event.which == 9 && this.current_focused == 'none') {
                event.preventDefault();
                this.setCurrentFocus('firstName');
            }
        }));
    }

    setCurrentFocus(currentField: string) {
        this.current_focused = currentField;
        this.focusCurrentInputField();
    }

    setNextElementCurrentFocus(currentFocused: string) {
        const contactFormFieldList = document.getElementsByClassName('new-contact-form-field');
        for (let i = 0; i < contactFormFieldList.length; i++) {
            if (contactFormFieldList[i].id == currentFocused) {
                const nextElement = contactFormFieldList[i + 1];
                this.setCurrentFocus(nextElement.id);
                break;
            }
        }
    }


    // focus current input field
    focusCurrentInputField() {
        setTimeout((x: any) => {
            const currentInputFormField = document.getElementById(this.current_focused);
            if (currentInputFormField != null) {
                const currentField = document.getElementById(this.current_focused)!.getElementsByTagName('input')[0] as HTMLInputElement;
                if (currentField != null) {
                    currentField.focus();
                    currentField.select();
                }
            } else {
                this.current_focused = 'none';
            }
        }, 250);
    }

    addField(fieldType: any) {
        if (fieldType == 'isAddress')
            this.statusList.isAddress = true;
        else if (fieldType == 'isNote')
            this.statusList.isNote = true;
        else if (fieldType == 'isBirthday')
            this.statusList.isBirthday = true;
        else if (fieldType == 'isDepartment')
            this.statusList.isDepartment = true;
        else if (fieldType == 'isJobTitle')
            this.statusList.isJobTitle = true;
    }


    //get email
    getEmail(): Array<UntypedFormGroup> {
        console.log(this.selectedContact);
        try {
            return [ ...this.selectedContact.optionList.filter(x => x.category === ContactItemInformationCategory.EMAIL).map(c => new UntypedFormGroup({
                email: new UntypedFormControl({
                    value: c.value,
                    disabled: false,
                }),
            })) ];
        } catch (e) {
            return [];
        }

        // return this.formBuilder.group({
        //   email: ['', [Validators.required, Validators.email]]
        // })
    }

    //get phone
    getPhone(): Array<UntypedFormGroup> {
        try {
            return [ ...this.selectedContact.optionList.filter(x => x.category === ContactItemInformationCategory.EMAIL).map(c => new UntypedFormGroup({
                phone: new UntypedFormControl({
                    value: c.value,
                    disabled: false,
                }, [ Validators.required ]),
            })) ];
        } catch (e) {
            return [];
        }
    }

    //get address
    getAddress() {
        return this.formBuilder.group({
            address: [ '' ],
            street: [ '' ],
            line_2: [ '' ],
            city: [ '' ],
            postal_code: [ '' ],
            region: [ '' ],
            country: [ '' ],
        });
    }

    //add email()
    addEmail(value: string = '') {
        const control = <UntypedFormArray> this.contactFormGroup.controls['emails'];
        control.push(new UntypedFormGroup({ email: new UntypedFormControl({ value: '', disabled: false }, [ Validators.required, Validators.email ]) }));
    }

    //add phone number
    addPhoneNumber(value: string = '') {
        const control = <UntypedFormArray> this.contactFormGroup.controls['phones'];
        control.push(new UntypedFormGroup({ phone: new UntypedFormControl({ value, disabled: false }, [ Validators.required ]) }));
    }

    //add address
    addAddress() {
        const control = <UntypedFormArray> this.contactFormGroup.controls['addresses'];
        control.push(this.getAddress());
    }

    // return controls
    getFormGroups(controlName: string) {
        return (this.contactFormGroup.get(controlName) as UntypedFormArray);
    }

    private handleEditContact(val: boolean) {
        if (!val) {
            this.router.navigateByUrl('/contacts/list');
        } else {
            if (this.contactFormGroup.valid) {
                let contact: Contact = this.contactFormGroup.value;
                contact.optionList = this.buildListOptions(this.contactFormGroup);
                console.log(contact);
                let contactTransformed = Object.assign({}, contact, { visible: 1 });
                this.contactService.editContact(contactTransformed, this.selectedContact.id).subscribe(res => {
                    this.router.navigateByUrl('/contacts/list');
                }, error => {
                    console.error('Error saving contacts');
                    this.matSnack.open(`Error editing contacts ${ error?.error?.message }`);
                });

            } else {
                console.info(this.contactFormGroup.errors);
                this.matSnack.open('Entry is not valid', 'error');
            }
        }

    }

    get phones(): UntypedFormArray {
        return this.contactFormGroup.controls.phones as UntypedFormArray;
    }

    emailArrayValid(): boolean {
        const emailFa = this.contactFormGroup.controls.emails as UntypedFormArray;
        return emailFa.valid;
    }

    phoneArrayValid(): boolean {
        const phones = this.contactFormGroup.controls.phones as UntypedFormArray;
        return phones.valid;
    }

    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

    private buildListOptions(contact: UntypedFormGroup): ContactItemInformation[] {
        let emailFormArray = contact.controls.emails as UntypedFormArray;
        const emails = emailFormArray.value.map(d => {
            let c = d['email'];
            console.log(c);
            return {
                value: c,
                label: c,
                category: ContactItemInformationCategory.EMAIL,
            };
        });
        let phonesFormArray = contact.controls.phones as UntypedFormArray;
        const phones = phonesFormArray.value.map(d => {
            let c = d['phone'];
            return {
                value: c,
                label: c,
                category: ContactItemInformationCategory.EMAIL,
            };
        });
        return [ ...emails, ...phones ];
    }
}
