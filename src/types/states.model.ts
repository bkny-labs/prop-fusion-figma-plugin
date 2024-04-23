import { Dispatch, SetStateAction } from "react";

export enum StateNames {
  CURRENT_SELECTION = "currentSelection",
  SNIPPET = "codeSnippet",
}

export interface SelectionItem {
  type: string;
  name: string;
  description?: string;
  children?: SelectionItem[];
  variantGroupProperties?: Record<string, string[]>;
  defaultVariantName?: string;
}

export interface AppState {
  currentSelection: SelectionItem[];
  codeSnippet: string;
  updateState: Dispatch<SetStateAction<any>>;
}
