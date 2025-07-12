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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-800">
              선택된 컵노트 ({selectedTags.length}/{maxTags})
            </h4>
            <button
              type="button"
              onClick={() => onTagsChange([])}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-sm"
          >
            ×
          </button>
        )}
      </div>

      {/* Category Tabs */}
      {!searchTerm && (
        <div className="mb-4">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-hide pb-2">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`
                  px-3 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-all border
                  ${activeCategory === key
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-300'
                  }
                `}
              >
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
            <div className="text-sm">
              {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '태그가 없습니다.'}
            </div>
          </div>
        )}
      </div>

      {/* Usage Hint */}
      <div className="text-xs text-gray-500 text-center mt-4">
        최대 {maxTags}개까지 선택 가능하며, 선택된 태그를 다시 클릭하면 제거됩니다.
      </div>
    </div>
  );
}