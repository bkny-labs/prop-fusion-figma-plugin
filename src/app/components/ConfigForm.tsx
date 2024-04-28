import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { FaAngular, FaCss3, FaReact, FaVuejs } from 'react-icons/fa';
import { SiFlutter, SiSass, SiTypescript, SiWebcomponentsdotorg } from 'react-icons/si';

const ConfigForm = forwardRef((props, ref) => {
  const [framework, setFramework] = useState('react');
  const [typescript, setTypescript] = useState(true);
  const [styles, setStyles] = useState('css');

  const handleSubmit = (event) => {
    event.preventDefault();
    parent.postMessage({ 
      pluginMessage: { 
        type: 'set-config', 
        config: { framework, typescript, styles } 
      } 
    }, '*');
  };

  useImperativeHandle(ref, () => ({
    handleSubmit
  }));

  const frameworks = [
    { value: 'angular', label: 'Angular', Icon: FaAngular, color: '#DD0031' },
    { value: 'react', label: 'React', Icon: FaReact, color: '#61DAFB'},
    { value: 'vue', label: 'Vue', Icon: FaVuejs, color: '#4FC08D' },
    { value: 'flutter', label: 'Flutter', Icon: SiFlutter, color: '#02569B' },
    { value: 'web-components', label: 'Web Components', Icon: SiWebcomponentsdotorg, color: '#29ABE2' },
  ];


  return (
    <form onSubmit={handleSubmit}>
      <h3>Select a framework</h3>
      <div className="frameworks">
        {frameworks.map(({ value, label, Icon, color }) => (
            <label key={value} className="tooltip" data-tooltip={label} style={{ backgroundColor: framework === value ? color : '', }}>
              <input type="radio" name="framework" value={value} checked={framework === value} onChange={e => setFramework(e.target.value)} />
              <Icon color={framework === value ? '#fff' : color} />
            </label>
        ))}
      </div>
      <h3>Typescript</h3>
      <div className="">
        <label className="tooltip" data-tooltip="Typescript" style={{ backgroundColor: typescript ? '#3178C6' : '' }}>
          <input type="checkbox" checked={typescript} onChange={e => setTypescript(e.target.checked)} />
          <SiTypescript color={typescript ? '#fff' : '#3178C6'} />
        </label>
      </div>
      <h3>Styles</h3>
      <label>
        <label className="tooltip" data-tooltip="SCSS" style={{ backgroundColor: styles === 'scss' ? '#CF649A' : '' }}>
          <input type="radio" value="scss" checked={styles === 'scss'} onChange={e => setStyles(e.target.value)} />
          <SiSass color={styles === 'scss' ? '#fff' : '#CF649A'} />
        </label>
        <label className="tooltip" data-tooltip="CSS" style={{ backgroundColor: styles === 'css' ? '#2965F1' : '' }}>
          <input type="radio" value="css" checked={styles === 'css'} onChange={e => setStyles(e.target.value)} />
          <FaCss3 color={styles === 'css' ? '#fff' : '#2965F1'} />
        </label>
      </label>
    </form>
  );
});

export default ConfigForm;