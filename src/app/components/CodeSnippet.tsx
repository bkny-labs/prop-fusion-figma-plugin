import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';


const CodeSnippet = ({ code, language = 'typescript' }) => {
// const [isMaximized, setIsMaximized] = useState(false);

  const copyToClipboard = () => {
    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'Successfully copied to clipboard!' : 'Failed to copy!';
      parent.postMessage({ pluginMessage: { type: 'copy-success', message: msg } }, '*');
    } catch (err) {
      console.error('Failed to copy:', err);
      parent.postMessage({ pluginMessage: { type: 'copy-failure', message: 'Failed to copy!' } }, '*');
    }
  };

  // const maximize = () => {
  //   setIsMaximized(true);
  //   parent.postMessage({ pluginMessage: { type: 'resize', width: 800, height: 900 } }, '*');
  // }
  // const minimize = () => {
  //   setIsMaximized(false);
  //   parent.postMessage({ pluginMessage: { type: 'resize', width: 700, height: 850 } }, '*');
  // }
  return (
    <div className="code-container">
      <SyntaxHighlighter language={language} style={okaidia}>
        {code}
      </SyntaxHighlighter>
      <button onClick={copyToClipboard} className="copyButton">
        Copy
      </button>
      {/* {isMaximized ? ( 
        <button onClick={minimize} className="fullSizeButton">
          <CiMinimize1 />
        </button> 
      ) : ( 
        <button onClick={maximize} className="fullSizeButton">
          <CiMaximize1 />
        </button>
      )} */}
    </div>
  );
};

export default CodeSnippet;
