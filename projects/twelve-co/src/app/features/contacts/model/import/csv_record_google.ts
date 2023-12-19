import { Contact, ContactItemInformation, ContactItemInformationCategory } from 'core-lib';
import { CsvRecord } from '../interfaces';

export class CsvRecordGoogle implements CsvRecord {

    constructor(private record: any) {
    }

    public getContact(): Contact {
        const emails = this.getOptions('E-mail', ContactItemInformationCategory.EMAIL);
        const phones = this.getOptions('Phone', ContactItemInformationCategory.PHONE);
        const urls = this.getOptions('Website', ContactItemInformationCategory.URL);

        return {
            id: 0,
            firstName: this.record['Given Name'].trim() ?? '',
            middleName: this.record['Additional Name'].trim() ?? '',
            lastName: this.record['Family Name'].trim() ?? '',
            optionList: [ ...emails, ...phones, ...urls ],
            initials: this.record['Initials'].trim() ?? '',
            accountId: null,
            contactAccountId: null,
            subscriberId: null,
            visible: 1,
        };
    }

    private getOptions(optionName: string, category: ContactItemInformationCategory) {
        const options = new Array<ContactItemInformation>();
        let index = 1;
        do {
            const headerValue = `${ optionName } ${ index } - Value`;
            const headerType = `${ optionName } ${ index } - Type`;
            if (!this.record[headerValue]) {
                break;
            }
            if (this.record[headerValue].indexOf(' ::: ') >= 0) {
                options.push({
                    label: this.record[headerType],
                    value: this.record[headerValue].split(' ::: ')[0],
                    category,
                });
                options.push({
                    label: this.record[headerType],
                    value: this.record[headerValue].split(' ::: ')[1],
                    category,
                });

            } else {
                options.push({
                    label: this.record[headerType],
                    value: this.record[headerValue],
                    category,
                });

            }
            index++;
        } while (true);
        return options;
    }
}
