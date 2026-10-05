"use client"

import * as React from "react"
import { Calendar } from "lucide-react"

export interface DatetimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  className?: string
}

export function DatetimePicker({
  name,
  value,
  onChange,
  required = false,
  className = "",
  ...props
}: DatetimePickerProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Visual wrapper matching CustomSelect styling */}
      <div className="relative flex items-center w-full rounded-2xl bg-surface-container-low border border-outline-variant/30 transition-colors hover:border-outline-variant/60 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden">
        
        {/* Left Icon */}
        <div className="pl-4 pr-3 text-outline transition-colors group-focus-within:text-primary">
          <Calendar size={18} />
        </div>

        {/* The actual native input */}
        <input
          type="datetime-local"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="relative w-full py-3 bg-transparent outline-none pr-4 text-sm font-medium text-on-surface [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          {...props}
        />
      </div>
    </div>
  )
}
