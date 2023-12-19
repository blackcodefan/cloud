import { Contact, ContactItemInformation, ContactItemInformationCategory, PhotoDto } from 'core-lib';
import { CsvRecord } from '../interfaces';

const properties = [ 'first name', 'last name', 'Middle Name', 'Birthday', 'Notes', 'Company', 'Job Title', 'Initials', 'Photo' ];
const synonyms = { 'first name': [ 'Given name' ], 'last name': [ 'Surname' ], 'Photo': [ 'Picture' ] };
const prefixes = [ 'Business', 'Home', 'Other' ];

export class CsvRecordGeneric implements CsvRecord {
    constructor(private record: any) {
    }

    public getContact(): Contact {
        const emails = this.getEmails();
        const phones = this.getPhones();
        const urls = this.getUrls();
        const firstName = this.getFirstName();
        const lastName = this.getLastName();
        let contact = {
            id: 0,
            firstName,
            middleName: this.getMiddleName(),
            lastName,
            optionList: [ ...emails, ...phones, ...urls ],
            visible: 1,
            initials: this.buildInitials(firstName, lastName),
            accountId: null,
            contactAccountId: null,
            subscriberId: null,
        };
        return contact;
    }

    private buildInitials(fname, lname) {
        const firstName = fname.trim();
        const lastName = lname.trim();

        let initials = this.getInitials();
        if (initials.length > 0) {
            return initials.substr(0, Math.min(initials.length, 2));
        }
        let res = '';
        if (firstName.length > 0) {
            if (lastName.length > 0) {
                return firstName[0] + lastName[0];
            }
            if (firstName.length >= 2) {
                return firstName.substr(0, 2);
            }
            return firstName;
        }
        if (lastName.length > 0) {
            if (lastName.length >= 2) {
                return lastName.substr(0, 2);
            }
            return lastName;
        }
        return '';
    }

    private getEmails(): Array<ContactItemInformation> {
        return Object.getOwnPropertyNames(this.record)
            .filter(p => p.toLowerCase().indexOf('e-mail') >= 0 || p.toLowerCase().indexOf('email') >= 0 || p.toLowerCase().indexOf('mail') >= 0)
            .filter(ep => !!this.record[ep])
            .map(ep => ({ label: ep, value: this.record[ep], category: ContactItemInformationCategory.EMAIL }));
    }

    private getPhones(): Array<ContactItemInformation> {
        return Object.getOwnPropertyNames(this.record)
            .filter(p => p.toLowerCase().indexOf('phone') >= 0)
            .filter(ep => !!this.record[ep])
            .map(ep => ({ label: ep, value: this.record[ep], category: ContactItemInformationCategory.PHONE }));
    }

    private getUrls(): Array<ContactItemInformation> {
        return Object.getOwnPropertyNames(this.record)
            .filter(record => record.toLowerCase().indexOf('web page') >= 0 || record.toLowerCase().indexOf('url') >= 0 || record.toLowerCase().indexOf('link') >= 0)
            .filter(ep => !!this.record[ep])
            .map(ep => ({ label: ep, value: this.record[ep], category: ContactItemInformationCategory.URL }));
    }


    private getFirstName(): string {
        return Object.getOwnPropertyNames(this.record)
            .filter(p => p.toLowerCase().indexOf('name') >= 0)
            .filter(p => p.toLowerCase().indexOf('first') >= 0 || p.toLowerCase().indexOf('given') >= 0)
            .filter(ep => !!this.record[ep])
            .map(p => this.record[p])
            .reduce((a, b) => a + ' ' + b, '')
            .trim() ?? '';

    }


    private getMiddleName(): string {
        return Object.getOwnPropertyNames(this.record)
            .filter(p => p.toLowerCase().indexOf('name') >= 0)
            .filter(p => p.toLowerCase().indexOf('middle') >= 0)
            .filter(ep => !!this.record[ep])
            .map(p => this.record[p])
            .reduce((a, b) => a + ' ' + b, '')
            .trim() ?? '';

    }

    private getLastName(): string {
        return Object.getOwnPropertyNames(this.record)
            .filter(p => p.toLowerCase().indexOf('name') >= 0)
            .filter(p => p.toLowerCase().indexOf('family') >= 0 || p.toLowerCase().indexOf('surname') >= 0 || p.toLowerCase().indexOf('last') >= 0)
            .filter(ep => !!this.record[ep])
            .map(p => this.record[p])
            .reduce((a, b) => a + ' ' + b, '')
            .trim() ?? '';
    }


    private getInitials(): string {
        return Object.getOwnPropertyNames(this.record)
            .filter(p => p.toLowerCase().indexOf('initial') >= 0 || p.toLowerCase().indexOf('initials') >= 0)
            .filter(ep => !!this.record[ep])
            .map(p => this.record[p])
            .reduce((a, b) => a + ' ' + b, '')
            .trim() ?? '';
    }

    /**
     * Returned as b64
     * @private
     */
    private getPhoto(): PhotoDto {

        //@ts-ignore
        return { empty: false, image: undefined, photoType: undefined, pictureType: undefined };
    }

    private concat(a, b): string {
        return a + ' ' + b;
    }

}
