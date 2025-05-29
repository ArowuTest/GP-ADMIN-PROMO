// src/components/draw/DrawCalendar.tsx
import React, { useState } from 'react';
import './DrawCalendar.css';

interface DrawCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

const DrawCalendar: React.FC<DrawCalendarProps> = ({ onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const getDayOfWeek = (date: Date) => {
    return date.getDay();
  };
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Check if date is selected
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Handle date click
  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };
  
  // Render calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = getDayOfWeek(date);
      
      // Determine day classes
      let dayClasses = 'calendar-day';
      if (isToday(date)) dayClasses += ' today';
      if (isSelected(date)) dayClasses += ' selected';
      
      // Weekend styling
      if (dayOfWeek === 0 || dayOfWeek === 6) dayClasses += ' weekend';
      
      days.push(
        <div 
          key={day} 
          className={dayClasses}
          onClick={() => handleDateClick(date)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };
  
  // Get month name
  const getMonthName = (month: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
  };
  
  return (
    <div className="draw-calendar">
      <div className="calendar-header">
        <button className="calendar-nav-button" onClick={prevMonth}>
          <span className="material-icons">chevron_left</span>
        </button>
        <h3 className="calendar-title">
          {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
        </h3>
        <button className="calendar-nav-button" onClick={nextMonth}>
          <span className="material-icons">chevron_right</span>
        </button>
      </div>
      
      <div className="calendar-weekdays">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
      </div>
      
      <div className="calendar-days">
        {renderCalendar()}
      </div>
      
      {selectedDate && (
        <div className="selected-date-display">
          Selected: <strong>{formatDate(selectedDate)}</strong>
        </div>
      )}
    </div>
  );
};

export default DrawCalendar;
