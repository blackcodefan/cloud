import { Action, ActionReducer } from '@ngrx/store';
import { merge } from 'lodash-es';
import { SessionStorageService } from './services';

export function storageMetaReducer<S, A extends Action = Action>(localStorageKey: string, storageService: SessionStorageService) {
  let onInit = true; // after load/refresh…
  return (reducer: ActionReducer<S, A>) => {
    return (state: S, action: A): S => {
      // get to the nextState.
      const nextState = reducer(state, action);
      // init the application state.
      if (onInit) {
        onInit = false;
        const savedState = storageService.getSavedState(localStorageKey);
        return merge(nextState, savedState);
      }
      // save the next state to the application storage.
      storageService.setSavedState(nextState, localStorageKey);
      return nextState;
    };
  };
}
