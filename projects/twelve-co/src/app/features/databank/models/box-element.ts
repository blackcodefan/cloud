import { FileElement } from './file-element';
import { UploadInterfaces } from './upload.interfaces';

// export enum FileViewType {
//   GridView = 'GridView',
//   LineView = 'LineView',
// }

// export enum SortByKeyType {
//   Name = 'Name',
//   Date_Created = 'Date_Created',
//   Content = 'Content',
//   Size = 'Size',
//   Kind = 'Kind',
//   Owner = 'Owner',
//   Tag = 'Tag'
// }

// export interface PathElement {
//   path: string;
//   element: FileElement;
// }

export interface MoveToElement {
  boxId: string;
  folderID: string;
}
