import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from 'core-lib';

@Pipe({
    name: 'contactNumberHtml',
})
export class ContactNumberHtmlPipe implements PipeTransform {

    transform(contact: Contact, property: string = 'PHONE'): string {
        console.log(property);
        const numbers = contact.optionList.filter(opt => opt.category === property);
        const propName = property.split(' ')
            .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
            .join(' ');
        let data = `<div class="item-container">
              <p class="category-label">{{ propName }}</p>
              <div class="category-properties">`;
        for (let num of numbers) {
            data += `<span class="category-value">{{ num.value }}</span>`;
        }

        data += `</div>
        </div>`;

        return data;
    }

}
