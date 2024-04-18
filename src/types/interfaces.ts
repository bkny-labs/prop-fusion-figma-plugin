// Define the color type for fills
interface Color {
  r: number; // Red: 0-1 scale
  g: number; // Green: 0-1 scale
  b: number; // Blue: 0-1 scale
}

// Define the fill type
interface Fill {
  type: string;
  color?: Color;
}

// Define the structure for variant values to clearly indicate it's an array of strings
interface VariantValues {
  values: string[]; // Clearly an array of strings
}

// Define variant group properties to use VariantValues
interface VariantGroupProperties {
  [key: string]: VariantValues;
}

// Define the component structure using VariantGroupProperties
interface Component {
  id: string;
  name: string;
  type: string;
  variantGroupProperties?: VariantGroupProperties;
}

// Define the message structure that includes a selection of Components
interface MessageEvent {
  type: string;
  selection: Component[];
}
