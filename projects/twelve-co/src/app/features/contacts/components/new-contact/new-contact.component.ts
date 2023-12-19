import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BusEventEnum, Contact, ContactItemInformation, ContactItemInformationCategory, ContactsService, EventBusService, Group } from 'core-lib';
import { SubSink } from 'subsink';
import { ContactsState, selectSelectedGroup, selectSelectedGroupId } from '../../store';

@Component({
    selector: 'app-new-contact',
    templateUrl: './new-contact.component.html',
    styleUrls: [ './new-contact.component.scss' ],
})
export class NewContactComponent implements OnInit, AfterViewInit {
    newContactFormGroup: UntypedFormGroup;
    current_focused: string;
    today: Date = new Date();

    statusList = {
        'isDepartment': false,
        'isJobTitle': false,
        'isBirthday': false,
        'isNote': false,
        'isAddress': false,
    };
    private subSink = new SubSink();
    //@ts-ignore
    private selectedGroupId: number = null;
    //@ts-ignore
    private selectedGroup: Group = null;

    constructor(private router: Router, private store$: Store<ContactsState>, private formBuilder: UntypedFormBuilder, private contactService: ContactsService, private renderer: Renderer2,
                private eventBus: EventBusService, private matSnack: MatSnackBar) {
        this.current_focused = 'none';
    }

    ngOnInit(): void {
        this.subSink.sink = this.store$.pipe(select(selectSelectedGroupId)).subscribe(selectedGroupId => this.selectedGroupId = selectedGroupId);
        this.subSink.sink = this.store$.pipe(select(selectSelectedGroup)).subscribe(selectedGroupId => this.selectedGroup = selectedGroupId);
        this.subSink.sink = this.eventBus.on(BusEventEnum.CREATE_CONTACT, (val) => this.handleCreateContact(val));
        this.newContactFormGroup = this.formBuilder.group({
            firstName: new UntypedFormControl(''),
            middleName: new UntypedFormControl(''),
            lastName: new UntypedFormControl(''),
            company: new UntypedFormControl(''),
            emails: this.formBuilder.array([
                this.getEmail(),
            ]),
            phones: this.formBuilder.array([
                this.getPhone(),
            ]),
        });
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
                const currentField = document.getElementById(this.current_focused)!.getElementsByClassName('new-contact-form-input')[0] as HTMLInputElement | HTMLTextAreaElement;
                if (currentField != null) {
                    currentField.focus();
                    currentField.select();
                }
            } else {
                this.current_focused = 'none';
            }
        }, 250);
    }

    //get email
    getEmail() {
        return this.formBuilder.group({
            email: [ '', [ Validators.required, Validators.email ] ],
        });
    }

    //get phone
    getPhone() {
        return this.formBuilder.group({
            phone: [ '' ],
        });
    }

    //add email()
    addEmail() {
        const control = <UntypedFormArray> this.newContactFormGroup.controls['emails'];
        control.push(this.getEmail());
    }

    //add phone number
    addPhoneNumber() {
        const control = <UntypedFormArray> this.newContactFormGroup.controls['phones'];
        control.push(this.getPhone());
    }

    getFormGroups(controlName: string) {
        return (this.newContactFormGroup.get(controlName) as UntypedFormArray);
    }

    /**
     *
     * @param val
     * @private
     */
    private handleCreateContact(val: boolean) {
        if (val) { // clicked ok
            if (this.newContactFormGroup.valid) {
                let contact: Contact = this.newContactFormGroup.value;
                contact.optionList = this.buildListOptions(this.newContactFormGroup);
                console.log(contact);
                let contactTransformed: Contact = Object.assign({}, contact, { visible: 1 });
                if (this.selectedGroupId == -1 || this.selectedGroupId == -2) {
                    this.subSink.sink = this.contactService.saveContact(contactTransformed).subscribe(res => {
                        this.router.navigateByUrl('/contacts/list');
                    }, error => {
                        console.error('Error saving contacts');
                        this.matSnack.open(`Error saving contacts ${ error?.error?.message }`);
                    });
                } else {
                    this.subSink.sink = this.contactService.createContactsInGroup(contactTransformed, this.selectedGroupId).subscribe(res => {
                        this.router.navigateByUrl('/contacts/list');
                    }, error => {
                        console.error('Error saving contacts');
                        this.matSnack.open(`Error saving contacts ${ error?.error?.message }`);
                    });

                }
            } else {
                console.info(this.newContactFormGroup.errors);
                this.matSnack.open('Entry is not valid', 'error');
            }

        } else { // clicked discard
            this.router.navigateByUrl('/contacts/list');
        }
    }

    /**
     *
     * @param contact
     * @private
     */
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
