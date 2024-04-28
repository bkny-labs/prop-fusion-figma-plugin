import { debounce } from 'lodash';
import { GeminiService } from '../app/services/gemini.service';
import { MessageService } from '../app/services/message.service';
import { StateService } from '../app/services/state.service';
import { calculateVariantProperties } from '../app/utils/component-prop-diff';
import { serializeNode } from '../app/utils/serializer';
import { StateNames } from '../types/states.model';
import { logger } from '../app/utils/logger';

export const widthLarge = 650;
export const heightLarge = 650;
export const widthSmall = 400;
export const heightSmall = 360;

class FigmaController {
  _messageService;
  _stateService;
  _geminiService;
  constructor() {
    this._messageService = new MessageService();
    this._stateService = new StateService();
    this._geminiService = new GeminiService();
    this.init();
    this.getVariantProps = debounce(this.getVariantProps.bind(this), 300);
  }

  addListeners() {
    figma.ui.onmessage = this.handleMessage.bind(this);
    figma.on('selectionchange', this.handleSelectionChange.bind(this));
  }

  async copyToClipboard(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      parent.postMessage({ pluginMessage: { type: 'copy-success', message: 'Successfully copied to clipboard!' } }, '*');
      logger.info('📋📋 Copied to clipboard');
    } catch (err) {
      logger.error('⛔️⛔️ Failed to copy:', err);
      parent.postMessage({ pluginMessage: { type: 'copy-failure', message: 'Failed to copy!' } }, '*');
    }
  }

  getVariantProps() {
    try {
      const selection = figma.currentPage.selection;
      selection.forEach(node => {
        if (node.type === 'COMPONENT_SET') {
          const serializedNode = serializeNode(node);
          let variantProps = calculateVariantProperties(serializedNode);
          figma.ui.postMessage({ type: 'variant-properties', variantProperties: variantProps });
        }
      });

    } catch (error) {
      logger.error('⛔️⛔️ Error getting variant properties:', error);
    }
  }

  async handleMessage(msg) {
    switch (msg.type) {
      case 'copy':
        this.copyToClipboard(msg.code);
        break;
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
            logger.log('🦄🦄 Gemini response:', responseText);
          })
          .catch(error => {
            logger.error('🦄🦄 Error sending prompt to Gemini:', error);
          });
        break;
      default:
        logger.error('Unhandled message type:', msg.type);
    }
  }

  async handleSelectionChange() {
    try {
      figma.ui.postMessage({ type: 'loading-update', loading: true });

      const selections = figma.currentPage.selection;
      const currentNode = selections.map(serializeNode);
      figma.ui.postMessage({ type: 'selection-update', selection: currentNode });

      const isComponentSetSelected = selections.some(node => node.type === 'COMPONENT_SET');
      if (!isComponentSetSelected) {
        this._stateService.setSlice(StateNames.CURRENT_SELECTION, currentNode);
        this._stateService.clearState(StateNames.SNIPPET);
        figma.ui.resize(widthSmall, heightSmall);
      } else if(selections.length === 1) {
        figma.ui.resize(widthLarge, heightLarge);
      }

      this._stateService.setSlice(StateNames.CURRENT_SELECTION, currentNode);

      this.setEditorType(figma.editorType);
      this.getVariantProps();
    } catch (error) {
      logger.error('⛔️⛔️ Error handling selection change:', error);
      figma.ui.postMessage({ type: 'loading-update', loading: false });
    } finally {
      figma.ui.postMessage({ type: 'loading-update', loading: false });
    }
  }

  init() {
    figma.showUI(__html__, { themeColors: true, width: widthSmall, height: heightSmall });
    this.addListeners();
    logger.info('🍇🍇 FigmaController initialized');
    this._stateService.setSlice(StateNames.CURRENT_SELECTION, figma.currentPage.selection.map(serializeNode));
  }

  resizeWindow = async (width: number, height: number): Promise<void> => {
    logger.log('͍͍͍⃕🏹🏹 THE WINDOW SHOULD BE RESIZING ON DRAG TO', width, height);
    figma.ui.resize(width, height);
  };

  setEditorType(editorType: string) {
    this._stateService.setSlice(StateNames.EDITOR_TYPE, editorType);
    figma.ui.postMessage({ type: 'editor-type', editor: editorType });
  }

}

export const figmaController = new FigmaController();
