import { ContactsVcf } from './contacts-vcf';
import { fromEvent, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ContactsParser } from './contacts-parser';
import { ContactsDummy } from './contacts-dummy';
import { ContactsCsv } from './contacts-csv';
import { Contact, UserNotificationService } from "core-lib";

export class ContactsFile {

  constructor(private file: File, private userNotification: UserNotificationService) {
  }

  getContacts(): Observable<Array<Contact>> {
    console.log('File:', this.file);
    const fileReader = new FileReader();
    const reader$ = fromEvent(fileReader, 'load').pipe(
      map(event => this.getParser((event.target as any).result).getContacts()),
      take(1)
    );
    fileReader.readAsText(this.file, 'UTF-8');
    return reader$;
  }

  private getParser(content: string): ContactsParser {
    let extension;
    try {
      extension = this.file.name.split('.')?.pop()?.toLowerCase();
    } catch (e) {
      this.userNotification.showError('Could not determine filetype');
    }

    if ('vcf' === extension) {
      return new ContactsVcf(content);
    }
    if ('csv' === extension) {
      return new ContactsCsv(content);
    }
    return new ContactsDummy();
  }

}
