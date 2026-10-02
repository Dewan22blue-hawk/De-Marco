"use client"

import React, { useState, KeyboardEvent } from "react"
import { X } from "lucide-react"

export function TagsInput({
  value,
  onChange,
  placeholder = "Add a tag...",
}: {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const newTag = inputValue.trim()
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag])
      }
      setInputValue("")
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 w-full rounded-xl bg-surface-container-low border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all min-h-[44px]">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-sm rounded-lg"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-primary hover:text-primary/70 focus:outline-none"
          >
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 bg-transparent outline-none min-w-[120px] text-on-surface text-sm px-1"
      />
    </div>
  )
}
