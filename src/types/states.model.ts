import { Dispatch, SetStateAction } from "react";

export enum StateNames {
  CURRENT_SELECTION = "currentSelection",
  SNIPPET = "codeSnippet",
  LOADING = "loading",
  EDITOR_TYPE = "editorType",
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
  updateState: Dispatch<SetStateAction<any>>;
}
