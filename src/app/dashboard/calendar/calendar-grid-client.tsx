"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon, FileText } from "lucide-react"
import Link from "next/link"

export function CalendarGridClient({ events }: { events: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Generate calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  const days = []
  
  // Padding for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentYear, currentMonth, i))
  }

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))

  const today = new Date()
  const isToday = (date: Date) => 
    date.getDate() === today.getDate() && 
    date.getMonth() === today.getMonth() && 
    date.getFullYear() === today.getFullYear()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 clay-surface">
        <h2 className="text-xl font-bold text-on-surface">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-lg hover:bg-surface-container transition-colors text-sm font-semibold text-on-surface">
            Today
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-bold text-sm text-on-surface-variant py-2">
            {day}
          </div>
        ))}
        
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="min-h-[120px] rounded-xl bg-surface-container-lowest/50" />
          
          // Find events for this day
          const dayEvents = events.filter(e => {
            const eventDate = new Date(e.scheduled_at)
            return eventDate.getDate() === date.getDate() &&
                   eventDate.getMonth() === date.getMonth() &&
                   eventDate.getFullYear() === date.getFullYear()
          })

          return (
            <div key={i} className={`min-h-[120px] p-2 rounded-xl border transition-all ${
              isToday(date) 
                ? 'border-primary/50 bg-primary/5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_2px_8px_rgba(var(--color-primary-rgb),0.1)]' 
                : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                  isToday(date) ? 'bg-primary text-on-primary' : 'text-on-surface'
                }`}>
                  {date.getDate()}
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                {dayEvents.map(event => (
                  <Link 
                    href={`/dashboard/contents/${event.content_id}`} 
                    key={event.id}
                    className="flex flex-col gap-1 p-2 rounded-lg bg-surface text-xs border border-outline-variant/30 hover:border-primary/50 hover:shadow-sm transition-all group"
                  >
                    <div className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {event.content?.title || 'Untitled'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant font-medium capitalize flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {event.platform || 'General'}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        event.status === 'published' ? 'bg-emerald-500' :
                        event.status === 'scheduled' ? 'bg-amber-500' : 'bg-primary'
                      }`} title={event.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
