import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
    BoxDto,
    DownloadTokenInfo,
    FolderData,
    FolderTreeContentDto,
    ItemDetails,
    ItemOperationOptionEnum,
    ItemReportDto,
    ItemsCopyInfo,
    ItemTypeEnum,
    NewFolderDetails,
    SortDirectionEnum,
    SortFieldEnum,
    StorageDto,
    StoragePreDownloadInfo,
    StoragesDto,
    StoragesMinDto,
    StoragesStatus,
    StorageStatus,
    VersionInfoDto,
} from 'core-lib';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { environment } from '../../../../environments/environment';
import { FilterBoxKeyEnum, FolderUploadDto, Pageable } from '../models';
import { DatabankState, selectBoxesToDisplay } from '../store';

@Injectable({
    providedIn: 'root',
})
export class DatabankService {
    baseRef = environment.apiUrl;
    readonly BOXES = `${ this.baseRef }boxes`;
    readonly STORAGES = `${ this.baseRef }storages`;
    readonly STORAGES_DOWNLOADS = `${ this.STORAGES }/downloads`;
    readonly EXISTS = `${ this.STORAGES }/exists`;
    readonly DUPLICATES = `${ this.STORAGES }/duplicates`;
    readonly ITEMS_MOVE = `${ this.STORAGES }/items-move`;
    readonly SEARCH_ITEMS = `${ this.STORAGES }/search-items`;
    private subSink = new SubSink();
    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    };
    private boxCateg: FilterBoxKeyEnum;

    constructor(private httpClient: HttpClient, private store: Store<DatabankState>) {
        this.subSink.sink = this.store.pipe(select(selectBoxesToDisplay)).subscribe(categ => this.boxCateg = categ);
    }


    /***** BOXES */
    fetchAllBoxes(): Observable<Array<ItemDetails>> {

        return this.httpClient.get<Array<ItemDetails>>(this.BOXES);
    }

    /**
     * Load my boxes of which i am the owner
     * * todo add pagination
     */
    fetchMyBoxes(): Observable<Array<ItemDetails>> {
        const params = new HttpParams();
        if (!!this.boxCateg) {
            params.set('box_categ', '');
        }

        return this.httpClient.get<Array<ItemDetails>>(`${ this.BOXES }/mine`, { params });
    }

    /**
     * Check in bulk if multiple storages exist with the same name
     * @param storagesStatusDto
     */
    checkStoragesWithNameExits(storagesStatusDto: StoragesStatus): Observable<Array<StorageStatus>> {
        return this.httpClient.post<Array<StorageStatus>>(`${ this.STORAGES }/exits`, storagesStatusDto, this.httpOptions);
    }

    /**
     * Check in bulk if multiple storages exist with the same name
     */
    checkStorageWithNameExits(storagesStatusDto: StorageStatus, accountId: number, parentId: string): Observable<StorageStatus> {
        const data: StoragesStatus = { storages: [ storagesStatusDto ], accountId, parentId };
        return this.httpClient.post<StorageStatus>(`${ this.STORAGES }/exits`, data, this.httpOptions).pipe(map(res => res[0]));
    }

    createBox(newBox: NewFolderDetails): Observable<ItemDetails> {

        return this.httpClient.post<ItemDetails>(this.BOXES, newBox, this.httpOptions);
    }

    deleteBox(boxId: string, accountId: number): Observable<any> {

        return this.httpClient.delete<any>(`${ this.BOXES }/${ boxId }/accounts/${ accountId }`);
    }

    updateBox(accountId: number, newBox: BoxDto): Observable<BoxDto> {

        return this.httpClient.put<BoxDto>(`${ this.BOXES }/accounts/${ accountId }`, newBox, this.httpOptions);
    }

    findBox(boxId: string, accountId: number): Observable<BoxDto> {

        return this.httpClient.get<BoxDto>(`${ this.BOXES }/${ boxId }/accounts/${ accountId }`);
    }

    findFolderIcon(accountId: number, iconId: string | null): Observable<string> {
        return this.httpClient.get<string>(`${ this.STORAGES }/accounts/${ accountId }/icons/${ iconId }`, { responseType: 'text' as 'json' }).pipe(shareReplay());
    }

    findItemIcon(iconId: string): Observable<string> {
        return this.httpClient.get<string>(`${ this.STORAGES }/icons/${ iconId }`, { responseType: 'text' as 'json' }).pipe(shareReplay());
    }

    findAllIconsInStorage(storageId: string): Observable<{ [imageId: string]: string }> {
        return this.httpClient.get<{ [imageId: string]: string }>(`${ this.baseRef }icons/folders/${ storageId }`);
    }

    /**
     * Get all the icons in a given folder/storage
     * @param accountId
     * @param iconIds
     */
    findFolderIconsForIds(accountId: number, iconIds: Array<string>): Observable<any> {
        return this.httpClient.post<any>(`${ this.STORAGES }/accounts/${ accountId }/icons`, iconIds, this.httpOptions).pipe(shareReplay());
    }

    findFolderPreview(iconId: string): Observable<string> {
        return this.httpClient.get<string>(`${ this.STORAGES }/accounts/image-preview/${ iconId }`, { responseType: 'text' as 'json' }).pipe(shareReplay());
    }

    findDefaultFolderIcon(): Observable<string> {
        return this.httpClient.get<string>('./assets/images/empty-safe-box.svg', { responseType: 'text' as 'json' }).pipe(shareReplay());
    }

    findParentDetail(folderId: string, accountId: number): Observable<ItemDetails> {
        return this.httpClient.get<ItemDetails>(`${ this.BOXES }/parent/${ folderId }/accounts/${ accountId }`);
    }


    getBoxItems(folderData: FolderData): Observable<any> {
        return this.httpClient.post<any>(`${ this.STORAGES }/tree`, folderData, this.httpOptions).pipe(map(c => c.content));
    }


    /***** FILES/FOLDERS */
    listFolderItems(folderData: FolderData, sortField?: SortFieldEnum, sortDir?: SortDirectionEnum, itemType?: ItemTypeEnum): Observable<ItemDetails[]> {
        const page = 0;
        const size = 1000;
        let params = '';
        if (sortField !== null && sortField !== undefined) {
            params = 'sort_field=' + sortField;
        }
        if (sortDir !== null && sortDir !== undefined) {
            if (params.length > 0) {
                params = params + '&';
            }
            params = params + 'sort_dir=' + sortField;
        }
        if (itemType !== null && itemType !== undefined) {
            params = (params.length > 0) ? `${ params }&type=${ itemType }` : `type=${ itemType }`;
        }
        const url = (params.length > 0) ? `${ this.STORAGES }/list?page=${ page }&size=${ size }&${ params }` : `${ this.STORAGES }/list?page=0&size=1000`;
        return this.httpClient.post<Pageable<ItemDetails>>(url, folderData, this.httpOptions).pipe(map(c => c.content));
    }

    /***** FILES/FOLDERS */
    listStorageContentAsTree(storageId: string): Observable<Array<FolderTreeContentDto>> {
        return this.httpClient.get<Array<FolderTreeContentDto>>(`${ this.STORAGES }/tree/${ storageId }`, this.httpOptions);
    }


    fetchFolderDetails(storageId: string): Observable<ItemDetails> {
        return this.httpClient.get<ItemDetails>(`${ this.STORAGES }/${ storageId }/details`, this.httpOptions);
    }

    searchItems(folderData: FolderData, sortField?: SortFieldEnum, sortDir?: SortDirectionEnum, itemType?: ItemTypeEnum): Observable<any> {
        const page = 0;
        const size = 1000;
        let params = '';
        if (sortField !== null && sortField !== undefined) {
            params = 'sort_field=' + sortField;
        }
        if (sortDir !== null && sortDir !== undefined) {
            if (params.length > 0) {
                params = params + '&';
            }
            params = params + 'sort_dir=' + sortField;
        }
        if (itemType !== null && itemType !== undefined) {
            params = (params.length > 0) ? `${ params }&type=${ itemType }` : `type=${ itemType }`;
        }
        const url = (params.length > 0) ? `${ this.SEARCH_ITEMS }?page=${ page }&size=${ size }&${ params }` : `${ this.SEARCH_ITEMS }?page=0&size=1000`;
        return this.httpClient.post(url, folderData, this.httpOptions);
    }

    createFolder(newFolder: NewFolderDetails): Observable<Array<ItemDetails>> {

        return this.httpClient.post<Array<ItemDetails>>(`${ this.STORAGES }/folders`, newFolder, this.httpOptions);
    }


    uploadFolderIcon(newFile: FormData): Observable<HttpEvent<{}>> {

        return this.httpClient.post<HttpEvent<{}>>(`${ this.STORAGES }/icons`, newFile, { reportProgress: true, observe: 'events' });
    }

    /**
     * get token and item info in order to be able to download item
     * @param spdInfo
     * @returns
     */
    askDownloadTokenInfo(spdInfo: StoragePreDownloadInfo): Observable<DownloadTokenInfo> {

        return this.httpClient.post<DownloadTokenInfo>(`${ this.STORAGES_DOWNLOADS }/tokens`, spdInfo, this.httpOptions);
    }

    /**
     * update downloadTokenInfo with decrypted keys for item
     * @param downloadTokenInfo
     * @returns
     */
    updateDownloadTokenInfo(downloadTokenInfo: DownloadTokenInfo): Observable<any> {

        return this.httpClient.put<any>(`${ this.STORAGES_DOWNLOADS }/tokens`, downloadTokenInfo, this.httpOptions);
    }


    fetchDownloadToken(accountId: number, itemId: string): Observable<any> {
        return this.httpClient.post(`${ this.STORAGES }/downloads/tokens`, { accountId, itemId });
    }


    /**
     * Actual download of the file
     * @param token
     */
    downloadFile(token: string): Observable<HttpEvent<Blob>> {

        return this.httpClient.get(`${ this.STORAGES_DOWNLOADS }/${ token }`, {
                reportProgress: true,
                observe: 'events',
                responseType: 'blob',
            },
        );
    }

    deleteItems(storages: StoragesMinDto): Observable<any> {

        return this.httpClient.post<any>(`${ this.STORAGES }/delete`, storages, this.httpOptions);
    }

    updateItems(storages: StoragesDto): Observable<Array<StorageDto>> {

        return this.httpClient.post<Array<StorageDto>>(`${ this.STORAGES }`, storages, this.httpOptions);
    }

    findItem(itemId: string, accountId: number): Observable<StorageDto> {

        return this.httpClient.get<StorageDto>(`${ this.STORAGES }/${ itemId }/accounts/${ accountId }`, this.httpOptions);
    }

    checkItemsExist(storagesStatus: StoragesStatus): Observable<Array<StorageStatus>> {

        return this.httpClient.post<Array<StorageStatus>>(`${ this.EXISTS }`, storagesStatus, this.httpOptions);
    }

    copyItems(itemsCopyInfo: ItemsCopyInfo): Observable<any> {

        return this.httpClient.put<any>(`${ this.DUPLICATES }`, itemsCopyInfo, this.httpOptions);
    }

    moveItems(itemsCopyInfo: ItemsCopyInfo): Observable<Array<ItemReportDto>> {

        return this.httpClient.patch<Array<ItemReportDto>>(`${ this.ITEMS_MOVE }`, itemsCopyInfo, this.httpOptions);
    }

    sharedWithMe(): Observable<Array<ItemDetails>> {
        return this.httpClient.get<Array<ItemDetails>>(`${ this.BOXES }/shared-with-me`).pipe(catchError(e => []));
    }

    rename(accountId: number, boxId: string, newName: string): Observable<ItemDetails> {
        return this.httpClient.post<ItemDetails>(`${ this.STORAGES }/rename`, { accountId, boxId, newName });
    }

    addDescription(accountId: number, boxId: string, description: string): Observable<ItemDetails> {
        return this.httpClient.post<ItemDetails>(`${ this.STORAGES }/description`, { accountId, boxId, description });
    }

    /**
     * Delete storages by id
     * @param selectedDataIDs
     */
    deleteFoldersAndContent(selectedDataIDs: Array<string>) {
        return this.httpClient.post<ItemDetails>(`${ this.STORAGES }/delete-items`, selectedDataIDs);
    }

    /**
     * Delete storage by id
     * @param  storageId
     */
    deleteFolderAndContent(storageId: string): Observable<any> {
        return this.httpClient.delete<any>(`${ this.STORAGES }/${ storageId }`);
    }

    uploadFolderMetadata(folderMetadata: Array<FolderUploadDto>, storageId: string): Observable<Array<FolderUploadDto>> {
        return this.httpClient.post<Array<FolderUploadDto>>(`${ this.STORAGES }/uploads/metadata/${ storageId }`, folderMetadata);
    }

    /**
     * Download a storage given an id
     * @param storageId
     */
    downloadStorage(storageId: string): Observable<Blob> {
        return this.httpClient.get(`${ this.STORAGES }/downloads/${ storageId }`, {
            observe: 'response',
            responseType: 'blob',
        }).pipe(
            map(res => {
                const blb = res.body as Blob;
                return new Blob([ blb ]);
            }),
        );
    }


    setStarredOnBox(accountId: number, boxId: string, starred: boolean): Observable<any> {
        return this.httpClient.post(`${ this.STORAGES }/starred`, { accountId, boxId, starred });
    }


    /**
     * Find root box for current item
     * @param currentRootID
     */
    findRootBox(currentRootID: string): Observable<ItemDetails> {
        return this.httpClient.get<ItemDetails>(`${ this.BOXES }/root-box/${ currentRootID }`);
    }

    /**
     * Clear folder icon
     * @param itemId
     */
    clearFolderIcon(itemId: string): Observable<any> {
        return this.httpClient.delete(`${ this.STORAGES }/icons/${ itemId }`);
    }

    getVersions(targetStorageId: string): Observable<Array<VersionInfoDto>> {
        return this.httpClient.get<Array<VersionInfoDto>>(`${ this.STORAGES }/versions/${ targetStorageId }`);
    }

    /**
     * Duplicate item
     * @param item
     * @param accountId
     * @param currentFolderId
     */
    duplicateItem(item: ItemDetails, accountId: number, currentFolderId: string): Observable<ItemDetails> {
        const body = { items: [ { ...item, itemOption: ItemOperationOptionEnum.FILE_NEW } ], accountId, targetParentId: currentFolderId };
        return this.httpClient.put<ItemDetails>(`${ this.STORAGES }/duplicate`, body).pipe(map(res => res[0]));
    }

    duplicateItems(items: Array<ItemDetails>, accountId: number, currentFolderId: string): Observable<Array<ItemDetails>> {
        const body = { items: items.map(i => ({ ...i, itemOption: ItemOperationOptionEnum.FILE_NEW })), accountId, targetParentId: currentFolderId };
        return this.httpClient.put<Array<ItemDetails>>(`${ this.STORAGES }/duplicate`, body);
    }
}
