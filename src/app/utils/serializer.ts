export function serializeNode(node, depth = 0): any {
  const componentSet = node.type === 'COMPONENT_SET' && depth === 0;
  const componentPropertyDefinitionNames = componentSet && node.componentPropertyDefinitions ? Object.keys(node.componentPropertyDefinitions) : [];
  const variantGroupPropertyNames = componentSet && node.variantGroupProperties ? Object.keys(node.variantGroupProperties) : [];
  const componentPropertyDefinitions = {};
  const variantGroupProperties = {};
  let serializedChildren = [];
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

    if (node.children) {
      serializedChildren = node.children.map(child => {
        // Serialize child values
        const serializedChildValues = {};
        for (const key in child.values) {
          serializedChildValues[key] = child.values[key];
        }

        // Return a new object with all properties of child and the serialized values
        return { ...child, values: serializedChildValues };
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
    name: node.name,
    description: node.description,
    link: node.documentationLinks ? node.documentationLinks[0]?.uri : null,
    type: node.type,
    defaultVariantName: node.defaultVariant ? node.defaultVariant.name : null,
    componentPropertyDefinitions: componentSet ? componentPropertyDefinitions : {},
    children: Array.isArray(serializedChildren) && depth < 1 ? serializedChildren.map((child) => serializeNode(child, depth + 1)) : [],
    variantGroupProperties: componentSet && depth < 1 ? variantGroupProperties : {},  };
}