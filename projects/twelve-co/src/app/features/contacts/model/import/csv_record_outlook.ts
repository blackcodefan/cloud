import { Contact, ContactItemInformation, ContactItemInformationCategory } from 'core-lib';
import { CsvRecord } from '../interfaces';

export class CsvRecordOutlook implements CsvRecord {
    constructor(private record: any) {
    }

    public getContact(): Contact {
        const emails = this.getEmails();
        const phones = this.getPhones();
        const urls = this.getUrls();

        return {
            id: 0,
            firstName: this.record['First Name'],
            middleName: this.record['Middle Name'],
            lastName: this.record['Last Name'],
            optionList: [ ...emails, ...phones, ...urls ],
            visible: 1,
            initials: this.record['Initials'],
            accountId: null,
            contactAccountId: null,
            subscriberId: null,

        };
    }

    private getEmails(): Array<ContactItemInformation> {
        return Object.getOwnPropertyNames(this.record)
            .filter(p => p.startsWith('E-mail'))
            .filter(ep => !!this.record[ep])
            .map(ep => ({ label: ep, value: this.record[ep], category: ContactItemInformationCategory.EMAIL }));
    }

    private getPhones(): Array<ContactItemInformation> {
        return Object.getOwnPropertyNames(this.record)
            .filter(p => p.includes('Phone'))
            .filter(ep => !!this.record[ep])
            .map(ep => ({ label: ep, value: this.record[ep], category: ContactItemInformationCategory.PHONE }));
    }

    private getUrls(): Array<ContactItemInformation> {
        return Object.getOwnPropertyNames(this.record)
            .filter(p => p.startsWith('Web Page'))
            .filter(ep => !!this.record[ep])
            .map(ep => ({ label: ep, value: this.record[ep], category: ContactItemInformationCategory.URL }));
    }
}
