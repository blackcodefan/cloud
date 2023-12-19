import { Injectable } from '@angular/core';

@Injectable()
export class SessionStorageService {

  constructor() {
  }

  getSavedState(localStorageKey: string): any {
    const item = sessionStorage.getItem(localStorageKey);
    return item ? JSON.parse(item) : {};
  }

  setSavedState(stateToSave: any, localStorageKey: string) {
    sessionStorage.setItem(localStorageKey, JSON.stringify(stateToSave));
  }
}
