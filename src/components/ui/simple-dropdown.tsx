'use client'

import React, { useRef, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface SimpleDropdownProps {
  id: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function SimpleDropdown({ 
  id, 
  value, 
  options, 
  onChange, 
  disabled = false, 
  placeholder = "Select option"
}: SimpleDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find(option => option.value === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className="w-full h-9 px-3 py-1 text-left bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 rounded-lg text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between hover:bg-white/30 dark:hover:bg-white/20 transition-colors"
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/40 dark:bg-white/30 backdrop-blur-md border border-white/30 dark:border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className="w-full px-3 py-2 text-left text-gray-900 dark:text-gray-100 hover:bg-white/30 dark:hover:bg-white/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
