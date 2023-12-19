import { StorageStatus } from 'core-lib';

export interface DuaplicationUploadEntities {
    files: Array<DuplicationFileUpload>,
    accountId: number,
    parentId: string
}

export interface DuplicationFileUpload {
    fileName: string,
    storage: StorageStatus,
    fileBlobs: File
}
