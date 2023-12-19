import { Action, createReducer, on } from '@ngrx/store';
import { FolderTreeContentDto, ItemDetails } from 'core-lib';
import { setSelectedAccount } from '../../../store';
import { FileElement } from '../models';
import {
    addBoxDescription,
    addBreadcrumbItem,
    addFileToView,
    addFolderToView,
    addImagetoData,
    addNewBox,
    clearBoxNavigationTree,
    deleteFolderFromView,
    deselectBox,
    logoutAction,
    removeBox,
    removeDataId,
    removeFileFromFolder,
    removeFoldersOrFiles,
    removeTempBox,
    renameBox,
    renameItem,
    setBoxContent,
    setBoxesToDisplay,
    setBoxList,
    setBreadCrumbList,
    setCurrentAction,
    setCurrentPreviewType,
    setGridViewMode,
    setIsBoxPreview,
    setIsNewBoxStatus,
    setNewBoxName,
    setNewFolderStatus,
    setSearchKey,
    setSelectedBox,
    setSelectedBoxById,
    setSelectedFile,
    setSelectedFolder,
    setSelectedStorage,
    setSortByType,
    sharedWithMe,
    toggleSortByDirection,
    toggleView,
    updateBoxCoverImage,
    updateBoxDescription,
    updateMoveToCurrentRoot,
} from './databank.actions';

import { DatabankInitialState, DatabankState } from './databank.state';

// @ts-ignore
const databankReducer = createReducer(DatabankInitialState,
    on(setBoxList, (state: DatabankState, { boxsList }) => Object.assign({}, { ...state }, { boxes: boxsList })),
    on(addNewBox, (state, { singleBoxItem }) => {
        return Object.assign({}, state, { boxes: [ ...state.boxes, singleBoxItem ] });
    }),
    on(renameBox, (state, { boxId, boxName }) => {
        const boxes = state.boxes.map(box => {
            if (box.itemId == boxId) {
                return Object.assign({}, { ...box }, { name: boxName });
            } else {
                return box;
            }
        });
        return Object.assign({}, { ...state }, { boxes: boxes });
    }),
    on(removeBox, (state, { boxId }) => ({ ...state, boxes: state.boxes.filter(item => item.itemId !== boxId) })),
    //@ts-ignore
    on(deselectBox, (state) => ({ ...state, selectedBoxId: '', selectedBox: null })),
    on(addFileToView, (state: DatabankState, { folderId, file }) => {
        const flders = state.boxContent.map((flder: FolderTreeContentDto) => {
            if (flder.itemId === folderId) {
                const contents = flder.contents || [];
                return Object.assign({}, flder, { contents: [ ...contents, file ] });
            } else {
                return flder;
            }
        });
        return Object.assign({}, state, { boxContent: flders });
    }),
    on(setSelectedBox, (state, { selectedBox }) => ({ ...state, selectedBox: selectedBox })),
    //@ts-ignore
    on(setSelectedBoxById, (state, { selectedBox }) => ({ ...state, selectedBox: state.boxes.find(b => b.itemId === selectedBox) })),
    on(setSortByType, (state, { sortyByType }) => ({ ...state, sortByType: sortyByType })),
    on(clearBoxNavigationTree, (state: DatabankState) => (Object.assign({}, state, { breadcrumb: [] }))),
    on(removeFileFromFolder, (state: DatabankState, { folderId, fileId }) => {
        const folderContent = state.boxContent.map(fc => {
            if (fc.itemId === folderId) {
                const files = fc.contents.filter(f => f.itemId !== fileId);
                return Object.assign({}, fc, { contents: files });
            } else {
                return fc;
            }
        });
        return Object.assign({}, state, { boxContent: folderContent });
    }),
    on(setSelectedFile, (state: DatabankState, { selectedFile }) => (Object.assign({}, state, { selectedFile }))),
    on(removeDataId, (state: DatabankState, { fileIds }) => (Object.assign({}, state, { folders: state.boxContent.filter(f => fileIds.indexOf(f.itemId) !== -1) }))),
    on(toggleSortByDirection, (state) => {
        return Object.assign({}, state, { sortByDirection: state.sortByDirection === 'ascending' ? 'descending' : 'ascending' });
    }),
    on(updateBoxDescription, (state, { description, boxId }) => {
        const boxes = state.boxes.map(bx => {
            if (bx.itemId === boxId) {
                return Object.assign({}, bx, { description });
            }
            return bx;
        });

        console.log('**** box list: ', boxes);
        return Object.assign({}, state, { boxes: boxes });
    }),
    on(updateBoxCoverImage, (state, { coverPhotoId, boxId }) => {
        const boxes = state.boxes.map(bx => {
            if (bx.itemId === boxId) {
                return Object.assign({}, bx, { coverPhotoId });
            }
            return bx;
        });

        console.log('**** box list: ', boxes);
        return Object.assign({}, state, { boxes: boxes });
    }),
    on(logoutAction, (state) => DatabankInitialState),
    on(setSearchKey, (state, { searchKey }) => {
        return Object.assign({}, state, { appInfo: { searchKey: searchKey } });
    }),
    on(toggleView, (state: DatabankState) => Object.assign({}, state, { gridView: !state.gridView })),
    on(setSelectedFolder, (state: DatabankState, { selectedFolder }) => ({ ...state, selectedFolder })),
    on(removeFoldersOrFiles, (state: DatabankState, { itemIds }) => ({ ...state, folders: state.boxContent.filter(el => itemIds.indexOf(el.itemId) === -1) })),
    on(setNewBoxName, (state: DatabankState, { boxId, boxName }) => {
        const boxes = state.boxes.map(b => {
            if (b.itemId === boxId) {
                return ({ ...b, name: boxName });
            } else {
                return b;
            }
        });
        return Object.assign({}, state, { boxes });
    }),
    on(removeTempBox, (state) => ({ ...state, boxes: state.boxes.filter(b => b.itemId !== 'new-box-id') })),
    on(setSelectedAccount, (state: DatabankState, action) => ({ ...state, selectedAccount: action.selectedAccount })),
    on(addBreadcrumbItem, (state: DatabankState, { breadCrumbItem }) => ({ ...state, breadcrumb: [ ...state.breadcrumb, breadCrumbItem ] })),
    on(setBreadCrumbList, (state: DatabankState, { breadCrumbList }) => ({ ...state, breadcrumb: breadCrumbList })),
    on(setSelectedStorage, (state: DatabankState, { selectedStorage }) => ({ ...state, selectedFolderId: selectedStorage.itemId, selectedStorage: selectedStorage })),
    on(addFolderToView, (state: DatabankState, { folder, boxId }) => {
            const existing = state.boxContent.filter(x => x.name === folder.name).length > 0;
            if (existing) {
                const flders = state.boxContent.map(ex => {
                    if (ex.name === folder.name) {
                        return folder;
                    } else {
                        return ex;
                    }
                });
                return Object.assign({}, state, { boxContent: flders });
            } else {
                const folders = [ ...state.boxContent, folder ];
                return Object.assign({}, state, { boxContent: folders });
            }
        },
    ),
    on(deleteFolderFromView, (state: DatabankState, { folderId, boxId }) => {
            const boxContent = state.boxContent.filter(bc => bc.itemId !== folderId);
            return Object.assign({}, state, { boxContent });
        },
    ),
    on(renameItem, (state: DatabankState, { itemId, item }) => {
        const folders = state.boxContent.map(f => {
            if (itemId === f.itemId) {
                return item;
            } else {
                return f;
            }
        });
        return Object.assign({}, { ...state }, { folders });
    }),
    on(updateMoveToCurrentRoot, (state, { boxId, currentMoveToRoot, currentMoveToPath }) => {
        const boxes = state.boxes.map(box => {
            if (box.itemId == boxId) {
                return Object.assign({}, { ...box }, { moveTocurrentRoot: currentMoveToRoot, moveTocurrentPath: currentMoveToPath });
            }
            return box;
        });
        return Object.assign({}, { ...state }, { boxes });
    }),
    on(addBoxDescription, (state, { boxId, description }) => {
        const boxes = state.boxes.map(box => {
            if (box.itemId === boxId) {
                return Object.assign({}, box, { description });
            } else {
                return box;
            }

        });
        return Object.assign({}, state, { boxes });
    }),
    on(setGridViewMode, (state, { gridView }) => Object.assign({}, state, { gridView })),
    on(setCurrentAction, (state, { currentAction }) => Object.assign({}, state, { currentAction })),
    on(sharedWithMe, (state, { sharedWithMe }) => Object.assign({}, state, { sharedWithMe })),
    on(setBoxesToDisplay, (state, { boxesToDisplay }) => Object.assign({}, state, { boxesToDisplay })),
    on(addImagetoData, (state, { itemId, coverPhotoId }) => {
        const folders = state.boxContent.map((f: ItemDetails) => {
            if (f.itemId == itemId) {
                return Object.assign({}, f, { coverPhotoId });
            } else {
                return f;
            }
        });
        return Object.assign({}, state, { folders });
    }),
    on(setNewFolderStatus, (state, { folderStatus }) => Object.assign({}, state, { newFolderStatus: folderStatus })),
    on(setBoxContent, (state, { boxContent }) => Object.assign({}, state, { boxContent })),
    on(setIsNewBoxStatus, (state, { isNewBox }) => Object.assign({}, state, { newBoxStatus: isNewBox })),
    on(setIsBoxPreview, (state, { isPreview }) => Object.assign({}, state, { boxPreview: isPreview })),
    on(setCurrentPreviewType, (state, { previewType }) => Object.assign({}, state, { currentPreviewType: previewType })),
);

export function databankReducers(state: DatabankState | undefined, action: Action) {
    return databankReducer(state, action);
}


export function clone(element: FileElement) {
    return JSON.parse(JSON.stringify(element));
}

export function bytesToSize(bytes: any) {
    const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB' ];
    if (bytes === 0) return 'n/a';
    const i = parseInt((Math.floor(Math.log(bytes) / Math.log(1024)).toString()), 10);
    if (i === 0) return `${ bytes } ${ sizes[i] }`;
    return `${ (bytes / (1024 ** i)).toFixed(1) } ${ sizes[i] }`;
}
