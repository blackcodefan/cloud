import { createAction, props } from '@ngrx/store';
import { CallDataDto, FolderTreeContentDto, ItemDetails, NotificationContent, Tag, UploadDetail } from 'core-lib';
import { BreadCrumbElement, FileElement, FilterBoxKeyEnum, SortByEnum, UploadInterfaces } from '../models';

// let the new stuff begin

export const updateSingleBoxExpand = createAction('[DATABANK] Update SingleBox Expand Status', props<{ singleBoxID: string }>());

export const setBoxList = createAction('[DATABANK] Retrieve Boxs Success', props<{ boxsList: ItemDetails[] }>());

export const addNewBox = createAction('[DATABANK] Add New Box', props<{ singleBoxItem: ItemDetails }>());

export const removeTempBox = createAction('[DATABANK] Remove temp box');

export const renameBox = createAction('[DATABANK] Rename Box', props<{ boxId: string, boxName: string }>());

export const renameItem = createAction('[Box detail] Rename item', props<{ itemId: string, item: ItemDetails }>());

export const removeBox = createAction('[DATABANK] Delete Box', props<{ boxId: string }>());

export const addSingleBoxToBin = createAction('[DATABANK] Add SingleBox to Bin', props<{ singleBox: ItemDetails }>());

export const logoutAction = createAction('[APP] logout');

export const emptyBinBoxList = createAction('[DATABANK] Empty Bin Box List');

export const retrivesingleBox = createAction('[DATABANK] Retrive Single Box', props<{ singleBoxID: string }>());

export const updateviewMethodsingleBox = createAction('[DATABANK] Update Single Box View Method', props<{ singleBoxID: string, viewMethod: string }>());

export const updateFullScreenMethodSingleBox = createAction('[DATABANK] Update Single Box Full Screen Method', props<{ singleBoxID: string, fullScreen: boolean }>());


export const addnewDataToBox = createAction('[DATABANK] Add File To Box', props<{ boxId: string | undefined, newData: FileElement }>());


export const moveToDatas = createAction('[Box Info] Move Datas', props<{ prevBoxID: string, prevDataIds: Array<string>, nextBoxID: string, nextDataId: string }>());

export const updateMoveToCurrentRoot = createAction('[DATABANK] Update Box Current Move To Root', props<{ boxId: string, currentMoveToRoot: FileElement | null, currentMoveToPath: Array<string> }>());

export const updateCurrentFileListSingleBox = createAction('[DATABANK] Update Current File List Single Box', props<{ singleBoxID: string, currentRootID: string | undefined }>());

export const removeCurrentFile = createAction('[DATABANK] remove Current File From Box', props<{ singleBoxID: string, currentFileID: string | undefined }>());

export const moveCurrentFile = createAction('[DATABANK] move Current File From Box', props<{ singlePrevBoxID: string, prevFileID: string, singleboxID: string, currentFileParentID: string | undefined }>());

export const removeCurrentFolder = createAction('[DATABANK] remove Current Folder From Box', props<{ singleBoxID: string, currentFolderID: string | undefined }>());

export const moveCurrentFolder = createAction('[DATABANK] move Current Folder From Box', props<{ singlePrevBoxID: string, prevFolderID: string, singleboxID: string, currentFolderParentID: string | undefined }>());

export const setSearchKey = createAction('[App Info] Set Search Key', props<{ searchKey: any }>());

export const setBinSelectedBoxID = createAction('[App Info] Set Selected Bin boxId', props<{ selectedBoxID: string }>());

export const setselectedDataIDs = createAction('[App Info] Set Selected AttachmentIDs', props<{ selectedDataIDs: Array<string> }>());

export const setAppCurrentAction = createAction('[App Info] Set App CurrentAction', props<{ CurrentActionType: any }>());

export const updateBoxFileViewMethod = createAction('[Box Info] update Box View Method', props<{ selectedBoxID: string | undefined, boxFileViewMethod: any }>());

export const updateBoxSortKeyType = createAction('[Box Info] update Box Sort Key Type', props<{ selectedBoxID: string, boxSortKeyType: any }>());

export const setIsCreateFolder = createAction('[App Info] Set Create Folder Status', props<{ IsCreateFolder: boolean }>());

export const setBoxListViewMethod = createAction('[App Info] Set BoxListViewMethod Status', props<{ BoxListViewMethod: boolean }>());

export const setNewFolderName = createAction('[App Info] Set New Folder Name', props<{ NewFolderName: string }>());

export const updateAppCurrentAction = createAction('[App Info] Update App Current Action', props<{ CurrentAction: any }>());

export const formatAppInfo = createAction('[App Info] Set AppInfo');

export const addNewDataID = createAction('[Box Info] Add DataID to Current Box', props<{ boxId: string, dataID: string }>());

export const updateDataName = createAction('[Box Info] Update Data Name', props<{ boxId: string, dataID: string, dataName: string }>());

export const setNewBoxName = createAction('[App Info] Set New Box Name', props<{ boxName: string, boxId: string }>());

export const removeDataId = createAction('[Box Info] Remove DataID to Current Box', props<{ fileIds: string[] }>());

export const removeAttachmentID = createAction('[App Info]Remove attachmentID from AppInfo', props<{ selectedBoxID: string, AttachmentID: string }>());

export const updateAttachmentParentID = createAction('[Box Info]Update Attachment ParentID', props<{ boxId: string, prevAttachmentID: string, nextAttachmentID: string }>());

export const addUploadingNotificationToSingleBox = createAction('[Box Info]Add UploadingNotification To SingleBox', props<{ boxId: string, notificationElement: UploadInterfaces }>());

export const removeUploadingNotification = createAction('[Box Info]Remove UploadingNotification To SingleBox', props<{ boxId: string, notificationID: string }>());

export const removeUploadFromQueue = createAction('[Box upload]Remove notification from queue ', props<{ notificationId: string }>());

export const clearUploadQueue = createAction('[Box upload] Clear upload quuue ');

export const setGridViewMode = createAction('[DATABANK] Set view mode to grid', props<{ gridView: boolean }>());
export const addImagetoBox = createAction('[DATABANK] Add Image to Box', props<{ boxId: string, imageUrl: string, width: number, height: number }>());

export const addStarred = createAction('[DATABANK] Set Box as Starred', props<{ boxId: string }>());

export const removeStarred = createAction('[DATABANK]Remove Box from Starred', props<{ boxId: string }>());

export const renameTag = createAction('[App Info] rename tag to AppInfo', props<{ selectedTagID: string, tagName: string }>());

export const removeTag = createAction('[App Info] remove tag from AppInfo', props<{ selectedTagID: string }>());

export const addImagetoData = createAction('[Box Info] Add Image to Data', props<{ itemId: string, coverPhotoId: string }>());

export const updateCurrentDataList = createAction('[DATABANK] Update Data list', props<{ boxId: string | undefined, currentRootID: string }>());

export const updateCurrentMoveToDataList = createAction('[DATABANK] Update Move to Data list', props<{ boxId: string | undefined, currentMoveToRootID: string | undefined }>());

// mircea
export const clearBoxNavigationTree = createAction('[DATABANK] clear navigation tree');
export const clearSelection = createAction('[DATABANK] clear selection'); // cleans the store todo

export const setUploadingItemAction = createAction('[APP] Uploading item acion', props<{ item: UploadDetail }>());

export const setCurrentApp = createAction('[APP] set current application', props<{ currentAppKey: string }>());
export const removeFoldersOrFiles = createAction('[DATABANK] remove folders or files', props<{ itemIds: Array<string> }>());
export const setCurrentAction = createAction('[DATABANK] set view action', props<{ currentAction: string }>());
export const addBreadcrumbItem = createAction('[DATABANK] add breadcrumb', props<{ breadCrumbItem: BreadCrumbElement }>());
export const setBreadCrumbList = createAction('[DATABANK] add breadcrumb list', props<{ breadCrumbList: Array<BreadCrumbElement> }>());
export const setSelectedFolder = createAction('[DATABANK] set current selected folder', props<{ selectedFolder: ItemDetails }>());
export const setSelectedStorage = createAction('[DATABANK] set selected storage', props<{ selectedStorage: ItemDetails }>());
export const addBoxDescription = createAction('[DATABANK] add box description', props<{ boxId: string, description: string }>());
export const addFolderToView = createAction('[DATABANK] Add folder to list', props<{ boxId: string, folder: ItemDetails }>());
export const deleteFolderFromView = createAction('[DATABANK] Delete folder from view', props<{ boxId: string, folderId: string }>());


export const addFileToView = createAction('[DATABANK] Add file to list', props<{ folderId: string, file: ItemDetails }>());
export const sharedWithMe = createAction('[SIDEBAR] add shared with me boxes', props<{ sharedWithMe: Array<ItemDetails> }>());
export const setSelectedBox = createAction('[DATABANK] set selected box', props<{ selectedBox: ItemDetails }>());
export const setSelectedBoxById = createAction('[DATABANK] set selected box by id', props<{ selectedBox: string }>());
export const deselectBox = createAction('[DATABANK] deselect Box');
export const updateBoxDescription = createAction('[DATABANK] Update box description ', props<{ description: string, boxId: string }>());
export const updateBoxCoverImage = createAction('[DATABANK] Update box imageId for a single box', props<{ coverPhotoId: string, boxId: string }>());
export const removeTagDisableStatus = createAction('[DATABANK] remove tag disable action ', props<{ tagIndex: number }>());
export const setBoxesToDisplay = createAction('[DATABANK] set boxes to display', props<{ boxesToDisplay: FilterBoxKeyEnum }>()); // toggle the sidebar
export const updateTagDisableStatus = createAction('[DATABANK]update tag disable station from tag list', props<{ tagIndex: number }>());
export const toggleView = createAction('[DATABANK] toggleView');
export const setSortByType = createAction('[DATABANK] set sortby type', props<{ sortyByType: SortByEnum }>());
export const toggleSortByDirection = createAction('[DATABANK] toggle sort by direction');
export const changeSideBarStatus = createAction('[APP] change sidebar status', props<{ status: boolean }>()); // toggle the sidebar
export const removeNewItem = createAction('[DATABANK] remove new box', props<{ boxName: string }>());
export const setInvitation = createAction('[APP] new invitation received', props<{ invitation: NotificationContent }>());
export const setInvitations = createAction('[APP] new invitations received', props<{ invitations: Array<NotificationContent> }>());
export const removeMemberhip = createAction('[DatabankState] remove membership by id', props<{ membershipId: number }>());
export const setCallsSummary = createAction('[ALO] Set calls summary ', props<{ callsSummary: CallDataDto }>());
export const setSlectedUserAction = createAction('[ALO] setSelectedUsersAction', props<{ usrId: any }>());
export const setSubscriberId = createAction('[ALO] set subscriberid', props<{ subscriberId: number }>());
export const setAccounts = createAction('[ALO] set accounts', props<{ accounts: any }>());
export const setOutboundCallWindowRef = createAction('[ALO] Set outbound call window ref ', props<{ windowRef: any }>());
export const setTagsForStorage = createAction('[DATABANK] set tags for storage', props<{ tags: Array<Tag>, storageId: string }>());
export const setBoxContent = createAction('[DATABANK] set box content', props<{ boxContent: Array<FolderTreeContentDto> }>());
export const setNewFolderStatus = createAction('[DATABANK] set new folder status ', props<{ folderStatus: boolean }>());
export const setIsNewBoxStatus = createAction('[DATABANK] set new box status ', props<{ isNewBox: boolean }>());
export const removeFileFromFolder = createAction('[DATABANK] removing file from folder ', props<{ folderId: string, fileId: string }>());
export const setIsBoxPreview = createAction('[DATABANK] set box preview ', props<{ isPreview: boolean }>());
export const setCurrentPreviewType = createAction('[DATABANK] set current preview type ', props<{ previewType: string }>());
export const setSelectedFile = createAction('[DATABANK] set selected file ', props<{ selectedFile: ItemDetails }>());
export type  DatabankActions = ReturnType<typeof updateSingleBoxExpand>
    | ReturnType<typeof setBoxList>
    | ReturnType<typeof setBoxContent>
    | ReturnType<typeof addNewBox>
    | ReturnType<typeof renameBox>
    | ReturnType<typeof removeBox>
    | ReturnType<typeof addSingleBoxToBin>
    | ReturnType<typeof logoutAction>
    | ReturnType<typeof emptyBinBoxList>
    | ReturnType<typeof retrivesingleBox>
    | ReturnType<typeof updateviewMethodsingleBox>
    | ReturnType<typeof updateviewMethodsingleBox>
    | ReturnType<typeof updateFullScreenMethodSingleBox>
    | ReturnType<typeof addnewDataToBox>
    | ReturnType<typeof moveToDatas>
    | ReturnType<typeof updateMoveToCurrentRoot>
    | ReturnType<typeof updateCurrentFileListSingleBox>
    | ReturnType<typeof removeCurrentFile>
    | ReturnType<typeof moveCurrentFile>
    | ReturnType<typeof removeCurrentFolder>
    | ReturnType<typeof moveCurrentFolder>
    | ReturnType<typeof setSearchKey>
    | ReturnType<typeof setBinSelectedBoxID>
    | ReturnType<typeof setselectedDataIDs>
    | ReturnType<typeof setAppCurrentAction>
    | ReturnType<typeof setNewBoxName>
    | ReturnType<typeof updateBoxFileViewMethod>
    | ReturnType<typeof updateBoxSortKeyType>
    | ReturnType<typeof setIsCreateFolder>
    | ReturnType<typeof setBoxListViewMethod>
    | ReturnType<typeof setNewFolderName>
    | ReturnType<typeof updateAppCurrentAction>
    | ReturnType<typeof formatAppInfo>
    | ReturnType<typeof addNewDataID>
    | ReturnType<typeof updateDataName>
    | ReturnType<typeof removeDataId>
    | ReturnType<typeof removeAttachmentID>
    | ReturnType<typeof updateAttachmentParentID>
    | ReturnType<typeof addUploadingNotificationToSingleBox>
    | ReturnType<typeof removeUploadingNotification>
    | ReturnType<typeof setGridViewMode>
    | ReturnType<typeof addImagetoBox>
    | ReturnType<typeof addStarred>
    | ReturnType<typeof removeStarred>
    | ReturnType<typeof renameTag>
    | ReturnType<typeof removeTag>
    | ReturnType<typeof addImagetoData>
    | ReturnType<typeof updateCurrentDataList>
    | ReturnType<typeof updateCurrentMoveToDataList>
    | ReturnType<typeof clearBoxNavigationTree>
    | ReturnType<typeof clearSelection>
    | ReturnType<typeof setCurrentApp>
    | ReturnType<typeof setCurrentAction>
    | ReturnType<typeof addBreadcrumbItem>
    | ReturnType<typeof setBreadCrumbList>
    | ReturnType<typeof addBoxDescription>
    | ReturnType<typeof setSelectedFolder>
    | ReturnType<typeof addFolderToView>
    | ReturnType<typeof sharedWithMe>
    | ReturnType<typeof setSelectedBox>
    | ReturnType<typeof removeTagDisableStatus>
    | ReturnType<typeof setBoxesToDisplay>
    | ReturnType<typeof updateTagDisableStatus>
    | ReturnType<typeof toggleView>
    | ReturnType<typeof setSortByType>
    | ReturnType<typeof toggleSortByDirection>
    | ReturnType<typeof changeSideBarStatus>
    | ReturnType<typeof removeNewItem>
    | ReturnType<typeof setTagsForStorage>
    | ReturnType<typeof setInvitations>
