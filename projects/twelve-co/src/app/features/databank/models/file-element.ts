export interface FileElement {
  id?: string;
  isFolder: boolean;
  name: string;
  uploadTime: string;
  size: string;
  tag: string;
  owner: string;
  version: number;
  ImageBaseUrl: string | any;
  height: number,
  width: number,
  bytesize: number;
  counts: number;
  extension: string | any;
  imageType:string;
  parent: string | undefined;
  expand:boolean,
  highlight: boolean,
}
