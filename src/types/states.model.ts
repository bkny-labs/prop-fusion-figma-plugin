export enum StateNames {
  CURRENT_SELECTION = 'currentSelection',
  SNIPPET = 'snippet'
}

export const initialState: Record<StateNames, any> = {
  [StateNames.CURRENT_SELECTION]: null,
  [StateNames.SNIPPET]: null
};
