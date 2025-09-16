import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AvailabilityCalendarProps {
  availableDates?: string[];
  bookedDates?: string[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availableDates = [],
  bookedDates = [],
  selectedDate,
  onDateSelect,
}) => {
  const [displayDate, setDisplayDate] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);
  const bookedDateSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const changeMonth = (offset: number) => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const daysInMonth = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [displayDate]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="font-semibold text-gray-800">
          {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
        {weekDays.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />;

          const dateString = day.toISOString().split('T')[0];
          const isSelected = selectedDate === dateString;
          const isBooked = bookedDateSet.has(dateString);
          const isAvailable = availableDateSet.has(dateString);
          const isPast = day < today;
          const isDisabled = isPast || !isAvailable || isBooked;

          let buttonClass = 'w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ';

          if (isDisabled) {
            buttonClass += 'cursor-not-allowed ';
            if (isBooked) {
              buttonClass += 'bg-red-100 text-red-400 line-through';
            } else {
              buttonClass += 'text-gray-300';
            }
          } else {
            buttonClass += 'hover:bg-red-100 ';
            if (isSelected) {
              buttonClass += 'bg-primary text-white font-semibold';
            } else {
              buttonClass += 'text-gray-700 font-medium';
            }
          }
          
          if (day.getTime() === today.getTime() && !isSelected) {
            buttonClass += ' border-2 border-primary';
          }

          return (
            <button
              key={dateString}
              disabled={isDisabled}
              onClick={() => onDateSelect(dateString)}
              className={buttonClass}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full border border-gray-700 mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-100 mr-2"></div>
          <span className="line-through">Booked</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
