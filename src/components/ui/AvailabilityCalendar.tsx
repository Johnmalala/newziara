import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isEqual, 
  addMonths, 
  isPast,
  isWithinInterval,
  parseISO,
  isBefore,
  startOfDay,
  differenceInCalendarDays,
} from 'date-fns';
import toast from 'react-hot-toast';

type Range = { start: string | null; end: string | null };

interface AvailabilityCalendarProps {
  availableDates?: string[];
  bookedDates?: string[];
  onDateSelect: (date: string | null) => void;
  onRangeSelect: (range: Range) => void;
  selectedDate: string | null;
  selectedRange: Range;
  mode: 'single' | 'range';
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availableDates = [],
  bookedDates = [],
  onDateSelect,
  onRangeSelect,
  selectedDate,
  selectedRange,
  mode,
}) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const today = startOfDay(new Date());

  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);
  const bookedDateSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const changeMonth = (offset: number) => {
    setDisplayDate(prev => addMonths(prev, offset));
  };

  const handleDateClick = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    
    if (mode === 'single') {
      onDateSelect(dateString);
    } else {
      const { start, end } = selectedRange;
      if (!start || (start && end)) {
        onRangeSelect({ start: dateString, end: null });
      } else {
        if (isBefore(day, parseISO(start))) {
          onRangeSelect({ start: dateString, end: null });
        } else {
          const interval = { start: parseISO(start), end: day };
          const datesInRange = eachDayOfInterval(interval);
          const isRangeValid = datesInRange.every(d => !bookedDateSet.has(format(d, 'yyyy-MM-dd')));

          if (isRangeValid) {
            onRangeSelect({ start, end: dateString });
          } else {
            toast.error("This date range includes a booked day. Please select a different range.");
            onRangeSelect({ start: dateString, end: null });
          }
        }
      }
    }
  };

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(displayDate);
    const end = endOfMonth(displayDate);
    return eachDayOfInterval({ start, end });
  }, [displayDate]);

  const startingDayIndex = getDay(startOfMonth(displayDate));
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="font-semibold text-gray-800">
          {format(displayDate, 'MMMM yyyy')}
        </div>
        <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: startingDayIndex }).map((_, index) => <div key={`empty-${index}`} />)}
        {daysInMonth.map((day) => {
          const dateString = format(day, 'yyyy-MM-dd');
          
          // State checks
          const isSelected = mode === 'single' && selectedDate === dateString;
          const isStartDate = mode === 'range' && selectedRange.start === dateString;
          const isEndDate = mode === 'range' && selectedRange.end === dateString;
          const isInRange = mode === 'range' && selectedRange.start && selectedRange.end && isWithinInterval(day, { start: parseISO(selectedRange.start), end: parseISO(selectedRange.end) });

          // Availability checks
          const isBooked = bookedDateSet.has(dateString);
          const isAvailable = availableDates.length === 0 || availableDateSet.has(dateString); // If no availability is specified, all dates are available
          const isDayPast = isPast(day) && !isEqual(day, today);
          const isDisabled = isDayPast || !isAvailable || isBooked;

          // Dynamic styling
          let dayClasses = 'w-full h-9 flex items-center justify-center text-sm transition-colors relative ';
          let containerClasses = 'relative';

          if (isDisabled) {
            dayClasses += 'cursor-not-allowed ';
            if (isBooked) dayClasses += 'text-red-400 line-through';
            else dayClasses += 'text-gray-300';
          } else {
            dayClasses += 'hover:bg-red-100 ';
            if (isSelected || isStartDate || isEndDate) {
              dayClasses += 'bg-primary text-white font-semibold rounded-full';
            } else if (isInRange) {
              dayClasses += 'text-primary';
              containerClasses += ' bg-red-50';
              if (getDay(day) === 0) containerClasses += ' rounded-l-full'; // Start of week
              if (getDay(day) === 6) containerClasses += ' rounded-r-full'; // End of week
            } else {
              dayClasses += 'text-gray-700 font-medium rounded-full';
            }
          }

          if (isEqual(day, today) && !isSelected && !isStartDate && !isEndDate) {
            dayClasses += ' border-2 border-primary';
          }

          return (
            <div key={dateString} className={containerClasses}>
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => handleDateClick(day)}
                className={dayClasses}
              >
                {format(day, 'd')}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-primary mr-2"></div><span>Selected</span></div>
        <div className="flex items-center"><div className="w-3 h-3 rounded-full border border-gray-700 mr-2"></div><span>Available</span></div>
        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-100 mr-2"></div><span className="line-through">Booked</span></div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
