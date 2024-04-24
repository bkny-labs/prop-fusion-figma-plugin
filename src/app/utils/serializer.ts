export function serializeNode(node, depth = 0): any {
  const componentSet = node.type === 'COMPONENT_SET' && depth === 0;
  const componentPropertyDefinitionNames = componentSet && node.componentPropertyDefinitions ? Object.keys(node.componentPropertyDefinitions) : [];
  const componentPropertyDefinitions = {};
  // console.log('original node', node);

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
    componentPropertyDefinitions: componentSet ? componentPropertyDefinitions : {},
    children: Array.isArray(node.children) ? node.children.map((child) => serializeNode(child, depth + 1)) : []
  };
}