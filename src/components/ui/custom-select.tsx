"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  dropdownClassName?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  dropdownClassName = ""
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-surface-container-low border transition-colors text-sm font-medium ${
          isOpen ? "border-primary text-primary" : "border-outline-variant/30 text-on-surface hover:border-outline-variant/60"
        } focus:outline-none focus:border-primary`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 z-50 mt-1 w-full min-w-max bg-surface border border-outline-variant/20 rounded-2xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${dropdownClassName}`}>
          <ul className="max-h-60 overflow-auto py-1 outline-none" role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  value === option.value
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
