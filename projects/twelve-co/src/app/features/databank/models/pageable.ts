export interface Pageable<T> {
  content: T[],
  pageable: { sort: { unsorted: boolean, sorted: boolean, empty: boolean }, pageNumber: number, pageSize: number, offset: number, paged: number, unpaged: number },
  last: boolean,
  totalPages: number,
  totalElements: number,
  first: boolean,
  numberOfElements: number,
  size: number,
  number: number,
  sort: { unsorted: boolean, sorted: boolean, empty: boolean },
  empty: boolean,
}
