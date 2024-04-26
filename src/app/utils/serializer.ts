export function serializeNode(node, depth = 0): any {
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
        return { ...childWithoutChildren, 
          id: child.id,
          type: child.type,
          name: child.name,
          devStatus: child.devStatus,
          props: {
            opacity: child.opacity,
            backgrounds: child.backgrounds ? child.backgrounds.map(background => ({
              type: background.type, 
              visible: background.visible,
              opacity: background.opacity,
              blendMode: background.blendMode,
              color: background.color,
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
            fills: child.fills ? child.fills.map(fill => ({
              type: fill.type, 
              visible: fill.visible,
              opacity: fill.opacity,
              blendMode: fill.blendMode,
              color: fill.color,
              boundVariables: fill.boundVariables,
            })) : [],
            strokes: child.strokes ? child.strokes.map(stroke => ({
              type: stroke.type, 
              visible: stroke.visible,
              opacity: stroke.opacity,
              blendMode: stroke.blendMode,
              color: stroke.color,
              boundVariables: stroke.boundVariables,
            })) : [],
            strokeWeight: child.strokeWeight,
            strokeAlign: child.strokeAlign,
            strokeJoin: child.strokeJoin,
            dashPattern: child.dashPattern,
            strokeCap: child.strokeCap,
            strokeMiterLimit: child.strokeMiterLimit,
            fillGeometry: child.fillGeometry,
            strokeGeometry: child.strokeGeometry,
            cornerRadius: child.cornerRadius,
            cornerSmoothing: child.cornerSmoothing,
            topLeftRadius: child.topLeftRadius,
            topRightRadius: child.topRightRadius,
            bottomLeftRadius: child.bottomLeftRadius,
            bottomRightRadius: child.bottomRightRadius,
            paddingLeft: child.paddingLeft,
            paddingRight: child.paddingRight,
            paddingTop: child.paddingTop,
            paddingBottom: child.paddingBottom,
            primaryAxisAlignItems: child.primaryAxisAlignItems,
            counterAxisAlignItems: child.counterAxisAlignItems,
            primaryAxisSizingMode: child.primaryAxisSizingMode,
            layoutWrap: child.layoutWrap,
            counterAxisSpacing: child.counterAxisSpacing,
            counterAxisAlignContent: child.counterAxisAlignContent,
            strokeTopWeight: child.strokeTopWeight,
            strokeBottomWeight: child.strokeBottomWeight,
            strokeLeftWeight: child.strokeLeftWeight,
            strokeRightWeight: child.strokeRightWeight,
            inferredAutoLayout: child.inferredAutoLayout,
            layoutGrids: child.layoutGrids,
            gridStyleId: child.gridStyleId,
            backgroundStyleId: child.backgroundStyleId,
            clipsContent: child.clipsContent,
            guides: child.guides,
            expanded: child.expanded,
            constraints: child.constraints,
            layoutMode: child.layoutMode,
            counterAxisSizingMode: child.counterAxisSizingMode,
            itemSpacing: child.itemSpacing,
            overflowDirection: child.overflowDirection,
            numberOfFixedChildren: child.numberOfFixedChildren,
            overlayPositionType: child.overlayPositionType,
            overlayBackground: child.overlayBackground,
            overlayBackgroundInteraction: child.overlayBackgroundInteraction,
            itemReverseZIndex: child.itemReverseZIndex,
            strokesIncludedInLayout: child.strokesIncludedInLayout,
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