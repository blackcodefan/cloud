import { Contact, ContactItemInformationCategory } from 'core-lib';

class NameWrap {
    firstName?: string;
    middleName?: string;
    lastName?: string;

    constructor(partial: Partial<Contact> = {}) {
        Object.assign(this, partial);
    }
}

interface CompanyWrap {
    companyName: string;
    jobTitle: string;
    department: string;
}

// It appears that custom labels are all defined in a special property called xAbLabel.
// See https://www.w3.org/2002/12/cal/vcard-notes.html
// We define this interface to identify more easily a custom label based on its key.
interface CustomLabel {
    key: string;
    value: string;
}

// This class is used to build a Contact object
// by extracting data from a vCard object returned by node-vcf.
//
// Resources:
//     node-vcf: https://github.com/jhermsmeier/node-vcf
//     vCard: https://en.wikipedia.org/wiki/VCard
//     vCard Format Specification: https://tools.ietf.org/html/rfc6350
export class VCardWrap {

    // The jCard representation of the vCard object received in the constructor.
    // It's used in some of the methods because it offers certain properties already parsed and separated,
    // for instance the parts of the name.
    // See https://en.wikipedia.org/wiki/VCard#jCard for details on jCard.
    private jCard: any;

    private customLabels: Array<CustomLabel> = [];

    constructor(private vCard: any) {
        this.jCard = this.vCard.toJCard();

        const xAbLabel = vCard.get('xAbLabel');
        if (xAbLabel && Array.isArray(xAbLabel)) {
            this.customLabels = xAbLabel.map(p => ({ key: p.group, value: p.valueOf() }));
        }
    }

    private get jCardData() {
        return this.jCard[1];
    }

    public buildContact(): Contact {
        if (this.jCardData.length === 1) {
            // @ts-ignore
            return null;
        }

        const nameWrap = this.getNameWrap();
        const emails = this.getOptions('email', ContactItemInformationCategory.EMAIL);
        const phones = this.getOptions('tel', ContactItemInformationCategory.PHONE);
        const urls = this.getOptions('url', ContactItemInformationCategory.URL);

        // @ts-nocheck
        return {
            id: 0,
            accountId: null,
            contactAccountId: null,
            firstName: nameWrap.firstName || '',
            middleName: nameWrap.middleName || '',
            lastName: nameWrap.lastName || '',
            initials: '',
            subscriberId: null,
            optionList: [ ...emails, ...phones, ...urls ],
            visible: 1,
        };
    }

    private getNameWrap(): NameWrap {
        // Find the name element in data.
        const n = this.jCardData.find((item: any) => item.length > 0 && item[0] === 'n');
        if (!n) {
            return new NameWrap();
        }
        const nameArr = n[3];

        return new NameWrap({
            lastName: this.getPropertyValueDecoded(nameArr[0]),
            firstName: this.getPropertyValueDecoded(nameArr[1]),
            middleName: this.getPropertyValueDecoded(nameArr[2]),
        });
    }

    private getBirthDate(): Date {
        const bdayProp = this.vCard.get('bday');
        if (!bdayProp) {
            // @ts-ignore
            return null;
        }
        const pattern = /(\d{4})(\d{2})(\d{2})/;
        return new Date(bdayProp.valueOf().replace(pattern, '$1-$2-$3'));
    }

    private getCompanyWrap(): CompanyWrap {
        const company: CompanyWrap = {
            companyName: '',
            jobTitle: '',
            department: '',
        };
        let orgProp = this.vCard.get('org');
        if (Array.isArray(orgProp)) {
            orgProp = orgProp[0];
        }
        if (orgProp) {
            const orgProps = orgProp.valueOf().split(';');
            if (orgProps.length > 0) {
                company.companyName = this.getPropertyValueDecoded(orgProps[0]);
            }
            if (orgProps.length > 1) {
                company.department = this.getPropertyValueDecoded(orgProps[1]);
            }
        }
        let titleProp = this.vCard.get('title');
        if (Array.isArray(titleProp)) {
            titleProp = titleProp[0];
        }
        if (titleProp) {
            company.jobTitle = this.getPropertyValueDecoded(titleProp);
        }
        return company;
    }

    private getOptions(vCardProperty: string, category: ContactItemInformationCategory) {
        const prop = this.vCard.get(vCardProperty);
        if (!prop) {
            return [];
        }
        let propItems = [];
        if (Array.isArray(prop)) {
            // @ts-ignore
            propItems = prop.map(e => this.getLabel(e));
        } else {
            // @ts-ignore
            propItems = [ this.getLabel(prop) ];
        }
        // @ts-ignore
        return propItems.map(lv => ({ label: lv.label, value: lv.value, category }));
    }

    // For a vCard prop, looks at the 'group' and 'type' values and returns the label
    // according to their presence and type (string, array).
    private getLabel(prop: any) {
        const value = prop.valueOf();
        if (prop.group) {
            const customLabel = this.getCustomLabelValue(prop.group);
            if (customLabel) {
                return { label: customLabel, value };
            }
        }
        if (!prop.type) {
            return { label: '', value };
        }
        let label = '';
        if (Array.isArray(prop.type)) {
            // Google exports vCard with this type set for emails, additional to the label selected.
            label = prop.type.find((type: any) => type !== 'internet');
            if (!label) {
                label = '';
            }
        }
        if (typeof prop.type === 'string') {
            label = prop.type;
        }
        return { label, value };
    }

    private getCustomLabelValue(key: string): string {
        const customLabel = this.customLabels.find(l => l.key === key);
        return customLabel ? this.getPropertyValueDecoded(customLabel.value) : '';
    }


    /**
     * use to eventually decode quoted-printable values
     * @param prop property of vcard; can be string or object
     * example of prop
     *   prop = "This is not encoded"
     * - prop = "=36=2D=31=32=20=43=6F=70=69=6C=75=6C=75=69"
     * - prop = { encoding: "QUOTED-PRINTABLE", data: "=36=2D=31=32=20=43=6F=70=69=6C=75=6C=75=69"}
     */
    private getPropertyValueDecoded(prop: any) {
        if (prop) {
            if (typeof prop === 'string') {
                if (prop.startsWith('=')) {
                    return this.decodeQuotedPrintable(prop)?.replace('=', '');
                } else {
                    return prop;
                }
            } else {
                let str = prop.valueOf();
                if (prop.encoding && prop.encoding === 'QUOTED-PRINTABLE') {
                    str = this.decodeQuotedPrintable(str);
                }
                return str.replace('=', ''); // replace eventually ending "="
            }
        } else {
            return '';
        }
    }

    private decodeQuotedPrintable(data: any) {
        // ensure that data is a string
        if (!(typeof data === 'string' || data instanceof String)) {
            return null;
        }
        const replacer = (match: any, p1: string) => {
            // handle escape sequence
            if (p1.trim().length === 2) {
                // decode byte (for example: "=20" ends up as " ")
                const code = parseInt(p1.trim(), 16);
                return String.fromCharCode(code);
            }
            // handle soft line breaks
            return '';
        };
        // remove soft line breaks and convert escape sequences
        data = data.replace(/=([0-9A-F]{2}|\r\n|\n)/gi, replacer);
        // decode escape sequences
        try {
            return decodeURIComponent(escape(data));
        } catch (dummy) {
            return null;
        }
    }

    private getPhoto(): string | null {
        const photoElem = this.jCardData.find((item: any) => item.length > 0 && item[0] === 'photo');
        if (!photoElem || photoElem.length < 4) {
            return null;
        }
        if (!photoElem[1].encoding && photoElem[1].encoding !== 'BASE64') {
            return null;
        }
        const type = photoElem[1].type;
        return `data:image/${ type };base64,${ photoElem[3] }`;
    }
}
