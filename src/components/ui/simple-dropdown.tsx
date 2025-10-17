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
        className="w-full h-9 px-3 py-1 text-left backdrop-blur-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-colors border border-[hsl(var(--primary))]/60 bg-primary/10 text-primary hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform text-primary ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/60 dark:bg-white/20 backdrop-blur-md border border-[hsl(var(--primary))]/40 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className="w-full px-3 py-2 text-left text-gray-900 dark:text-gray-100 hover:bg-primary/10 hover:text-primary transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
