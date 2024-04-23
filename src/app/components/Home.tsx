import React, { useCallback, useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import '../styles/ui.css';
import Tabs from './Tabs';
import { MdDevices } from "react-icons/md";
import { FaCode, FaRegHandPointer } from 'react-icons/fa';
import { IoColorPaletteOutline, IoShareSocialOutline, IoText } from "react-icons/io5";

const Home: React.FC = () => {
  const [currentSelection, setCurrentSelection] = useState([]);
  const [codeSnippet, setCodeSnippet] = useState(null);
  const [validSelection, setValidSelection] = useState(null);
  const [nothingSelected, setNothingSelected] = useState(true);

  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: 'get-current-selection' } }, '*');
    const handleMessage = (event) => {
      const message = event.data.pluginMessage;

      if (message.type === 'selection-update') {
        setValidSelection(message.selection.some(item => item.type === 'COMPONENT_SET'));

        setCurrentSelection(message.selection);

        // If there's no selection, set codeSnippet to null
        if (message.selection.length === 0) {
          setCodeSnippet(null);
          setNothingSelected(true);
        } 
        // Check if any item in the selection is a 'COMPONENT_SET'
        if (message.selection.length > 0) {
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

    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleRequestSnippet = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'generate-code-snippets', selection: currentSelection } }, '*');
  }, [currentSelection]);

  return (
    <div className="container">
      <div className="top">
        {validSelection ? (
          <>
            <div className="content">
              {!codeSnippet && (
                <div>
                  {currentSelection.length > 0 ? (
                    renderSelectionDetails(currentSelection)
                  ) : (
                    <p>
                      Select a Component Set to get started.{' '}
                      <a
                        href="https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants"
                        target="_blank"
                        className="a"
                      >
                        Learn more
                      </a>{' '}
                      about component sets.
                    </p>
                  )}
                </div>
              )}
              {codeSnippet && (
                <>
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
              <p>Keep your component and widget code in sync with Figma component set properties.</p>
            </div>
            {!validSelection && !nothingSelected ? (
              <div className="alert">
                <h3>Invalid node type</h3>
                <p>
                  Please select a <span>Component Set</span> node to get started.
                </p>
              </div>
            ): ''}
          </>
        )}

        {nothingSelected && !validSelection ? (
          <div className="alert success">
            <h3>Select a node</h3>
            <p>
              Please select a <span>Component Set</span> node to get started.
            </p>
          </div>
        ): ''}

      </div>
      <div className="bottom">
        {validSelection ? (
          <div className="actions">
            <button id="create" onClick={handleRequestSnippet}>
              <FaCode /> Generate Component
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

const renderSelectionDetails = (nodes) => {
  return (nodes || []).map((node, index) => (
    <>
      <div key={index} className="component-content">
        <div className="alert component">
          <h3>Component Set Review</h3>
          <p>Please review the component's details and properties. They will be used to generate component code.</p>
        </div>

        <div className="component-info">
        <h3>Component Details</h3>
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
                <td>Description</td> 
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
              <td>Default</td>
              <td>{node.defaultVariantName}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <h3>Variant Groups ({Object.keys(node.variantGroupProperties).length})</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Property</th>
              <th>Values</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(node.variantGroupProperties || {}).map(([key, values], idx) => (
              <tr key={idx}>
                <td>
                  {['Size', 'Sizes', 'sizes', 'size'].includes(key) && <MdDevices />}
                  {['Variant', 'Kind', 'Type', 'Class', 'Action', 'Hierarchy', 'Theme', 'Style'].includes(key) && <IoColorPaletteOutline />}
                  {['Social', 'Store'].includes(key) && <IoShareSocialOutline />}
                  { ['State', 'Destructive', 'Pressed', 'Checked', 'Indeterminate' ].includes(key) && <FaRegHandPointer />}
                  { ['Label', 'Icon', 'icon', 'Leading icon', 'Hint text', 'Help icon', 'text', 'Text', 'Supporting text'].includes(key) && <IoText />}
                </td>
                <td>{key}</td>
                <td>{(values as string[]).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>All Properties ({node.children.length})</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(node?.componentPropertyDefinitions || {}).map(([key, value]: [string, { type: string; defaultValue: any; variantOptions?: string[]; preferredValues?: string[] }], idx) => (
              <tr key={idx}>
                <td>{key}</td>
                <td>{value ? value.type: ''}</td>
                <td>{value ? String(value.defaultValue) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ));
};

export default Home;
