import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';


const CodeSnippet = ({ code, language = 'typescript' }) => {
// const [isMaximized, setIsMaximized] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      parent.postMessage({ pluginMessage: { type: 'copy-success', message: 'Successfully copied to clipboard!' } }, '*');
    } catch (err) {
      console.error('Failed to copy:', err);
      parent.postMessage({ pluginMessage: { type: 'copy-failure', message: 'Failed to copy!' } }, '*');
    }
  };

  return (
    <div className="code-container">
      <SyntaxHighlighter language={language} style={okaidia}>
        {code}
      </SyntaxHighlighter>
      <button onClick={copyToClipboard} className="copyButton">
        Copy
      </button>
    </div>
  );
};

export default CodeSnippet;
