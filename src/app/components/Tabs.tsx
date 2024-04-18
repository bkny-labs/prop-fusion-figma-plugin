import React, { useState, CSSProperties } from 'react';
import { FaAngular, FaReact } from 'react-icons/fa';
import { TbBrandFlutter } from "react-icons/tb";
import CodeSnippet from './CodeSnippet';

interface TabData {
  id: string;
  label: string;
  icon: React.ReactNode;
  code: string;
}

interface TabsProps {
  style?: CSSProperties;
  codeSnippets: { [key: string]: string };
}

const Tabs: React.FC<TabsProps> = ({ style, codeSnippets }) => {
  const [selectedTab, setSelectedTab] = useState<string>('react');

  const tabsData: TabData[] = [
    {
      id: 'react', label: 'React', icon: <FaReact />,
      code: undefined
    },
    { id: 'angular', label: 'Angular', icon: <FaAngular />,
      code: undefined
    },
    { id: 'flutter', label: 'Flutter', icon: <TbBrandFlutter />,
    code: undefined },
  ];

  return (
    <div className="tabs-container" style={style}> 
      <ul className="tabs-list">
        {tabsData.map((tab) => (
          <li
            key={tab.id}
            className={`tab ${selectedTab === tab.id ? 'selected' : ''}`}
            onClick={() => setSelectedTab(tab.id)}
            data-id={tab.id}
          >
            <div className="tab-logo">
              {tab.icon} 
            </div>
            <span>{tab.label}</span>
          </li>
        ))}
      </ul>

      <div className="tab-content">
        {tabsData.map((tab) => (
          selectedTab === tab.id && (
            <CodeSnippet 
              key={tab.id}
              code={codeSnippets[tab.id] || ''} // Get code from codeSnippets
              language="typescript" 
            />
          )
        ))}
      </div>
    </div>
  );
};

export default Tabs;
