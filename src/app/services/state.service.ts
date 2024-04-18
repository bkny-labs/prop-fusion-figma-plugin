// state.service.ts
import { BehaviorSubject, Observable } from 'rxjs';
import { StateNames } from '../../types/states.model';

class StateService {
    private statesSubject: BehaviorSubject<Record<StateNames, any>>;
    public states$: Observable<Record<StateNames, any>>;

    constructor() {
      const initialState = { [StateNames.CURRENT_SELECTION]: [], [StateNames.SNIPPET]: '' };
      this.statesSubject = new BehaviorSubject(initialState);
    }

    getState(name: StateNames): any[] {
      const rawValue = this.statesSubject.value[name];
      console.log("🍌🍌 Get state: ", name, rawValue);
      
      if (Array.isArray(rawValue)) {
        return [...rawValue];
      } else if (rawValue !== null && typeof rawValue === 'object') {
        return Object.entries(rawValue);
      } else if (rawValue !== null && rawValue !== undefined) {
        return [rawValue];
      } else {
        return []; // Return an empty array if the value is undefined or null to prevent type errors in React state
      }
    }

    setState(name: StateNames, value: any): void {
      let iterableValue = [];
      if (Array.isArray(value)) {
        iterableValue = [...value];
      } else if (value !== null && typeof value === 'object') {
        // If it's an object and you expect to handle it as key-value pairs in arrays:
        iterableValue = Object.entries(value);
      } else if (value !== null && value !== undefined) {
        // If it's a single scalar value that should still be placed in an array:
        iterableValue = [value];
      }
      const newState = { ...this.statesSubject.value, [name]: iterableValue };
      this.statesSubject.next(newState);
      console.log("🍌🍌 Update state: ", newState);
    }
    
    clearState(name: StateNames): void {
        this.setState(name, null);
        console.log("🍌🍌 Cleared state: ", name);
    }

    getObservable(): Observable<Record<StateNames, any>> {
        return this.statesSubject.asObservable();
    }
}

export const stateService = new StateService();
