import { BehaviorSubject, Observable } from 'rxjs';
import { StateNames } from '../../types/states.model';

export class StateService {
  private statesSubject: BehaviorSubject<Record<StateNames, any>>;
  public states$: Observable<Record<StateNames, any>>;

  constructor() {
    const appState = { [StateNames.CURRENT_SELECTION]: [], [StateNames.SNIPPET]: '', [StateNames.LOADING]: false, [StateNames.EDITOR_TYPE]: 'figma'};
    this.statesSubject = new BehaviorSubject(appState);
  }

  getState(name: StateNames): any {
    return this.statesSubject.value[name];
  }

  setState(name: StateNames, value: any): void {
    const newState = { ...this.statesSubject.value, [name]: value };
    this.statesSubject.next(newState);
    console.log("🍌🍌 Set state:", name, value);
  }

  clearState(name: StateNames): void {
    this.setState(name, name === StateNames.CURRENT_SELECTION ? [] : '');
  }

  getObservable(): Observable<Record<StateNames, any>> {
    return this.statesSubject.asObservable();
  }
}

export const stateService = new StateService();