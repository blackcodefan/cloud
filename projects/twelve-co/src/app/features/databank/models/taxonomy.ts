import { ItemDetails } from 'core-lib';
import { BreadCrumbElement } from './breadcrumb.interfaces';

export interface Taxonomy {
  breadcrumbs: Array<BreadCrumbElement>;
  parent: ItemDetails;
}
