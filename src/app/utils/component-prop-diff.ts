import * as deepDiff from 'deep-diff';
import { observableDiff } from 'deep-diff'
import { merge, set } from 'lodash';

export function calculateVariantProperties(currentSelection) {
  const variants = {};  
  currentSelection.children.forEach(childA => {
    currentSelection.children.forEach(childB => {
      if (childA !== childB) {
        const variantsA = childA.name.split(',').map(str => str.trim());
        const variantsB = childB.name.split(',').map(str => str.trim());

        const variantDiffs = [];
        variantsA.forEach(variantA => {
          const splitA = variantA.split('=');
          const propertyA = splitA[0];
          const valueA = splitA[1];
          variantsB.forEach(variantB => {
            const splitB = variantB.split('=');
            const propertyB = splitB[0];
            const valueB = splitB[1];
            if (propertyA === propertyB && valueA !== valueB) {
              variantDiffs.push({
                property: propertyA,
                valueA,
                valueB
              });
            }
          });
        });
        if (variantDiffs.length === 1) {
          const currentVariant = variantDiffs[0]
          const childAProps = {
            ...childA.props,
          };
          delete childAProps.child;
          delete childAProps.children;

          const childBProps = {
            ...childB.props,
          };
          delete childBProps.child;
          delete childBProps.children;

          const differences = deepDiff(childAProps, childBProps);
          // if (differences) {
          //   differences.forEach((difference) => {
          //     console.log(difference);
          //   });
          // }

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
    });  
  });

  // console.log('all variants??', variants);

  return variants;

}
