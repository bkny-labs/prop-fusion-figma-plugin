import { StateService } from './state.service';
import { StateNames } from '../../types/states.model';
import { heightLarge, widthLarge } from '../../plugin/controller';
import { camelCase, upperFirst } from 'lodash';

const stateService = new StateService();
export class MessageService {
  public handleResize(msg): void {
    figma.ui.resize(msg.width, msg.height);
  }

  public handleCopyNotification(msg): void {
    figma.notify(msg.type === 'copy-success' ? 'Copied to clipboard!' : `${msg.message}`);
  }

  public bemClassNames(componentName: string, classProps: Record<string, string>): string {
    return Object.entries(classProps)
      .map(([key, value]) => `${componentName}__${value}`)
      .join(', ');
  }

  public generateSnippet(msg: MessageEvent): void {
    const [component] = msg.selection;
    if (component && component.type === 'COMPONENT_SET' && component.componentPropertyDefinitions) {
      const componentName = component.name.replace(/\s+/g, '');
      const componentNameTypes = component.name.replace(/\s+/g, '') + 'Types';
      const cssFileName = component.name.toLowerCase().replace(/\s+/g, '-') + '.css';
      const variantProps = Object.entries(component.componentPropertyDefinitions);
      let cssClasses;

      const propTypes = variantProps
        .map(([key, value]) => {
          if (value.type === 'VARIANT') {
            const typeValues = value.variantOptions.map((option) => `'${option}'`).join(' | ');
            return `export type ${key} = ${typeValues};`;
          }
          return null;
        })
        .filter(Boolean)
        .join('\n');

      const classProps = variantProps
        .map(([key, value]) => {
          if (value.type === 'VARIANT') {
            return `${key.toLowerCase()}={${key.toLowerCase()}}`;
          }
          return null;
        })
        .filter(Boolean)
        .join(' ');


      if ("children" in component && Array.isArray(component.children) && component.children.length > 0) {
        const firstChild = component.children[0];
        // Generating CSS for each variant property
        cssClasses = variantProps.map(([key, value]) => {
          if (value.type === 'VARIANT') {
            return value.variantOptions.map(option => {
              let relevantProps = {};
      
              if (key === 'fills' || key === 'strokes' || key === 'backgrounds') {
                // Handle arrays of objects (fills, strokes, backgrounds)
                const property = firstChild.props[key]?.find(item => item.boundVariables?.variant === option);
                relevantProps = property ? { color: property.color, opacity: property.opacity } : {};
              } else if (key === 'borderRadius' || key === 'padding') {
                // Handle borderRadius and padding (objects)
                relevantProps = firstChild.props[key] || {};
              } else {
                // Handle other direct property values
                relevantProps = { [key]: firstChild.props[key] };
              }
      
              const additionalProperties = Object.entries(relevantProps).map(([propName, propValue]) => {
                const cssPropName = propName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      
                if (propName === 'borderRadius' || propName === 'padding') {
                  return Object.entries(propValue).map(([side, amount]) => `  ${cssPropName}-${side}: ${amount}px;`).join('\n');
                }
                return `  ${cssPropName}: ${propValue};`;
              }).join('\n');
      
              return `
.${component.name.toLowerCase()}-${key.toLowerCase()}-${option.toLowerCase().replace(/\s+/g, '-')} {
  ${additionalProperties}
}`;
            }).join('');
          }
          return '';
        }).join('');
      } else {
        figma.ui.postMessage({ type: 'error', message: 'The selected component does not have children or the children are not in the expected format.' });
      }

      // Condition to check if the 'Disabled' state is included in the properties
      const disabledCheck = variantProps.some(
        ([key, values]) => key.toLowerCase() === 'state' && Array.isArray(values) && values.includes('Disabled')
      );

      // Interface properties for the React component
      const interfaceProps = variantProps
      .map(([key, value]) => {
        key = key.split('#')[0].replace(/\s+/g, '');
        if (value.type === 'VARIANT') {
          return `${key}: ${key};`;
        } else if (value.type === 'BOOLEAN') {
          return `${key}: boolean;`;
        } else if (value.type === 'TEXT') {
          return `${key}: string;`;
        } else if (value.type === 'INSTANCE_SWAP') {
          return `${key}: string;`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n  ');

      // Template literal for React component
      const snippet = {
        react: this.reactTemplate(componentName, component, componentNameTypes, cssFileName, variantProps, classProps, disabledCheck, interfaceProps, cssClasses),
        angular: this.angularTemplate(componentName, componentNameTypes, cssFileName, variantProps, classProps, disabledCheck, interfaceProps, cssClasses, component, propTypes),
        flutter: this.flutterTemplate(componentName, variantProps, interfaceProps, propTypes),
        vue: this.vueTemplate(componentName, variantProps),
        webComponents: this.webComponentsTemplate(componentName, variantProps),
        typescript: this.typescriptTemplate(component, componentName, componentNameTypes, variantProps, interfaceProps, propTypes),
        css: this.cssTemplate(cssClasses, component, componentName, variantProps),
        scss: this.scssTemplate(cssClasses, component, componentName, variantProps),
      };

      this.handleResize({ width: widthLarge, height: heightLarge });

      if (typeof figma.ui.postMessage === 'function') {
        figma.ui.postMessage({ type: 'deliver-snippet', code: snippet });
      }
      if (typeof stateService.setSlice === 'function') {
        stateService.setSlice(StateNames.SNIPPET, snippet);
      }
    } else {
      figma.ui.postMessage({ type: 'error', message: 'No component set selected or node is not a component set.' });
    }
  }

  private reactTemplate(componentName: string, component: any, componentNameTypes: string, cssFileName: string, variantProps: any[], classProps: string, disabledCheck: boolean, interfaceProps: string, cssClasses: string) {
    const camelCaseName = camelCase(component.name);
    const PascalCaseName = upperFirst(camelCaseName);
    const bemClasses = this.bemClassNames(componentName.toLowerCase(), {classProps});
    const classNames = `${componentName.toLowerCase()}, ${bemClasses}`;

    return `
// ${componentName}.tsx
// @name: ${componentName}
// @description: React Component generated by PropFusion
// @params: ${variantProps.map(([key]) => key.split('#')[0].replace(/\s+/g, '')).join(', ')}

import React from 'react';
import { ${PascalCaseName}Props } from './${componentName}Types';
import './${cssFileName}';

const ${PascalCaseName}: React.FC<${PascalCaseName}Props> = ({
  ${interfaceProps}
}) => {
  
  return <div className=${classNames} disabled={props.disabled || ${
          disabledCheck ? 'true' : 'false'
        }}>Button</div>;
};

export default ${PascalCaseName};
      `
  }

  private angularTemplate(componentName: string, componentNameTypes: string, cssFileName: string, variantProps: any[], classProps: string, disabledCheck: boolean, interfaceProps: string, cssClasses: string, component: any, propTypes: string) {
    const camelCaseName = camelCase(component.name);
    const PascalCaseName = upperFirst(camelCaseName);
    return `
// ${component.name.toLowerCase()}.component.ts
// @name: ${componentName}
// @description: NG Component generated by PropFusion
// @params: ${variantProps.map(([key]) => key.split('#')[0].replace(/\s+/g, '')).join(', ')}

import { Component, Input } from '@angular/core';
import './${cssFileName}';
import { ${PascalCaseName}Props } from './${componentName}Types';

@Component({
  selector: '${component.name.toLowerCase()}',
  template: \`
    <button [ngClass]="'${component.name.toLowerCase()}'" ${classProps} [disabled]="disabled">
      Button
    </button>
  \`,
  styleUrls: ['./${cssFileName}']
})
export class ${componentName} {
  @Input()  disabled: boolean = false;
  ${interfaceProps
    .split('\n')
    .map((prop) => '@Input() ' + prop)
    .join('\n  ')
    .toLowerCase()}
}
`;
  }

  private flutterTemplate(componentName: string, variantProps: any[], interfaceProps: string, propTypes: string) {
    return `
// ${componentName}.dart
// @name: ${componentName}
// @description: Widget generated by PropFusion
// @params: ${variantProps.map(([key]) => key.split('#')[0].replace(/\s+/g, '')).join(', ')}

import 'package:flutter/material.dart';

${propTypes.replace(/type/g, 'enum')}

class ${componentName} extends StatelessWidget {
  final bool disabled;
  ${interfaceProps
    .replace(/;/g, '')
    .split('\n')
    .map((prop) => 'final ' + prop + ';')
    .join('\n  ')}
  const ${componentName}({ 
    Key? key, 
    this.disabled = false, 
    ${interfaceProps.replace(/:/g, ',').replace(/;/g, '').split('\n').join(',\n    ')}
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ButtonStyle(
        backgroundColor: MaterialStateProperty.resolveWith<Color>(
          (Set<MaterialState> states) {
            if (states.contains(MaterialState.disabled)) {
              return Colors.grey; // Disabled color
            }
            return Colors.blue; // Default color
          },
        ),
      ),
      onPressed: disabled ? null : () {},
      child: Text('Button'),
    );
  }
}
`
  }

  private vueTemplate(componentName: string, variantProps: any[]) {
    return `
// ${componentName}.vue
// @name: ${componentName}
// @description: Vue component generated by PropFusion
// @params: ${variantProps.map(([key]) => key.split('#')[0].replace(/\s+/g, '')).join(', ')}
// Coming soon...
`
  }

  private webComponentsTemplate(componentName: string, variantProps: any[]) {
    return `
// ${componentName}.html
// @name: ${componentName}
// @description: WebComponent generated by PropFusion
// @params: ${variantProps.map(([key]) => key.split('#')[0].replace(/\s+/g, '')).join(', ')}
// Coming soon...
`
  }

  private typescriptTemplate(component: any, componentName: string, componentNameTypes: string, variantProps: any[], interfaceProps: string, propTypes: string) {
    const camelCaseName = camelCase(component.name);
    const PascalCaseName = upperFirst(camelCaseName);
    return `
// ${componentNameTypes}.ts
// @name: ${componentNameTypes}
// @description: Types generated by PropFusion
// @params: ${variantProps.map(([key]) => key.split('#')[0].replace(/\s+/g, '')).join(', ')}

${propTypes}

export interface ${PascalCaseName}Props {
  ${interfaceProps}
  disabled?: boolean;
}
`
  }

  private cssTemplate(cssClasses: string, component: any, componentName: string, variantProps: any[]) {
    return `
// ${component.name.toLowerCase()}.css
// @name: ${componentName}
// @description: Styles generated by PropFusion
// @params: ${variantProps.map(([key]) => key.split('#')[0].replace(/\s+/g, '')).join(', ')}
${cssClasses}
`
  }

  private scssTemplate(cssClasses: string, component: any, componentName: string, variantProps: any[]) {
    return `
// ${component.name.toLowerCase()}.scss
// @name: ${componentName}
// @description: Styles generated by PropFusion
// @params: ${variantProps.map(([key]) => key.split('#')[0].replace(/\s+/g, '')).join(', ')}
.${componentName.toLowerCase()}-component { 
  /* Base styles for the component */ 
  ${cssClasses.trim().replace(/\.(\w+)-/g, '& .-$1-')}  /* Nested variant styles */
}
`; 
  }
}

