import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';


const CodeSnippet = ({ code, language = 'typescript', showLineNumbers = false }) => {
// const [isMaximized, setIsMaximized] = useState(false);

  const copyToClipboard = async () => {
    parent.postMessage({ pluginMessage: { type: 'copy', code: code } }, '*');
  };

  return (
    <div className="code-container">
      <SyntaxHighlighter language={language} style={okaidia} showLineNumbers={showLineNumbers}>
        {code}
      </SyntaxHighlighter>
      <button onClick={copyToClipboard} className="copyButton">
        Copy
      </button>
    </div>
  );
};

export default CodeSnippet;
