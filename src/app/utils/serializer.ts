export function serializeNode(node, depth = 0): any {
  const componentSet = node.type === 'COMPONENT_SET' && depth === 0;
  const variantGroupPropertyNames = node.variantGroupProperties ? Object.keys(node.variantGroupProperties) : [];
  const componentPropertyDefinitionNames = componentSet && node.componentPropertyDefinitions ? Object.keys(node.componentPropertyDefinitions) : [];
  const variantGroupProperties = {};
  const componentPropertyDefinitions = {};
  // console.log('original node', node);

  variantGroupPropertyNames.forEach(name => {
    variantGroupProperties[name] = node.variantGroupProperties[name].values;
  });

  if (componentSet) {
    componentPropertyDefinitionNames.forEach(name => {
      const { type, defaultValue, variantOptions } = node.componentPropertyDefinitions[name];
      componentPropertyDefinitions[name] = {
        type,
        defaultValue,
        variantOptions: variantOptions || []
      };
    });
  }

  return {
    id: node.id,
    name: node.name,
    description: node.description,
    link: node.documentationLinks ? node.documentationLinks[0]?.uri : null,
    type: node.type,
    defaultVariantName: node.defaultVariant ? node.defaultVariant.name : null,
    variantGroupProperties: variantGroupProperties,
    componentPropertyDefinitions: componentSet ? componentPropertyDefinitions : {},
    children: Array.isArray(node.children) ? node.children.map((child) => serializeNode(child, depth + 1)) : []
  };
}