import { Contact } from 'core-lib';
import { Papa, ParseMeta } from 'ngx-papaparse';
import { CsvTypeEnum } from '../enums';
import { CsvRecord } from '../interfaces';
import { ContactsParser } from './contacts-parser';
import { CsvRecordGeneric } from './csv_record_generic';
import { CsvRecordGoogle } from './csv_record_google';
import { CsvRecordOutlook } from './csv_record_outlook';


export class ContactsCsv implements ContactsParser {

  constructor(private content: string) {
  }

  getContacts(): Contact[] {
    const papa = new Papa();
    const result = papa.parse(this.content, { skipEmptyLines: true, header: true });
    console.log('CSV parse result', result);
    if (result.errors.length > 0) {
      console.log('CSV parse errors:', result.errors);
      if (!result.data || result.data.length === 0) {
        throw { error: `Parse errors: ${result.errors[0].message}` };
      }
    }
    const csvType = this.getCsvType(result.meta);
    return result.data.map((record: any) => this.getCsvRecord(csvType, record).getContact()).filter((contact: Contact) => contact !== null);
  }

  private getCsvRecord(csvType: CsvTypeEnum, record: any): CsvRecord {
    switch (csvType) {
      case CsvTypeEnum.GOOGLE:
        return new CsvRecordGoogle(record);
      case CsvTypeEnum.OUTLOOK:
        return new CsvRecordOutlook(record);
      case CsvTypeEnum.GENERIC:
      default:
        return new CsvRecordGeneric(record);
    }
  }

  private getCsvType(meta: ParseMeta): CsvTypeEnum {
    if (meta.fields.includes('E-mail 1 - Value') || meta.fields.includes('Yomi Name')) {
      return CsvTypeEnum.GOOGLE;
    }
    if (meta.fields.includes('Primary Phone')) {
      return CsvTypeEnum.OUTLOOK;
    }
    return CsvTypeEnum.GENERIC;
  }
}
