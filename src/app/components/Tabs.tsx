import React, { useState, CSSProperties } from 'react';
import { FaAngular, FaCss3Alt, FaReact, FaSass } from 'react-icons/fa';
import { TbBrandFlutter, TbBrandVue } from "react-icons/tb";
import { SiTypescript, SiWebcomponentsdotorg } from "react-icons/si";
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
  const [selectedTab2, setSelectedTab2] = useState<string>('typescript');

  const tabsData: TabData[] = [
    {
      id: 'react', label: 'React', icon: <FaReact />,
      code: undefined
    },
    {
      id: 'angular', label: 'Angular', icon: <FaAngular />,
      code: undefined
    },
    {
      id: 'flutter', label: 'Flutter', icon: <TbBrandFlutter />,
      code: undefined
    },
    {
      id: 'vue', label: 'Vue', icon: <TbBrandVue />,
      code: undefined
    },
    {
      id: 'webComponents', label: 'WC', icon: <SiWebcomponentsdotorg />,
      code: undefined
    },
  ];

  const tabs2Data: TabData[] = [
    {
      id: 'typescript', label: 'TypeScript', icon: <SiTypescript />,
      code: undefined
    },
    {
      id: 'css', label: 'CSS', icon: <FaCss3Alt />,
      code: undefined
    },
    {
      id: 'scss', label: 'SCSS', icon: <FaSass />,
      code: undefined
    }
  ];

  return (
    <>
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
                code={codeSnippets[tab.id] || ''}
                language="typescript" 
              />
            )
          ))}
        </div>
      </div>
      <div className="tabs-container" style={style}> 
        <ul className="tabs-list">
          {tabs2Data.map((tab) => (
            <li
              key={tab.id}
              className={`tab ${selectedTab2 === tab.id ? 'selected' : ''}`}
              onClick={() => setSelectedTab2(tab.id)}
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
          {tabs2Data.map((tab) => (
            selectedTab2 === tab.id && (
              <CodeSnippet 
                key={tab.id}
                code={codeSnippets[tab.id] || ''}
                language="typescript" 
              />
            )
          ))}
      </div>
    </div>
    </>
  );
};

export default Tabs;
