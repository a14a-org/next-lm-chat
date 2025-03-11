import React from 'react';
import ReactDOM from 'react-dom';
import SettingsDropdown from './SettingsDropdown';
import { Model } from '../types';

interface SettingsPortalProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  maxTokens: number;
  onChangeMaxTokens: (value: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const SettingsPortal: React.FC<SettingsPortalProps> = props => {
  // Only run once the component has mounted on the client
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Add a class to the body to prevent any scrolling issues
    document.body.classList.add('has-settings-portal');

    return () => {
      setMounted(false);
      document.body.classList.remove('has-settings-portal');
    };
  }, []);

  // If not mounted yet (SSR), render nothing
  if (!mounted) return null;

  // Portal target - render at the document body level
  return ReactDOM.createPortal(
    <div
      className="fixed z-[9999]"
      style={{
        top: 'calc(5vh)',
        right: 'calc(5vw)',
        // Ensure it's not affected by page scaling or zoom
        transform: 'translate(0, 0)',
        // Add a subtle transition for any adjustments
        transition: 'top 0.3s ease, right 0.3s ease',
      }}
    >
      <SettingsDropdown {...props} />
    </div>,
    document.body
  );
};

export default SettingsPortal;
