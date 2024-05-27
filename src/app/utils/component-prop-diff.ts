import * as deepDiff from 'deep-diff';
import { set } from 'lodash';
import { figmaController } from '../../plugin/controller';

// @name calculateVariantProperties
// @params currentSelection: ComponentSetNode
// @description Calculates the variant properties by comparing the differences between the ComponentNode children in the ComponentSetNode selection
export function calculateVariantProperties(currentSelection) {
  const variants = {};  
  const children = currentSelection.children;
  for (let i = 0; i < children.length; i++) {
    const childA = children[i];
    const variantsA = childA.name.split(',').map(str => str.trim());
    for (let j = i + 1; j < children.length; j++) {
      const childB = children[j];
      const variantsBMap = new Map(childB.name.split(',').map(str => {
        const [property, value] = str.trim().split('=');
        return [property, value];
      }));
      const variantDiffs = [];
      for (const variantA of variantsA) {
        const [propertyA, valueA] = variantA.split('=');
        if (variantsBMap.has(propertyA) && variantsBMap.get(propertyA) !== valueA) {
          variantDiffs.push({
            property: propertyA,
            valueA,
            valueB: variantsBMap.get(propertyA)
          });
        }
      }
      if (variantDiffs.length === 1) {
        const currentVariant = variantDiffs[0];
        const childAProps = { ...childA.props };
        delete childAProps.child;
        delete childAProps.children;
        const childBProps = { ...childB.props };
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
  
          if (variants[currentVariant.property][currentVariant.valueA] !== undefined) {
            if (deepDiff(variants[currentVariant.property][currentVariant.valueA], childADelta)?.length > 0) {
              // console.log('somethings fucked up', currentVariant.property, currentVariant.valueA, variants[currentVariant.property][currentVariant.valueA], childADelta);
            }
          }
  
          variants[currentVariant.property][currentVariant.valueA] = childADelta;
          variants[currentVariant.property][currentVariant.valueB] = childBDelta;
        }
      }
    }
  }

  return variants;

}
