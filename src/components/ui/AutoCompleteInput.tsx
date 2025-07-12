'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MatchResult } from '@/lib/coffee-data-matcher';

interface AutoCompleteInputProps {
  label: string;
  name: string;
  value?: string; // optional for uncontrolled mode
  defaultValue?: string; // for uncontrolled mode
  onChange: (value: string) => void;
  onMatch?: (match: MatchResult | null) => void;
  placeholder?: string;
  required?: boolean;
  matcher: (input: string) => MatchResult | null;
  suggestions: readonly { id: string; name: string; englishName: string }[];
  className?: string;
  dropdownHeader?: string; // 드롭다운 헤더 텍스트
  uncontrolled?: boolean; // 새로운 prop
}

export default function AutoCompleteInput({
  label,
  name,
  value,
  defaultValue,
  onChange,
  onMatch,
  placeholder,
  required = false,
  matcher,
  suggestions,
  className = '',
  dropdownHeader,
  uncontrolled = false
}: AutoCompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasFocused, setHasFocused] = useState(false); // 포커스 여부 추적
  const [internalValue, setInternalValue] = useState(defaultValue || ''); // uncontrolled 모드용 내부 상태
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // controlled vs uncontrolled 모드에 따른 현재 값
  const currentValue = uncontrolled ? internalValue : (value || '');

  // 입력값 변경 시 매칭 시도
  useEffect(() => {
    if (currentValue.trim().length === 0) {
      setMatchResult(null);
      setFilteredSuggestions(suggestions);
      // 포커스된 상태에서만 드롭다운 열기 (새로고침 시 자동으로 열리지 않도록)
      setIsOpen(hasFocused && suggestions.length > 0);
      onMatch?.(null);
      return;
    }

    const match = matcher(currentValue);
    setMatchResult(match);
    onMatch?.(match);

    // 항상 관련 추천을 보여줌 (입력이 있을 때)
    const filtered = suggestions.filter(item => {
      const lowerValue = currentValue.toLowerCase();
      const lowerName = item.name.toLowerCase();
      const lowerEnglish = item.englishName.toLowerCase();
      
      return lowerName.includes(lowerValue) || 
             lowerEnglish.includes(lowerValue) ||
             lowerName.startsWith(lowerValue) ||
             lowerEnglish.startsWith(lowerValue);
    });

    // 매칭된 항목이 있어도 다른 관련 옵션들 보여주기
    if (match && match.confidence >= 85) {
      // 매칭된 항목을 제외하고 관련 항목들 보여주기
      const otherSuggestions = filtered.filter(item => 
        item.id !== match.id
      );
      setFilteredSuggestions(otherSuggestions);
      setIsOpen(otherSuggestions.length > 0 && currentValue.length >= 2);
    } else {
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0 && currentValue.length >= 1);
    }
  }, [currentValue, matcher, suggestions, onMatch, hasFocused, uncontrolled]);

  // suggestions prop이 변경될 때 filteredSuggestions 업데이트
  useEffect(() => {
    setFilteredSuggestions(suggestions);
    // 포커스된 상태이고 입력이 비어있으면 새로운 suggestions로 드롭다운 열기
    if (hasFocused && currentValue.trim().length === 0 && suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [suggestions, hasFocused, currentValue]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((item: { id: string; name: string; englishName: string }) => {
    console.log('handleSelect called with:', item);
    console.log('onChange function:', onChange);
    onChange(item.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, [onChange]);

  // 키보드 네비게이션
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          handleSelect(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, filteredSuggestions, highlightedIndex, handleSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (uncontrolled) {
      setInternalValue(newValue);
    }
    onChange(newValue);
    setHighlightedIndex(-1);
  }, [onChange, uncontrolled]);

  const handleFocus = useCallback(() => {
    console.log('Field focused, name:', name, 'suggestions count:', suggestions.length);
    setHasFocused(true); // 포커스 상태 설정
    
    // 포커스시 항상 드롭다운 보여주기
    if (currentValue.length >= 1) {
      const filtered = suggestions.filter(item => {
        const lowerValue = currentValue.toLowerCase();
        const lowerName = item.name.toLowerCase();
        const lowerEnglish = item.englishName.toLowerCase();
        
        return lowerName.includes(lowerValue) || 
               lowerEnglish.includes(lowerValue) ||
               lowerName.startsWith(lowerValue) ||
               lowerEnglish.startsWith(lowerValue);
      });
      
      if (matchResult && matchResult.confidence >= 85) {
        // 매칭된 항목 제외하고 보여주기
        const otherSuggestions = filtered.filter(item => 
          item.id !== matchResult.id
        );
        setFilteredSuggestions(otherSuggestions);
        setIsOpen(otherSuggestions.length > 0);
      } else {
        setFilteredSuggestions(filtered);
        setIsOpen(filtered.length > 0);
      }
    } else {
      // 빈 입력시에는 모든 옵션 보여주기
      setFilteredSuggestions(suggestions);
      setIsOpen(suggestions.length > 0);
    }
  }, [currentValue, suggestions, matchResult, name]);

  // 매칭 상태에 따른 스타일
  const getInputStyle = () => {
    if (matchResult) {
      if (matchResult.confidence >= 90) {
        return 'border-emerald-400 bg-emerald-50';
      } else if (matchResult.confidence >= 75) {
        return 'border-yellow-400 bg-yellow-50';
      }
    }
    return 'border-stone-300';
  };

  return (
    <div className={`relative ${className}`} style={{ zIndex: isOpen ? 1000 : 'auto' }}>
      <label className="block text-sm font-medium text-stone-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          {...(uncontrolled ? { defaultValue: defaultValue } : { value: currentValue })}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${getInputStyle()}`}
          autoComplete="off"
        />

        {/* 매칭 상태 표시 */}
        {matchResult && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {matchResult.confidence >= 90 ? (
              <div className="flex items-center text-emerald-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 매칭 결과 표시 */}
      {matchResult && (
        <div className="mt-1 text-sm">
          {matchResult.confidence >= 90 ? (
            <span className="text-emerald-600">✓ {matchResult.name} 으로 인식됨</span>
          ) : (
            <span className="text-yellow-600">
              ⚠ {matchResult.name}와 {matchResult.confidence}% 일치 - 정확한지 확인해주세요
            </span>
          )}
        </div>
      )}

      {/* 드롭다운 제안 목록 */}
      {(() => {
        console.log('Dropdown render check - name:', name, 'isOpen:', isOpen, 'suggestions:', filteredSuggestions.length);
        return null;
      })()}
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{ zIndex: 9999, pointerEvents: 'auto' }}
          onClick={() => console.log('Dropdown clicked')}
        >
          {/* 헤더 - 매칭 상태에 따라 다르게 표시 */}
          {matchResult && matchResult.confidence >= 85 && (
            <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-sm">
              <span className="text-emerald-700 font-medium">
                ✓ &ldquo;{matchResult.name}&rdquo; 인식됨
              </span>
              <span className="text-emerald-600 ml-2">다른 옵션:</span>
            </div>
          )}
          {(!matchResult || matchResult.confidence < 85) && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-sm">
              <span className="text-blue-700 font-medium">
                {dropdownHeader || (filteredSuggestions.length > 0 ? `💡 추천 ${name}:` : `💡 직접 입력 가능:`)}
              </span>
            </div>
          )}
          
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  console.log('Button clicked!', item.name);
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(item);
                }}
                onMouseDown={(e) => {
                  console.log('Button mouse down!', item.name);
                  e.preventDefault();
                  e.stopPropagation();
                }}
                style={{ pointerEvents: 'auto', zIndex: 100 }}
                className={`w-full px-4 py-3 text-left hover:bg-stone-50 border-b border-stone-100 last:border-b-0 transition-colors cursor-pointer ${
                  index === highlightedIndex ? 'bg-emerald-50 border-emerald-200' : ''
                }`}
              >
                <div className="font-medium text-stone-900">{item.name}</div>
                {item.englishName !== item.name && (
                  <div className="text-sm text-stone-500">{item.englishName}</div>
                )}
              </button>
            ))
          ) : (
            (!matchResult || matchResult.confidence < 85) && currentValue.trim() && (
              <div className="px-4 py-3 text-center text-stone-500">
                <div className="text-sm">&ldquo;{currentValue}&rdquo; 직접 사용 가능</div>
                <div className="text-xs text-stone-400 mt-1">Enter 키를 눌러 입력을 완료하세요</div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}