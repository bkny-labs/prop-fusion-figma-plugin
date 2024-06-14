import * as deepDiff from 'deep-diff';
import { set } from 'lodash';

// @name calculateVariantProperties
// @params currentSelection: ComponentSetNode
// @description Calculates the variant properties by comparing the differences between the ComponentNode children in the ComponentSetNode selection
export function calculateVariantProperties(currentSelection) {
  const variants = {};
  const children = currentSelection.children;
  const processedPairs = new Set();

  // Preprocess children variants
  const childrenVariants = children.map(child => ({
    node: child,
    variants: new Map(child.name.split(',').map(str => {
      const [property, value] = str.trim().split('=');
      return [property, value];
    }))
  }));

  for (let i = 0; i < children.length; i++) {
    const childA = childrenVariants[i];

    for (let j = i + 1; j < children.length; j++) {
      const pairKey = `${i}-${j}`;
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      const childB = childrenVariants[j];
      const variantDiffs = [];

      for (const [propertyA, valueA] of childA.variants) {
        if (childB.variants.has(propertyA) && childB.variants.get(propertyA) !== valueA) {
          variantDiffs.push({
            property: propertyA,
            valueA,
            valueB: childB.variants.get(propertyA)
          });
        }
      }

      if (variantDiffs.length === 1) {
        const currentVariant = variantDiffs[0];
        const childAProps = { ...childA.node.props };
        const childBProps = { ...childB.node.props };
        delete childAProps.child;
        delete childAProps.children;
        delete childBProps.child;
        delete childBProps.children;

        const differences = deepDiff(childAProps, childBProps);
        if (differences) {
          const propDiff = differences.flat();
          const childADelta = {};
          const childBDelta = {};
          const getKey = (path) => path.join('.');

          propDiff.forEach(delta => {
            if (delta?.kind === 'D') {
              set(childADelta, getKey(delta?.path), delta.lhs);
            }
            if (delta?.kind === 'N') {
              set(childBDelta, getKey(delta?.path), delta.rhs);
            }
            if (delta?.kind === 'E') {
              set(childADelta, getKey(delta?.path), delta.lhs);
              set(childBDelta, getKey(delta?.path), delta.rhs);
            }
          });

          if (variants[currentVariant.property] === undefined) {
            variants[currentVariant.property] = {};
          }

          variants[currentVariant.property][currentVariant.valueA] = childADelta;
          variants[currentVariant.property][currentVariant.valueB] = childBDelta;
        }
      }
    }
  }

  return variants;
}