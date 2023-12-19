import { Pipe, PipeTransform } from '@angular/core';
import { SentEmail } from '../model/email.model';

@Pipe({
    name: 'filterSentEmail',
})
export class FilterSentEmailPipe implements PipeTransform {

    transform(sentEmailList: Array<SentEmail>, _searchText: string): Array<SentEmail> {
        if (_searchText === '') {
            return sentEmailList;
        } else {
            return sentEmailList.filter(email => { // matches the emails by token
                return email.receiver.toLowerCase().indexOf(_searchText.toLowerCase()) !== -1 ||
                    email.title.toLowerCase().indexOf(_searchText.toLowerCase()) !== -1 ||
                    email.body.toLowerCase().indexOf(_searchText.toLowerCase()) !== -1 ||
                    email.date.toLowerCase().indexOf(_searchText.toLowerCase()) !== -1;
            })
                .sort((a: SentEmail, b: SentEmail) => {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                }); // sorts the emails by dates
        }
        return [];
    }

}
