import React, { useCallback, useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import '../styles/ui.css';
import Tabs from './Tabs';
import { CgSize } from "react-icons/cg";
import { MdOutlineDifference } from "react-icons/md";
import { FaCode, FaRegHandPointer } from "react-icons/fa";
// import { stateService } from '../services/state.service';
// import { StateNames } from '../../types/states.model';


function App() {
  // const [currentSelection, setCurrentSelection] = useState(() => stateService.getState(StateNames.CURRENT_SELECTION));
  // const [codeSnippet, setCodeSnippet] = useState(() => stateService.getState(StateNames.SNIPPET));
  const [currentSelection, setCurrentSelection] = useState([]);
  const [codeSnippet, setCodeSnippet] = useState('');


  useEffect(() => {
    const handleMessage = (event) => {
    const { type, selection, code, message } = event.data.pluginMessage;
    switch (type) {
      case 'selection-update':
        setCurrentSelection(selection || []);
        break;
      case 'deliver-snippet':
        setCodeSnippet(code);
        break;
      case 'error':
        setCodeSnippet(message);
        break;
      default:
        break;
    }
  };

  window.addEventListener('message', handleMessage);

  // Cleanup function to remove event listener
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);

const handleRequestSnippet = useCallback(() => {
  if (currentSelection.length > 0) {
    parent.postMessage({ pluginMessage: { type: 'generate-code-snippets', selection: currentSelection } }, '*');
  } else {
    setCodeSnippet(null);
  }
}, [currentSelection]);

const isValidComponentSet = currentSelection.length > 0 && currentSelection.every(node => node.type === 'COMPONENT_SET');

  return (
    <div className='container'>
      <div className="top">
      {isValidComponentSet ? (
        <>
          <div className="header header--condensed">
            <img src={logo} alt="Logo" />
          </div>
        <div className="content">
          { !codeSnippet && (
            <div>
            {currentSelection.length > 0 ? renderSelectionDetails(currentSelection) : <p>Select a Component Set to get started. <a href="https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants" target="_blank" className="a">Learn more</a> about component sets.</p>}
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
          { currentSelection.length > 0 && (
            <div className="alert">
            <h3>Invalid node type</h3>
            <p>Please select a <span>Component Set</span> node to get started.</p>
          </div>
          )}
        </>
      )}

      { currentSelection.length === 0 && (
        <div className="alert success">
          <h3>Select a node</h3>
        <p>Please select a <span>Component Set</span> node to get started.</p>
      </div>
      )}
      </div>
      <div className="bottom">
        {isValidComponentSet ? (
        <div className="actions">
          {/* <button onClick={onCancel}>Cancel</button> */}
          <button id="create" onClick={handleRequestSnippet}><FaCode /> Generate Component Code</button>
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
    <div key={index}>
      <h2>{node.name}</h2>
      <p><strong>Description:</strong> {node.description}</p>
      <p><strong>Variants:</strong> {node.children.length}</p>
      <table className="variantProps">
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>Property</th>
            <th>Values</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(node.variantGroupProperties).map(([key, values], idx) => (
            <tr key={idx}>
              <td>
                {key === 'Size' && <CgSize />}
                {['Variant', 'Kind', 'Type', 'Class', 'Action'].includes(key) && <MdOutlineDifference />}
                {key === 'State' && <FaRegHandPointer />}
              </td>
              <td>{key}</td>
              <td>{(values as string[]).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p><strong>Default:</strong> {node.defaultVariantName}</p>
    </div>
  ));
};



export default App;
