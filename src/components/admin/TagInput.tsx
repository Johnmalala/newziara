import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700">
      {value.map(tag => (
        <div key={tag} className="flex items-center bg-primary/10 text-primary text-sm font-medium px-2 py-1 rounded">
          <span>{tag}</span>
          <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-red-700 dark:hover:text-red-400">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Add a tag and press Enter..."}
        className="flex-grow bg-transparent border-none focus:ring-0 p-1 text-sm text-gray-900 dark:text-white"
      />
    </div>
  );
};

export default TagInput;
