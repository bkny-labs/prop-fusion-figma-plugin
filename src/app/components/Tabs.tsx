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
  showTabs?: string[];
}

const Tabs: React.FC<TabsProps> = ({ style, codeSnippets, showTabs }) => {
  const [selectedTab, setSelectedTab] = useState<string>(showTabs ? showTabs[0] : '');
  const [selectedTab2, setSelectedTab2] = useState<string>(showTabs ? showTabs[2] : '');

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
    {
      id: 'css', label: 'CSS', icon: <FaCss3Alt />,
      code: undefined
    },
    {
      id: 'scss', label: 'SCSS', icon: <FaSass />,
      code: undefined
    },
    {
      id: 'typescript', label: 'TypeScript', icon: <SiTypescript />,
      code: undefined
    }
  ];


  const filteredTabsData = showTabs 
    ? tabsData.filter(tab => showTabs.includes(tab.id))
    : tabsData;

  return (
    <>
      <div className="tabs-container" style={style}> 
        <ul className="tabs-list">
          {filteredTabsData.map((tab) => (
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
          {filteredTabsData.map((tab) => (
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
    </>
  );
};

export default Tabs;
