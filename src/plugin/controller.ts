import { GeminiService } from '../app/services/gemini.service';
import { MessageService } from '../app/services/message.service';
import { StateService } from '../app/services/state.service';
import { serializeNode } from '../app/utils/serializer';
import { StateNames } from '../types/states.model';

export const widthLarge = 600;
export const heightLarge = 650;
export const widthSmall = 480;
export const heightSmall = 350;

class FigmaController {
  _messageService;
  _stateService;
  _geminiService;
  constructor() {
    this._messageService = new MessageService();
    this._stateService = new StateService();
    this._geminiService = new GeminiService();
    this.init();
    console.log("🍇🍇 FigmaController initialized");
    this._stateService.setState(StateNames.CURRENT_SELECTION, figma.currentPage.selection.map(serializeNode));
  }

  addListeners() {
    figma.ui.onmessage = this.handleMessage.bind(this);
    figma.on('selectionchange', this.handleSelectionChange.bind(this));
  }

  init() {
    figma.showUI(__html__, { themeColors: true, width: widthSmall, height: heightSmall });
    this.addListeners();
  }

  async handleMessage(msg) {
    switch (msg.type) {
      case 'copy-success':
      case 'copy-failure':
        this._messageService.handleCopyNotification(msg);
        break;
      case 'resize':
        this.resizeWindow(msg.width, msg.height);
        break;
      case 'get-current-selection':
        this.handleSelectionChange();
        break;
      case 'generate-code-snippets':
        this._messageService.generateSnippet(msg);
        break;
      case 'send-prompt-to-gemini':
        this._geminiService.sendPromptToGemini(msg.prompt)
          .then(responseText => {
            console.log('🍇🍇 Gemini response:', responseText);
            // Now you can use responseText
          })
          .catch(error => {
            console.error('Error sending prompt to Gemini:', error);
          });
        break;
      default:
        console.error('Unhandled message type:', msg.type);
    }
  }

  handleSelectionChange() {
    const selections = figma.currentPage.selection;
    const currentNode = selections.map(serializeNode);
    figma.ui.postMessage({ type: 'selection-update', selection: currentNode });
    figma.ui.postMessage({ type: 'send-prompt-to-gemini', prompt: 'Create a component out of these variant property groups: Variant, Size' });

    const isComponentSetSelected = selections.some(node => node.type === 'COMPONENT_SET');
    if (!isComponentSetSelected) {
      this._stateService.setState(StateNames.CURRENT_SELECTION, currentNode); // Set current node even if it's not a component set
      this._stateService.clearState(StateNames.SNIPPET);
      figma.ui.resize(widthSmall, heightSmall);
    } else {
      figma.ui.resize(widthLarge, heightLarge);
    }

    this._stateService.setState(StateNames.CURRENT_SELECTION, currentNode);
  }

  getCurrentSelection() {
    const selections = figma.currentPage.selection;
    const currentNode = selections.map(serializeNode);
    figma.ui.postMessage({ type: 'selection-update', selection: currentNode });
  }

  resizeWindow = async (width: number, height: number): Promise<void> => {
    console.log('THE WINDOW SHOULD BE RESIZING ON DRAG TO', width, height);
    figma.ui.resize(width, height);
  };
}

export const figmaController = new FigmaController();
