// src/hooks/useRelatedDropdowns.js
import { useState, useEffect } from 'react';

export function useRelatedDropdowns(relationshipMap) {
  const [primarySelection, setPrimarySelection] = useState('');
  const [secondaryOptions, setSecondaryOptions] = useState([]);
  const [secondarySelection, setSecondarySelection] = useState('');

  // Update secondary options when primary selection changes
  useEffect(() => {
    if (primarySelection) {
      const validOptions = relationshipMap[primarySelection] || [];
      setSecondaryOptions(validOptions);
      
      // Clear secondary selection if not valid for new primary
      if (secondarySelection && !validOptions.includes(secondarySelection)) {
        setSecondarySelection('');
      }
    } else {
      setSecondaryOptions([]);
      setSecondarySelection('');
    }
  }, [primarySelection, relationshipMap, secondarySelection]);

  const handlePrimaryChange = (value) => {
    setPrimarySelection(value);
  };

  const handleSecondaryChange = (value) => {
    setSecondarySelection(value);
  };

  return {
    primarySelection,
    secondarySelection,
    secondaryOptions,
    handlePrimaryChange,
    handleSecondaryChange,
    setPrimarySelection,
    setSecondarySelection
  };
}