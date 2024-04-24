# Improvements needed
1. Need more impactful code templates - the current ones need more structure added to them
   1. How can I make this better? It's super restrictive being in a string
2. Download theme feature
3. Code support
   - module and .spec.ts file generation
   - scss
4. Output configuration (this should be set in a new UI screen before the code is generated)
      1. Select Framework (Angular, react, flutter, vue)
      2. Select SCSS or CSS
      3. Select Gemini or not
      4. For react, select TSX or JSX styles
      5. Module generation for Angular (optional)
      6. .spec.ts file generation for Angular (optional)
      7. Parsing options for props
5. Direct download of component code (in a zip with all the files in it)

# Bugs
1. Copy to clipboard...
2. Gemini service is not working

# Discussion
1. Gemini - maybe to use this better, we need to drill down on the specific code style before hand. 

# Pro Version

1. Connect component to Github 
   1. Similar to how code connect works in Figma - can I just use code connect? Maybe there's metadata to tap?
2. Save/push to Github (similar to how Tokens studio does it - maybe this creates a PR or something)