"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Append time so it's parsed in the local timezone instead of UTC midnight to prevent the "day before" display bug
  const dateValue = value ? new Date(value.includes('T') ? value : `${value}T00:00:00`) : undefined

  // Control the currently visible month
  const [month, setMonth] = React.useState<Date>(dateValue || new Date());
  
  // Custom View State: 'days' | 'months' | 'years'
  const [view, setView] = React.useState<'days' | 'months' | 'years'>('days');
  const [yearPage, setYearPage] = React.useState<number>(month.getFullYear());

  // Ensure calendar opens to the selected date's month and default view
  React.useEffect(() => {
    if (isOpen) {
      if (dateValue) {
        setMonth(dateValue);
        setYearPage(dateValue.getFullYear());
      } else {
        const now = new Date();
        setMonth(now);
        setYearPage(now.getFullYear());
      }
      setView('days');
    }
  }, [isOpen, value]);

  const handleMonthSelect = (monthIndex: number) => {
    setMonth(new Date(month.getFullYear(), monthIndex, month.getDate()));
    setView('days');
  };

  const handleYearSelect = (selectedYear: number) => {
    setMonth(new Date(selectedYear, month.getMonth(), month.getDate()));
    setView('months');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-12 rounded-xl",
            !dateValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        
        {view === 'days' && (
          <Calendar
            mode="single"
            selected={dateValue}
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              if (date && onChange) {
                // Format the actual local date chosen by the user safely
                onChange(format(date, "yyyy-MM-dd"));
                setMonth(date); // Update calendar view to the selected month
                setIsOpen(false);
              }
            }}
            initialFocus
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            components={{
              CaptionLabel: ({ displayMonth }) => (
                <button
                  type="button"
                  className="text-sm font-medium hover:bg-muted px-2 py-1 rounded-md transition-colors z-50 pointer-events-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setView('months');
                  }}
                >
                  {format(displayMonth, "MMMM yyyy")}
                </button>
              )
            }}
          />
        )}

        {view === 'months' && (
          <div className="w-[280px] p-3">
            <div className="flex items-center justify-between pt-1 relative mb-4">
              <Button 
                variant="outline" 
                className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100" 
                onClick={() => setMonth(new Date(month.getFullYear() - 1, month.getMonth(), 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <button 
                className="text-sm font-medium hover:bg-muted px-2 py-1 rounded-md transition-colors"
                onClick={() => {
                  setYearPage(month.getFullYear());
                  setView('years');
                }}
              >
                {month.getFullYear()}
              </button>
              <Button 
                variant="outline" 
                className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100" 
                onClick={() => setMonth(new Date(month.getFullYear() + 1, month.getMonth(), 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Button
                  key={i}
                  variant={month.getMonth() === i ? "default" : "ghost"}
                  className="h-10 w-full font-normal"
                  onClick={() => handleMonthSelect(i)}
                >
                  {format(new Date(2000, i, 1), "MMM")}
                </Button>
              ))}
            </div>
          </div>
        )}

        {view === 'years' && (
          <div className="w-[280px] p-3">
            <div className="flex items-center justify-between pt-1 relative mb-4">
              <Button 
                variant="outline" 
                className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100" 
                onClick={() => setYearPage(yearPage - 12)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                {Math.floor(yearPage / 12) * 12} - {Math.floor(yearPage / 12) * 12 + 11}
              </div>
              <Button 
                variant="outline" 
                className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100" 
                onClick={() => setYearPage(yearPage + 12)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {Array.from({ length: 12 }).map((_, i) => {
                const startYear = Math.floor(yearPage / 12) * 12;
                const currentYear = startYear + i;
                return (
                  <Button
                    key={i}
                    variant={month.getFullYear() === currentYear ? "default" : "ghost"}
                    className="h-10 w-full font-normal"
                    onClick={() => handleYearSelect(currentYear)}
                  >
                    {currentYear}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

      </PopoverContent>
    </Popover>
  )
}
