import { Pipe, PipeTransform } from '@angular/core';
import { ItemDetails } from 'core-lib';
import { SortByEnum } from '../models/enums';

@Pipe({
    name: 'sortByBoxes',
})
export class SortByBoxesPipe implements PipeTransform {

    transform(boxs: Array<ItemDetails>, key: SortByEnum, direction: 'ascending' | 'descending'): Array<ItemDetails> {
        console.log('sortByKey ', key);
        console.log('sortByDirection', direction);
        let boxes = [ ...boxs ];
        switch (key) {
            case SortByEnum.OWNER_NAME:
                this.sortByOwner(boxes);
                break;
            case SortByEnum.ACTION_COUNT:
                this.sortByActionsCount(boxes);
                break;
            case SortByEnum.LAST_ACCESS:
                this.sortByLastAccess(boxes);
                break;
            case SortByEnum.CREATION_DATE:
                this.sortByCreation(boxes);
                break;
            case SortByEnum.MEMBERS_COUNT:
                this.sortByMembersCount(boxes);
                break;

            case SortByEnum.BOX_NAME:
            default:
                this.sortByBoxName(boxes);
                break;
        }
        if (direction !== 'ascending') {
            return boxes.reverse();
        }
        return boxes;
    }

    sortByMembersCount(boxes: Array<ItemDetails>) {
        boxes.sort((a, b) => {
            if (a.members.length > b.members.length) {
                return 1;
            }
            if (a.members.length < b.members.length) {
                return -1;
            }
            return 0;
        });
    }

    sortByActionsCount(boxes: Array<ItemDetails>) {
        boxes.sort((a, b) => {
            if (a.actions > b.actions) {
                return 1;
            }
            if (a.actions < b.actions) {
                return -1;
            }
            return 0;
        });
    }

    sortByLastAccess(boxes: Array<ItemDetails>) {
        boxes.sort((a, b) => {
            if (a.lastAccess > b.lastAccess) {
                return 1;
            }
            if (a.lastAccess < b.lastAccess) {
                return -1;
            }
            return 0;
        });
    }

    sortByCreation(boxes: Array<ItemDetails>) {
        boxes.sort((a, b) => {
            if (a.creation > b.creation) {
                return 1;
            }
            if (a.creation < b.creation) {
                return -1;
            }
            return 0;
        });
    }

    sortByOwner(boxes: Array<ItemDetails>) {
        boxes.sort((a, b) => {
            if (a.owner?.toLowerCase() > b.owner?.toLowerCase()) {
                return 1;
            }
            if (a.owner?.toLowerCase() < b.owner?.toLowerCase()) {
                return -1;
            }
            return 0;
        });
    }

    sortByBoxName(boxes: Array<ItemDetails>) {
        boxes.sort((a, b) => {
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
            }
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
            }
            return 0;
        });

    }


}
