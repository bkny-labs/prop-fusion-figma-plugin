import { rgbToHex } from './rgba-to-hex';

// @name serializeNode
// @params node: any, depth: number, getVariablesByIds: any
// @description Serializes a node
// @returns Promise<any>
export function serializeNode(node, depth = 0) {
  const componentSet = node.type === 'COMPONENT_SET' && depth === 0;
  const componentPropertyDefinitionNames = componentSet && node.componentPropertyDefinitions ? Object.keys(node.componentPropertyDefinitions) : [];
  const variantGroupPropertyNames = componentSet && node.variantGroupProperties ? Object.keys(node.variantGroupProperties) : [];
  const componentPropertyDefinitions = {};
  const variantGroupProperties = {};
  let serializedChildren = [];

  if (componentSet) {
    componentPropertyDefinitionNames.forEach(name => {
      const { type, defaultValue, variantOptions } = node.componentPropertyDefinitions[name];
      componentPropertyDefinitions[name] = {
        type,
        defaultValue,
        variantOptions: variantOptions || []
      };
    });

    if (node.children) {
      serializedChildren = node.children.map(child => {
        // Ignore the child's children
        const { children, ...childWithoutChildren } = child;

        return { 
          ...childWithoutChildren, 
          // id: child.id,
          type: child.type,
          name: child.name,
          // devStatus: child.devStatus,
          props: {
            opacity: child.opacity,
            // backgrounds: Array.isArray(child.backgrounds) ? Promise.all(child.backgrounds.map(processBoundVariables)) : [],
            backgrounds: Array.isArray(child.backgrounds) ? child.backgrounds.map(background => ({
              type: background.type, 
              visible: background.visible,
              opacity: background.opacity,
              blendMode: background.blendMode,
              // color: rgbToHex(background.color.r, background.color.g, background.color.b),
              boundVariables: background.boundVariables,
            })) : [],
            blendMode: child.blendMode,
            maskType: child.maskType,
            width: child.width,
            height: child.height,
            rotation: child.rotation,
            minWidth: child.minWidth,
            maxWidth: child.maxWidth,
            minHeight: child.minHeight,
            maxHeight: child.maxHeight,
            // fills: child.fills ? Promise.all(child.fills.map(fill => processBoundVariables(fill))) : [],
            fills: child.fills ? child.fills.map(fill => ({
              type: fill.type, 
              visible: fill.visible,
              opacity: fill.opacity,
              blendMode: fill.blendMode,
              // color: rgbToHex(fill.color.r, fill.color.g, fill.color.b),
              boundVariables: fill.boundVariables,
            })) : [],
            strokes: child.strokes ? child.strokes.map(stroke => ({
              type: stroke.type, 
              visible: stroke.visible,
              opacity: stroke.opacity,
              blendMode: stroke.blendMode,
              // color: rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b),
              boundVariables: stroke.boundVariables,
            })) : [],
            strokeWeight: child.strokeWeight,
            strokeAlign: child.strokeAlign,
            strokeJoin: child.strokeJoin,
            dashPattern: child.dashPattern,
            strokeCap: child.strokeCap,
            strokeMiterLimit: child.strokeMiterLimit,
            // fillGeometry: child.fillGeometry,
            // strokeGeometry: child.strokeGeometry,
            // cornerSmoothing: child.cornerSmoothing,
            borderRadius: {
              all: child.cornerRadius,
              topLeft: child.topLeftRadius,
              topRight: child.topRightRadius,
              bottomLeft: child.bottomLeftRadius,
              bottomRight: child.bottomRightRadius,
            },
            padding: {
              left: child.paddingLeft,
              right: child.paddingRight,
              top: child.paddingTop,
              bottom: child.paddingBottom,
            },
            primaryAxisAlignItems: child.primaryAxisAlignItems,
            counterAxisAlignItems: child.counterAxisAlignItems,
            primaryAxisSizingMode: child.primaryAxisSizingMode,
            // layoutWrap: child.layoutWrap,
            counterAxisSpacing: child.counterAxisSpacing,
            counterAxisAlignContent: child.counterAxisAlignContent,
            strokeTopWeight: child.strokeTopWeight,
            strokeBottomWeight: child.strokeBottomWeight,
            strokeLeftWeight: child.strokeLeftWeight,
            strokeRightWeight: child.strokeRightWeight,
            expanded: child.expanded,
            constraints: child.constraints,
            layoutMode: child.layoutMode,
            counterAxisSizingMode: child.counterAxisSizingMode,
            itemSpacing: child.itemSpacing,
            overflowDirection: child.overflowDirection,
            // numberOfFixedChildren: child.numberOfFixedChildren,
            overlayPositionType: child.overlayPositionType,
            overlayBackground: child.overlayBackground,
            overlayBackgroundInteraction: child.overlayBackgroundInteraction,
            // itemReverseZIndex: child.itemReverseZIndex,
            // strokesIncludedInLayout: child.strokesIncludedInLayout,
          }
        };
      });
    }

    if (node.variantGroupProperties) {
      variantGroupPropertyNames.forEach(name => {
        variantGroupProperties[name] = {
          values: node.variantGroupProperties[name].values || []
        };
      });
    }
  }

  return {
    id: node.id,
    type: node.type,
    name: node.name,
    description: node.description,
    link: node.documentationLinks ? node.documentationLinks[0]?.uri : null,
    defaultVariantName: node.defaultVariant ? node.defaultVariant.name : null,
    componentPropertyDefinitions: componentSet ? componentPropertyDefinitions : {},
    children: serializedChildren,
    variantGroupProperties: componentSet && depth < 1 ? variantGroupProperties : {},  }
}