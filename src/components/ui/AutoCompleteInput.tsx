'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MatchResult } from '@/lib/coffee-data-matcher';

interface AutoCompleteInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onMatch?: (match: MatchResult | null) => void;
  placeholder?: string;
  required?: boolean;
  matcher: (input: string) => MatchResult | null;
  suggestions: readonly { id: string; name: string; englishName: string }[];
  className?: string;
}

export default function AutoCompleteInput({
  label,
  name,
  value,
  onChange,
  onMatch,
  placeholder,
  required = false,
  matcher,
  suggestions,
  className = ''
}: AutoCompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 입력값 변경 시 매칭 시도
  useEffect(() => {
    if (value.trim().length === 0) {
      setMatchResult(null);
      setFilteredSuggestions(suggestions);
      setIsOpen(false);
      onMatch?.(null);
      return;
    }

    const match = matcher(value);
    setMatchResult(match);
    onMatch?.(match);

    // 신뢰도가 낮거나 매칭되지 않으면 드롭다운 표시
    if (!match || match.confidence < 85) {
      const filtered = suggestions.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.englishName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setIsOpen(false);
    }
  }, [value, matcher, suggestions, onMatch]);

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
    onChange(e.target.value);
    setHighlightedIndex(-1);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    if (filteredSuggestions.length > 0 && (!matchResult || matchResult.confidence < 85)) {
      setIsOpen(true);
    }
  }, [filteredSuggestions.length, matchResult]);

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
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-stone-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
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
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className={`w-full px-4 py-3 text-left hover:bg-stone-50 border-b border-stone-100 last:border-b-0 transition-colors ${
                index === highlightedIndex ? 'bg-emerald-50 border-emerald-200' : ''
              }`}
            >
              <div className="font-medium text-stone-900">{item.name}</div>
              {item.englishName !== item.name && (
                <div className="text-sm text-stone-500">{item.englishName}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}