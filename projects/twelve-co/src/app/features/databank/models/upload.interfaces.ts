export interface UploadInterfaces {
  id: string;
  title: string;
  progress: string;
  size: string;
  createTime: Date;
}

export interface FolderUploadDto {
  folderName: string;
  folderPath: string;
  storageId?: string;
}
