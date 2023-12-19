import { FolderTreeContentDto, ItemDetails } from 'core-lib';
import { BreadCrumbElement, CurrentDatabankAppEnum, FilterBoxKeyEnum, SortByEnum } from '../models';

export interface DatabankState {
    moduleName: string;
    currentAppInModule: CurrentDatabankAppEnum;
    boxes: Array<ItemDetails>,
    appInfo: AppInfo,
    breadcrumb: Array<BreadCrumbElement>,
    selectedFolderId: string,
    selectedStorage: ItemDetails,
    currentAction: string,
    selectedBox: ItemDetails,
    selectedFile: ItemDetails,
    selectedFolder: ItemDetails,
    boxContent: Array<FolderTreeContentDto>
    newBoxStatus: boolean;
    newFolderStatus: boolean;
    boxPreview: boolean;
    currentPreviewType: string; // box/folder/details
    gridView: boolean;
    searchKey: string;
    sortByType: SortByEnum,
    boxesToDisplay: FilterBoxKeyEnum;
    sortByDirection: 'ascending' | 'descending'
}


export const DatabankInitialState: DatabankState = {
    //@ts-ignore
    appInfo: {},
    boxes: new Array<ItemDetails>(),
    moduleName: 'databank',
    currentAppInModule: CurrentDatabankAppEnum.FILES,
    //@ts-ignore
    selectedFolderId: null,
    //@ts-ignore
    selectedStorage: null,
    //@ts-ignore
    selectedFolder: null,
    //@ts-ignore
    selectedFile: null,
    breadcrumb: [],
    currentAction: 'AllBoxList',
    gridView: true,
    //@ts-ignore
    selectedBox: null,
    newBoxStatus: false,
    newFolderStatus: false,
    boxPreview: false,
    currentPreviewType: '',
    boxesToDisplay: FilterBoxKeyEnum.ALL_BOXES,
    sortByType: SortByEnum.LAST_ACCESS,
    sortByDirection: 'descending',
};


export interface AppInfo {
    selectedBoxID: string;
    selectedDataIDs: Array<string>;
    selectedMoveToBoxID: string;
    selectedMoveToFolderID: string;
    searchKey: string;
    currentAction: 'None' | 'CreateNewBox' | 'RenameBox' | 'Bin' | 'Members' | 'Activity' | 'Tag' | 'Search' | 'SortBy';
    isCreateFolder: boolean;
    newBoxName: string;
    newFolderName: string;
    boxListViewMethod: boolean;
    binBoxList: Array<ItemDetails>,
    tagList: Array<string>,
    selectedBinBoxID: string;
}

