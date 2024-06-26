import { debounce } from 'lodash';
import { SnippetService } from '../app/services/snippet.service';
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
  _SnippetService;
  _stateService;
  constructor() {
    this._SnippetService = new SnippetService();
    this._stateService = new StateService();
    this.init();
    this.getVariantProps = debounce(this.getVariantProps.bind(this), 300);
  }

  addListeners() {
    figma.ui.onmessage = this.handleMessage.bind(this);
    figma.on('selectionchange', this.handleSelectionChange.bind(this));
  }

  async copyToClipboard(code: string) {
    console.log('do we make it here for copy?', code);
    try {
      await navigator.clipboard.writeText(code);
      parent.postMessage(
        { pluginMessage: { type: 'copy-success', message: 'Successfully copied to clipboard!' } },
        '*'
      );
      logger.info('📋📋 Copied to clipboard');
    } catch (err) {
      logger.error('⛔️⛔️ Failed to copy:', err);
      parent.postMessage({ pluginMessage: { type: 'copy-failure', message: 'Failed to copy!' } }, '*');
    }
  }

  async getVariablesByIds(ids: string[]) {
    const variables = await Promise.all(ids.map((id) => figma.variables.getVariableById(id)));
    logger.info('🔍🔍 Getting variables by id', variables);
    return variables;
  }

  async getVariableById(id: string) {
    const variable = await figma.variables.getVariableByIdAsync(id);
    // logger.info('🔍 Getting variable by id', variable);
    return variable;
  }

  async getVariantProps() {
    try {
      const selection = figma.currentPage.selection;
      for (const node of selection) {
        if (node.type === 'COMPONENT_SET') {
          const serializedNode = serializeNode(node);
  
          // Calculate variant properties first
          const variantProps = await calculateVariantProperties(serializedNode);
  
          // Then resolve bound variables
          const resolvedVariantProps = await this.resolveBoundVariables(variantProps);
  
          // Check for serializability
          const checkSerializability = (obj) => {
            try {
              JSON.stringify(obj);
              return true;
            } catch (error) {
              logger.error('Non-serializable object:', obj, error);
              return false;
            }
          };
  
          if (checkSerializability(resolvedVariantProps)) {
            // Send the variant properties to the UI
            figma.ui.postMessage({ type: 'variant-properties', variantProperties: resolvedVariantProps });
          } else {
            logger.error('Resolved variant properties are not serializable:', resolvedVariantProps);
          }
        }
      }
    } catch (error) {
      logger.error('⛔️⛔️ Error getting variant properties:', error.message, error.stack);
    }
  }

  async handleMessage(msg) {
    switch (msg.type) {
      case 'copy':
        this.copyToClipboard(msg.code);
        break;
      case 'copy-success':
      case 'copy-failure':
        this._SnippetService.handleCopyNotification(msg);
        break;
      case 'get-current-selection':
        this.handleSelectionChange();
        break;
      case 'get-variables-by-id':
        this.getVariableById(msg.id);
        break;
      case 'generate-code-snippets':
        this._SnippetService.generateSnippet(msg);
        break;
      case 'resize':
        this.resizeWindow(msg.width, msg.height);
        break;
      case 'set-config':
        this.setConfig(msg.config);
        break;
      default:
        logger.error('Unhandled message type:', msg.type);
    }
  }

  async handleSelectionChange() {
    try {
      figma.ui.postMessage({ type: 'loading-update', loading: true });

      const selections = figma.currentPage.selection;

      if (selections.length === 0) {
        // Handle the case where nothing is selected
        this._stateService.clearState(StateNames.CURRENT_SELECTION);
        this._stateService.clearState(StateNames.SNIPPET);
        figma.ui.resize(widthSmall, heightSmall);
        figma.ui.postMessage({ type: 'selection-update', selection: [] });
        return;
      }


      const currentNode = selections.map((node, index) => {
        try {
          return serializeNode(node);
        } catch (error) {
          logger.error(`Error serializing node at index ${index}:`, error.message, error.stack);
          return null;
        }
      }).filter(node => node !== null);
  
      figma.ui.postMessage({ type: 'selection-update', selection: currentNode });

      const isComponentSetSelected = selections.some((node) => node.type === 'COMPONENT_SET');
      if (!isComponentSetSelected) {
        this._stateService.setSlice(StateNames.CURRENT_SELECTION, currentNode);
        this._stateService.clearState(StateNames.SNIPPET);
        figma.ui.resize(widthSmall, heightSmall);
      } else if (selections.length === 1) {
        figma.ui.resize(widthLarge, heightLarge);

        this._stateService.setSlice(StateNames.CURRENT_SELECTION, currentNode);
        if (typeof this.getVariantProps === 'function') {
          this.getVariantProps();
        } else {
          throw new Error('getVariantProps function is not defined or not a function');
        }
        if (typeof this.setEditorType === 'function') {
          this.setEditorType(figma.editorType);
        } else {
          throw new Error('setEditorType function is not defined or not a function');
        }
      }

    } catch (error) {
      figma.ui.resize(widthSmall, heightSmall);
      logger.error('⛔️⛔️ Error handling selection change:', error);
      figma.ui.postMessage({ type: 'loading-update', loading: false });
    } finally {
      figma.ui.postMessage({ type: 'loading-update', loading: false });
    }
  }

  init() {
    figma.showUI(__html__, { themeColors: true, width: widthSmall, height: heightSmall });
    this.addListeners();
    this.setEditorType(figma.editorType);
    logger.info('🍇🍇 FigmaController initialized');
    this._stateService.setSlice(StateNames.CURRENT_SELECTION, figma.currentPage.selection.map(serializeNode));
  }

  resizeWindow = async (width: number, height: number): Promise<void> => {
    logger.log('͍͍͍⃕🏹🏹 RESIZING ON DRAG TO', width, height);
    figma.ui.resize(width, height);
  };

  // @name resolveBoundVariables
  // @params item: any, getVariablesByIds: any
  // @description Processes boundVariables
  // @returns Promise<any>
  async resolveBoundVariables(data: any) {
    const resolveVariableValue = async (boundVariable: any, targetObject: any, propertyName: string, index: number) => {
      if (typeof boundVariable !== 'object' || boundVariable === null) {
          console.error('Invalid boundVariable:', boundVariable);
          return; // Exit early if boundVariable is not an object
      }
      const variableId = boundVariable.id;
      try {
          const variable = await figma.variables.getVariableByIdAsync(variableId);
          logger.log('🔍🔍 Resolving variable:', variableId);
          targetObject[propertyName][index].color = variable.name; // Update the corresponding property directly
      } catch (error) {
          console.error('Error resolving variable:', error); // Log any errors
      }
  };
  
  const transformObject = async (obj: any) => {
      for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
              if (Array.isArray(obj[key])) {
                  for (let i = 0; i < obj[key].length; i++) {
                      await transformObject(obj[key][i]);
                  }
              } else if (typeof obj[key] === 'object') {
                  await transformObject(obj[key]); // Recursively transform nested objects
              }
              if (key === 'boundVariables' && obj[key]) {
                  for (const propertyName in obj[key]) {
                      if (obj[key].hasOwnProperty(propertyName)) {
                          const boundVariable = obj[key][propertyName];
                          await resolveVariableValue(boundVariable, obj, propertyName, 0); // Assuming there's only one item in the array
                      }
                  }
                  delete obj.boundVariables; // Remove the 'boundVariables' property after resolution
              }
          }
      }
  };
  
  
  
    await transformObject(data);

    
    this._stateService.setSlice(StateNames.VARIANT_PROPERTIES, data);
    console.log('variant properties', this._stateService.getValue(StateNames.VARIANT_PROPERTIES));

    return data;
  }

  setEditorType(editorType: string) {
    figma.ui.postMessage({ type: 'editor-type', editor: editorType });
    // this._stateService.setSlice(StateNames.EDITOR_TYPE, editorType);
  }

  setConfig(config: any) {
    const selections = figma.currentPage.selection;
    const transformedSelections = selections.map((node) => {
      const serializedNode = serializeNode(node);
      return {
        ...serializedNode,
        config: {
          framework: config.framework || 'react',
          typescript: config.typescript || true,
          styles: config.styles || 'css',
        },
      };
    });
    console.log('🔧🔧 Configured: ', transformedSelections);
  }
}

export const figmaController = new FigmaController();
