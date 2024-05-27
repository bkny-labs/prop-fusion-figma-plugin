import { BehaviorSubject } from 'rxjs';
import { StateNames } from '../../types/states.model';
import { logger } from '../utils/logger';

export class StateService {
  private state: { [key in StateNames]?: BehaviorSubject<any> } = {};

  constructor() {
    const initialState = { 
      [StateNames.CURRENT_SELECTION]: [], 
      [StateNames.SNIPPET]: '', 
      [StateNames.LOADING]: false, 
      [StateNames.EDITOR_TYPE]: 'figma',
      [StateNames.VARIANT_PROPERTIES]: {}
    }
    for (const key in initialState) {
      this.state[key] = new BehaviorSubject(initialState[key]);
    }
  }

  public getObservable(key: StateNames) {
    return this.state[key];
  }

  public getState() {
    const stateValues: any = {};
    for (const key in this.state) {
      stateValues[key] = this.state[key]?.getValue();
    }
    return stateValues;
  }

  public getValue(key: StateNames) {
    return this.state[key]?.getValue();
  }

  public setSlice(key: StateNames, value: any) {
    if (!this.state[key]) {
      this.state[key] = new BehaviorSubject(value);
    } else {
      this.state[key].next(value);
    }
    figma.ui.postMessage({ type: 'state-update', key, value });
  }  
}

export const stateService = new StateService();