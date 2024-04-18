export function serializeNode(node): any {
  const variantGroupPropertyNames = node.variantGroupProperties ? Object.keys(node.variantGroupProperties) : [];
  const variantGroupProperties = {};
  variantGroupPropertyNames.forEach(name => {
    variantGroupProperties[name] = node.variantGroupProperties[name].values;
  });
  return {
    id: node.id,
    name: node.name,
    description: node.description,
    type: node.type,
    defaultVariantName: node.defaultVariant ? node.defaultVariant.name : null,
    variantGroupProperties: variantGroupProperties,
    children: Array.isArray(node.children) ? node.children.map(serializeNode) : []
  };
}