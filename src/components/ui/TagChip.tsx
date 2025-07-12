'use client';

import { useState } from 'react';

interface TagChipProps {
  tag: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  selected: boolean;
  onClick: (tag: string) => void;
}

export function TagChip({ tag, category, selected, onClick }: TagChipProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(tag)}
      className={`
        inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium 
        transition-all duration-200 border cursor-pointer
        ${selected 
          ? `${category.color} shadow-md transform scale-105` 
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }
      `}
    >
      <span className="mr-1.5 text-xs">{category.icon}</span>
      {tag}
      {selected && (
        <span className="ml-1.5 text-xs">✓</span>
      )}
    </button>
  );
}

interface CupNoteTagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  categories: Record<string, {
    name: string;
    icon: string;
    color: string;
    tags: readonly string[];
  }>;
  maxTags?: number;
}

export function CupNoteTagSelector({ 
  selectedTags, 
  onTagsChange, 
  categories,
  maxTags = 10 
}: CupNoteTagSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('fruits');
  const [searchTerm, setSearchTerm] = useState('');

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      // Add tag (if under limit)
      if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tag]);
      }
    }
  };

  const filteredTags = searchTerm 
    ? Object.values(categories)
        .flatMap(category => category.tags.filter(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    : categories[activeCategory]?.tags || [];

  return (
    <div className="space-y-4">
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              선택된 컵노트 ({selectedTags.length}/{maxTags})
            </h4>
            <button
              type="button"
              onClick={() => onTagsChange([])}
              className="text-xs text-red-600 hover:text-red-800"
            >
              모두 제거
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => {
              const categoryKey = Object.keys(categories).find(key =>
                categories[key].tags.includes(tag)
              );
              const category = categoryKey ? categories[categoryKey] : categories.others;
              
              return (
                <TagChip
                  key={tag}
                  tag={tag}
                  category={category}
                  selected={true}
                  onClick={handleTagToggle}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="컵노트 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Tabs */}
      {!searchTerm && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-2 overflow-x-auto">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap
                  ${activeCategory === key
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-1.5">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Tags Grid */}
      <div className="max-h-64 overflow-y-auto">
        {filteredTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filteredTags.map(tag => {
              const categoryKey = searchTerm 
                ? Object.keys(categories).find(key => categories[key].tags.includes(tag))
                : activeCategory;
              const category = categoryKey ? categories[categoryKey] : categories.others;
              
              return (
                <TagChip
                  key={tag}
                  tag={tag}
                  category={category}
                  selected={selectedTags.includes(tag)}
                  onClick={handleTagToggle}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '태그가 없습니다.'}
          </div>
        )}
      </div>

      {/* Usage Hint */}
      <div className="text-xs text-gray-500">
        💡 최대 {maxTags}개까지 선택 가능하며, 선택된 태그를 다시 클릭하면 제거됩니다.
      </div>
    </div>
  );
}