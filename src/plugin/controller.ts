import { handleResize, handleCopyNotification, generateSnippet } from "../app/services/message.service";
import { stateService } from "../app/services/state.service";
import { serializeNode } from "../app/utils/serializer";
import { StateNames } from "../types/states.model";

export const currentNode = figma.currentPage.selection;

figma.showUI(__html__, { themeColors: true, width: 480, height: 350 });

figma.ui.onmessage = (msg) => {
  if (msg.type.startsWith('copy')) {
    handleCopyNotification(msg);
  } else if (msg.type === 'resize') {
    handleResize(msg);
  } else if (msg.type === 'generate-code-snippets') {
    generateSnippet(msg);
  }
};

figma.on('selectionchange', () => {
  const currentNode = figma.currentPage.selection.map(serializeNode);
  figma.ui.postMessage({ type: 'selection-update', selection: currentNode });

  const isComponentSetSelected = figma.currentPage.selection.some(node => node.type === 'COMPONENT_SET');
  figma.ui.resize(480, isComponentSetSelected ? 500 : 350);

  if (!isComponentSetSelected) {
    stateService.clearState(StateNames.SNIPPET);
  }

  stateService.setState(StateNames.CURRENT_SELECTION, currentNode);
});


figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case 'copy-success':
    case 'copy-failure':
      handleCopyNotification(msg);
      break;
    case 'resize':
      handleResize(msg);
      break;
    case 'generate-code-snippets':
      generateSnippet(msg);
      break;
    default:
      console.error("Unhandled message type:", msg.type);
  }
};