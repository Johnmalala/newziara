import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isEqual, addMonths, subMonths, isPast } from 'date-fns';

interface AdminAvailabilityCalendarProps {
  selectedDates: string[];
  onSelectionChange: (dates: string[]) => void;
}

const AdminAvailabilityCalendar: React.FC<AdminAvailabilityCalendarProps> = ({ selectedDates, onSelectionChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selectedDateSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  const handleDateClick = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const newSelectedDates = new Set(selectedDateSet);
    if (newSelectedDates.has(dateString)) {
      newSelectedDates.delete(dateString);
    } else {
      newSelectedDates.add(dateString);
    }
    onSelectionChange(Array.from(newSelectedDates).sort());
  };

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startingDayIndex = getDay(startOfMonth(currentMonth));

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startingDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {days.map(day => {
          const dateString = format(day, 'yyyy-MM-dd');
          const isSelected = selectedDateSet.has(dateString);
          const isDayPast = isPast(day) && !isEqual(day, new Date().setHours(0,0,0,0));
          
          let buttonClass = 'w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ';
          if (isDayPast) {
            buttonClass += 'text-gray-300 cursor-not-allowed';
          } else {
            buttonClass += 'hover:bg-red-100 ';
            if (isSelected) {
              buttonClass += 'bg-primary text-white font-semibold';
            } else {
              buttonClass += 'text-gray-700';
            }
          }

          return (
            <button
              type="button"
              key={dateString}
              disabled={isDayPast}
              onClick={() => handleDateClick(day)}
              className={buttonClass}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminAvailabilityCalendar;
