'use client'

import { useState, useRef, useEffect } from 'react'
import { TokenInfo } from '@/lib/tokens'
import { FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa'
import { RiCoinLine } from 'react-icons/ri'

interface TokenSelectorProps {
  tokens: TokenInfo[]
  selectedToken?: TokenInfo
  onTokenSelect: (token: TokenInfo) => void
  placeholder?: string
  disabled?: boolean
  excludeTokens?: TokenInfo[]
}

export function TokenSelector({
  tokens,
  selectedToken,
  onTokenSelect,
  placeholder = '토큰 선택',
  disabled = false,
  excludeTokens = []
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 제외할 토큰 필터링
  const availableTokens = tokens.filter(token => 
    !excludeTokens.some(excludeToken => 
      excludeToken.address.toLowerCase() === token.address.toLowerCase()
    )
  )

  // 검색 필터링
  const filteredTokens = availableTokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleTokenSelect = (token: TokenInfo) => {
    onTokenSelect(token)
    setIsOpen(false)
    setSearchQuery('')
  }

  const clearSelection = () => {
    setSearchQuery('')
    // 선택 해제는 부모 컴포넌트에서 처리
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
          disabled
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
            : 'bg-white border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        }`}
      >
        <div className="flex items-center space-x-3">
          {selectedToken ? (
            <>
              <div className={`w-6 h-6 ${selectedToken.color || 'bg-gray-400'} rounded-full flex items-center justify-center`}>
                <RiCoinLine className="text-white text-xs" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">{selectedToken.symbol}</div>
                <div className="text-xs text-gray-500">{selectedToken.name}</div>
              </div>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        
        <FaChevronDown 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* 검색 박스 */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="토큰 검색..."
                className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSelection}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>
          </div>

          {/* 토큰 목록 */}
          <div className="max-h-60 overflow-y-auto">
            {filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchQuery ? '검색 결과가 없습니다.' : '사용 가능한 토큰이 없습니다.'}
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => handleTokenSelect(token)}
                  className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors ${
                    selectedToken?.address === token.address ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className={`w-8 h-8 ${token.color || 'bg-gray-400'} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <RiCoinLine className="text-white text-sm" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-800">{token.symbol}</div>
                    <div className="text-xs text-gray-500">{token.name}</div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {`${token.address.slice(0, 6)}...${token.address.slice(-4)}`}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}