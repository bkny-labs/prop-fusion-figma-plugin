import { Dispatch } from "react";

interface SetSliceAction<T> {
  type: 'SET_SLICE';
  payload: T;
}

export enum StateNames {
  CURRENT_SELECTION = "currentSelection",
  SNIPPET = "codeSnippet",
  LOADING = "loading",
  EDITOR_TYPE = "editorType",
  VARIANT_PROPERTIES = "variantProperties",
}

export interface SelectionItem {
  type: string;
  name: string;
  description?: string;
  children?: SelectionItem[];
  componentPropertyDefinitions?: ComponentPropertyDefinitions;
  defaultVariantName?: string;
}

export interface AppState {
  currentSelection: SelectionItem[];
  codeSnippet: string;
  updateState: Dispatch<SetSliceAction<any>>;
}
