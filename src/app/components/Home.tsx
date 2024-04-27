import React, { useCallback, useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import '../styles/ui.css';
import Tabs from './Tabs';
import { MdOutlineFileDownload, MdOutlineSkipPrevious } from "react-icons/md";
import { FaBook, FaCode, FaGithub, FaSpinner } from 'react-icons/fa';
import { version } from '../../../package.json';
import { SiBuymeacoffee, SiGooglegemini } from 'react-icons/si';
import { saveAs } from 'file-saver';
import { TbHandStop } from "react-icons/tb";
import CodeSnippet from './CodeSnippet';

const Home: React.FC = () => {
  const [currentSelection, setCurrentSelection] = useState([]);
  const [codeSnippet, setCodeSnippet] = useState(null);
  const [validSelection, setValidSelection] = useState(null);
  const [nothingSelected, setNothingSelected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [isAiChecked, setIsAiChecked] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [variantProperties, setVariantProperties] = useState({});

  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: 'get-current-selection' } }, '*');
    const handleMessage = (event) => {
      const message = event.data.pluginMessage;

      if (message.type === 'loading-update') {
        setLoading(message.loading);
      }

      if (message.type === 'selection-update') {
        setLoading(true);
        setValidSelection(message.selection.some(item => item.type === 'COMPONENT_SET'));
        setCurrentSelection(message.selection);
        setReadyToGenerate(false);

        // If there's no selection, set codeSnippet to null
        if (message.selection.length === 0 || message.selection.length > 1) {
          setCodeSnippet(null);
          setNothingSelected(true);
        } 
        // Check if any item in the selection is a 'COMPONENT_SET'
        if (message.selection.length === 1) {
          setValidSelection(message.selection.some(item => item.type === 'COMPONENT_SET'));
          setNothingSelected(false);
          if (!validSelection) {
            setCodeSnippet(null);
          }
        }
      }

      if (message.type === 'deliver-snippet') {
        setCodeSnippet(message.code);
      }

      if (message.type === 'editor-type') {
        setIsDevMode(message.editor === 'dev');
      }

      if (message.type === 'variant-properties') {
        setVariantProperties(message.variantProperties);
      }

    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleRequestSnippet = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'generate-code-snippets', selection: currentSelection } }, '*');
  }, [currentSelection]);

  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(currentSelection, null, 2)], { type: 'application/json' });
    saveAs(blob, currentSelection[0].name.replace(/\s+/g, '') + 'Component.json');
  }, [currentSelection]);

  const handleDownloadVariantProperties = useCallback(() => {
  const blob = new Blob([JSON.stringify(variantProperties, null, 2)], { type: 'application/json' });
  saveAs(blob, currentSelection[0].name.replace(/\s+/g, '') + 'variantProperties.json');
}, [variantProperties]);

  return (
    <>
    <div className="container">
      <div className="top">
        {validSelection && currentSelection.length === 1 ? (
          <>
            <div className="content">
              {!codeSnippet && (
                <div>
                  {currentSelection.length === 1 ? (
                    renderSelectionDetails(loading, currentSelection, isAiChecked, isDevMode, variantProperties)
                  ) : (
                    <></>
                  )}
                </div>
              )}
              {codeSnippet && (
                <>
                  <h3>Code Templates <span className="beta">BETA</span></h3>
                  <Tabs style={{ marginBottom: '20px' }} codeSnippets={codeSnippet as any} />
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="header">
              <img src={logo} alt="Logo" />
              <h2>PropFusion</h2>
              <p>Convert your Figma component set into reusable base components for React, Angular, Flutter, TypeScript, and CSS.</p>
            </div>
            {!validSelection && !nothingSelected ? (
              <div className="alert">
                <h3>Invalid node type</h3>
                <p>
                  Please select one <span> <svg className="svg" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" stroke="none" d="M3.743 2.748 6 .5l2.257 2.248L6 4.996 3.743 2.748zm-.995 5.51L.5 6l2.248-2.257L4.996 6 2.748 8.257zm5.51.994L6 11.5 3.743 9.252 6 7.004l2.257 2.248zM11.5 6 9.252 3.743 7.004 6l2.248 2.257L11.5 6z"></path></svg>COMPONENT SET</span> node to get started.
                </p>
              </div>
            ): ''}
          </>
        )}

        {currentSelection.length > 1 ? (
          <div className="alert error">
            <h3><TbHandStop /> Easy there champ...</h3>
            <p>
              Please select only one <span> <svg className="svg" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" stroke="none" d="M3.743 2.748 6 .5l2.257 2.248L6 4.996 3.743 2.748zm-.995 5.51L.5 6l2.248-2.257L4.996 6 2.748 8.257zm5.51.994L6 11.5 3.743 9.252 6 7.004l2.257 2.248zM11.5 6 9.252 3.743 7.004 6l2.248 2.257L11.5 6z"></path></svg>COMPONENT SET</span> at a time for code generation.
            </p>
          </div>
        ): ''}

        {nothingSelected && !validSelection ? (
          <div className="alert success">
            <h3>Select a node</h3>
            <p>
              Please select a <span> <svg className="svg" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" stroke="none" d="M3.743 2.748 6 .5l2.257 2.248L6 4.996 3.743 2.748zm-.995 5.51L.5 6l2.248-2.257L4.996 6 2.748 8.257zm5.51.994L6 11.5 3.743 9.252 6 7.004l2.257 2.248zM11.5 6 9.252 3.743 7.004 6l2.248 2.257L11.5 6z"></path></svg>COMPONENT SET</span> node to get started.
            </p>
          </div>
        ): ''}

      </div>
      <div className="bottom">
        {validSelection && currentSelection.length === 1 ? (
          <div className="actions">
            {codeSnippet ? (
              <button id="goBack" onClick={() => setCodeSnippet(null)}>
              <MdOutlineSkipPrevious /> Back
              </button>
              ): 
              <>
                <div className="button-group">
                  <button onClick={handleDownloadJson}><MdOutlineFileDownload /> Component.json</button>
                  <button onClick={handleDownloadVariantProperties}><MdOutlineFileDownload /> VariantProps.json <span className="beta">BETA</span></button> 
                </div>
                <div className="checkbox-container">
                  {/* <input 
                    type="checkbox" 
                    id="generateWithAI" 
                    name="generateWithAI"
                    checked={isAiChecked} 
                    // disabled={true}
                    onChange={() => setIsAiChecked(!isAiChecked)}
                  />
                  <label htmlFor="generateWithAI">Use AI</label> */}
                </div>
                </>
              }
            {isAiChecked ? (
              <button id="generate" onClick={() => console.log('GENERATE MAGIC AI WOOP')}><SiGooglegemini /> Generate Component</button>
            ) : (
              <button id="create" onClick={handleRequestSnippet}><FaCode /> Create Code Templates</button>
            )}
          </div>
        ) : (
          <></>
        )}
        <div className="version">
            <div className="links">
              <a href="https://github.com/bkny-labs/prop-fusion-figma-plugin/blob/main/CHANGELOG.md" target="_blank" class="tooltip" data-tooltip="Changelog">
                v{version}
              </a>
              <a href="https://github.com/bkny-labs/prop-fusion-figma-plugin/wiki/PropFusion-User-Guide" target="_blank" class="tooltip" data-tooltip="Docs">
                <FaBook />
              </a>
              <a href="https://github.com/bkny-labs/prop-fusion-figma-plugin" target="_blank" class="tooltip" data-tooltip="Github">
                <FaGithub />
              </a>
              <a href="https://buymeacoffee.com/m42na" target="_blank" class="tooltip" data-tooltip="Donate">
                <SiBuymeacoffee />
              </a>
            </div> 
        </div>
      </div>
    </div>
    </>
  );
}

const renderSelectionDetails = (loading, nodes, isAiChecked, isDevMode, variantProperties) => {
  return (nodes || []).map((node, index) => (
    <>
      <div key={index} className={`component-content ${isDevMode ? 'component-content--devMode' : ''}`}>

        {
          isAiChecked ? (
            <div className="alert brand">
              <h3><svg className="svg" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 12 12"><path fill="currentColor" stroke="none" d="M3.743 2.748 6 .5l2.257 2.248L6 4.996 3.743 2.748zm-.995 5.51L.5 6l2.248-2.257L4.996 6 2.748 8.257zm5.51.994L6 11.5 3.743 9.252 6 7.004l2.257 2.248zM11.5 6 9.252 3.743 7.004 6l2.248 2.257L11.5 6z"></path></svg> Component Set Review</h3>
              <p>Please review the component's details and properties. They will be used by Gemini AI to generate component code.</p>
            </div>
          ) : 
          <div className="alert component">
            <h3><svg className="svg" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 12 12"><path fill="currentColor" stroke="none" d="M3.743 2.748 6 .5l2.257 2.248L6 4.996 3.743 2.748zm-.995 5.51L.5 6l2.248-2.257L4.996 6 2.748 8.257zm5.51.994L6 11.5 3.743 9.252 6 7.004l2.257 2.248zM11.5 6 9.252 3.743 7.004 6l2.248 2.257L11.5 6z"></path></svg> Component Set Review</h3>
            <p>Review the component details and properties before generating code.</p>
          </div>
        }

        <div className="component-info">
        <h3>Component Set Details</h3>
        <table className="custom-table">
          <tbody>
            <tr>
              <td>Name</td>
              <td>{node.name}</td>
            </tr>
            {
            node.link ? (
              <tr>
                <td>Documentation</td> 
                <td><a href={node.link} target='_blank'>{node.link}</a></td>
              </tr>
            ) : (
              <tr>
                <td>Documentation</td> 
                <td>No documentation link added.</td>
              </tr>
            )}
            {
            node.description ? (
              <tr>
                <td>Description</td> 
                <td>{node.description}</td>
              </tr>
            ) : (
              <tr>
                <td>Description</td> 
                <td>No description added.</td>
              </tr>
            )}
            <tr>
              <td>Default Instance</td>
              <td>{node.defaultVariantName}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <h3>Property Definitions ({Object.keys(node.componentPropertyDefinitions).length})</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Default</th>
              <th>Values</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(node && node?.componentPropertyDefinitions || {}).map(([key, value]: [string, { type: string; defaultValue: any; variantOptions?: string[]; preferredValues?: string[] }], idx) => (
              <tr key={idx}>
                <td>{key.split('#')[0].replace(/\s+/g, '')}</td>
                <td>{value ? value.type: ''}</td>
                <td>{value ? String(value.defaultValue) : ''}</td>
                <td>{value ? (value.variantOptions as string[]).join(', ') : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {isDevMode && (
        <>
        <h3>Variant Properties <span className="beta">BETA</span>
        </h3>
          {loading ? 
            <div className="loading">
              <FaSpinner className="spinner" />
            </div> : (
            <div className="code-container code-container--maxHeight">
              <CodeSnippet 
                    code={JSON.stringify(variantProperties, null, 2) || ''}
                    language="json" 
                    showLineNumbers={true}
                />
            </div>
            )}
        </>
        )}
      </div>
    </>
  ));
};

export default Home;
