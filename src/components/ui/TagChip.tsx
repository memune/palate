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
          ? 'bg-emerald-800 text-white border-emerald-800 shadow-md transform scale-105' 
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
            {Object.entries(categories).map(([key, category]) => {
              // 현재 카테고리에서 선택된 태그 수 계산
              const selectedInCategory = selectedTags.filter(tag => 
                category.tags.includes(tag)
              ).length;
              
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className={`
                    flex items-center px-3 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-all border
                    ${activeCategory === key
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{category.name}</span>
                  {selectedInCategory > 0 && (
                    <span 
                      className={`
                        ml-1.5 px-1.5 py-0.5 text-xs rounded-full font-semibold
                        ${activeCategory === key
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-800 text-white'
                        }
                      `}
                    >
                      {selectedInCategory}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Tags Grid */}
      <div className="max-h-64 overflow-y-auto">
        {filteredTags.length > 0 ? (
          <div className="space-y-3">
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
            {/* 직접 입력하기 옵션 */}
            {searchTerm && selectedTags.length < maxTags && (
              <button
                type="button"
                onClick={() => {
                  if (searchTerm && !selectedTags.includes(searchTerm)) {
                    handleTagToggle(searchTerm);
                    setSearchTerm('');
                  }
                }}
                className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-700">직접 입력하기</div>
                <div className="text-xs text-gray-500">&ldquo;{searchTerm}&rdquo; 태그 추가</div>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4 text-gray-500">
              <div className="text-sm">
                {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '태그가 없습니다.'}
              </div>
            </div>
            {/* 검색결과 없을 때 직접 입력 옵션 */}
            {searchTerm && selectedTags.length < maxTags && (
              <button
                type="button"
                onClick={() => {
                  if (searchTerm && !selectedTags.includes(searchTerm)) {
                    handleTagToggle(searchTerm);
                    setSearchTerm('');
                  }
                }}
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-emerald-700">직접 입력하기</div>
                <div className="text-xs text-emerald-600">&ldquo;{searchTerm}&rdquo; 태그 추가</div>
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}