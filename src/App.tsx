import { useState, useEffect, useRef } from 'react'
import './App.css'

interface TimerButton {
  id: number;
  name: string;
  jobNumber: string;
  elapsedTime: number;
  isActive: boolean;
  startTime?: number; // Track when this timer was last activated
  archived?: boolean; // Track if timer is archived
}

interface EditModalProps {
  timer: TimerButton | null;
  isNew: boolean;
  onSave: (timer: TimerButton) => void;
  onCancel: () => void;
  onArchive?: (id: number) => void;
}

// Edit Modal Component
function EditModal({ timer, isNew, onSave, onCancel, onArchive }: EditModalProps) {
  const [name, setName] = useState(timer?.name || '');
  const [jobNumber, setJobNumber] = useState(timer?.jobNumber || '');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  
  // Set initial time values when the modal opens
  useEffect(() => {
    if (timer && timer.elapsedTime > 0) {
      const totalSeconds = Math.floor(timer.elapsedTime / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    } else {
      setHours(0);
      setMinutes(0);
      setSeconds(0);
    }
  }, [timer]);
  
  const handleSave = () => {
    if (!name.trim() || !jobNumber.trim()) {
      alert('Please enter both job name and job number');
      return;
    }
    
    // Calculate total elapsed time in ms
    const totalMs = ((hours * 60 * 60) + (minutes * 60) + seconds) * 1000;
    
    onSave({
      id: timer?.id || Date.now(),
      name: name.trim(),
      jobNumber: jobNumber.trim(),
      elapsedTime: totalMs,
      isActive: timer?.isActive || false,
      startTime: timer?.startTime,
      archived: timer?.archived || false
    });
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isNew ? 'Add New Job' : 'Edit Job'}</h2>
        
        <div className="form-group">
          <label>Job Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter job name"
          />
        </div>
        
        <div className="form-group">
          <label>Job Number</label>
          <input 
            type="text" 
            value={jobNumber} 
            onChange={(e) => setJobNumber(e.target.value)} 
            placeholder="Enter job number"
          />
        </div>
        
        {!isNew && (
          <div className="form-group time-inputs">
            <label>Time Tracked</label>
            <div className="time-input-group">
              <div className="time-input">
                <input 
                  type="number" 
                  min="0"
                  value={hours} 
                  onChange={(e) => setHours(parseInt(e.target.value) || 0)} 
                />
                <span>hr</span>
              </div>
              <div className="time-input">
                <input 
                  type="number" 
                  min="0"
                  max="59"
                  value={minutes} 
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 0)} 
                />
                <span>min</span>
              </div>
              <div className="time-input">
                <input 
                  type="number" 
                  min="0"
                  max="59"
                  value={seconds} 
                  onChange={(e) => setSeconds(parseInt(e.target.value) || 0)} 
                />
                <span>sec</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save</button>
          {!isNew && onArchive && (
            <button className="btn-archive" onClick={() => onArchive(timer!.id)}>
              Archive Timer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [buttons, setButtons] = useState<TimerButton[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [editingTimer, setEditingTimer] = useState<TimerButton | null>(null);
  const [isNewTimer, setIsNewTimer] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerIdRef = useRef<number | null>(null);

  // Initialize with a few sample buttons
  useEffect(() => {
    const initialButtons = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `Job ${i + 1}`,
      jobNumber: `J${1000 + i}`,
      elapsedTime: 0,
      isActive: false,
      archived: false
    }));
    setButtons(initialButtons);
  }, []);
  
  // Update the current date and time every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Update the active timer every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastUpdate;
      
      setButtons(prev => prev.map(button => 
        button.isActive 
          ? { ...button, elapsedTime: button.elapsedTime + elapsed } 
          : button
      ));
      
      setLastUpdate(now);
    }, 100); // Update more frequently for smoother display

    return () => clearInterval(intervalId);
  }, [lastUpdate]);

  // Format the time in HH:MM:SS
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle long press to edit
  const handleTouchStart = (id: number) => {
    longPressTimerIdRef.current = id;
    longPressRef.current = setTimeout(() => {
      const timerToEdit = buttons.find(b => b.id === id);
      if (timerToEdit) {
        setEditingTimer(timerToEdit);
        setIsNewTimer(false);
      }
    }, 500); // 500ms long press
  };
  
  const handleTouchEnd = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };
  
  // Handle explicit edit button click
  const handleEditClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent timer toggling
    const timerToEdit = buttons.find(b => b.id === id);
    if (timerToEdit) {
      setEditingTimer(timerToEdit);
      setIsNewTimer(false);
    }
  };

  // Toggle a timer on/off
  const toggleTimer = (id: number) => {
    // If we're in the middle of a long press, don't toggle
    if (longPressTimerIdRef.current === id && longPressRef.current) {
      return;
    }
    
    const now = Date.now();
    setButtons(prev => prev.map(button => {
      // If this is the button we clicked
      if (button.id === id) {
        // If it's already active, pause it
        if (button.isActive) {
          return { ...button, isActive: false, startTime: undefined };
        }
        // If it's not active, activate it and deactivate all others
        return { ...button, isActive: true, startTime: now };
      }
      // For all other buttons, deactivate them if the clicked button is becoming active
      return { ...button, isActive: false, startTime: button.isActive ? undefined : button.startTime };
    }));
    setLastUpdate(now);
  };
  
  // Handle adding a new timer
  const handleAddTimer = () => {
    setEditingTimer(null);
    setIsNewTimer(true);
  };
  
  // Save timer changes from edit modal
  const handleSaveTimer = (updatedTimer: TimerButton) => {
    if (isNewTimer) {
      // Add new timer
      setButtons(prev => [...prev, { ...updatedTimer, archived: false }]);
    } else {
      // Update existing timer
      setButtons(prev => 
        prev.map(button => 
          button.id === updatedTimer.id ? updatedTimer : button
        )
      );
    }
    setEditingTimer(null);
    setIsNewTimer(false);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTimer(null);
    setIsNewTimer(false);
  };
  
  // Archive a timer
  const handleArchiveTimer = (id: number) => {
    setButtons(prev => 
      prev.map(button => 
        button.id === id ? { ...button, archived: true } : button
      )
    );
    setEditingTimer(null);
  };
  
  // Clear all timers with confirmation
  const clearAllTimers = () => {
    if (window.confirm('Are you sure you want to clear all timers? This action cannot be undone.')) {
      setButtons(prev => prev.map(button => ({
        ...button,
        elapsedTime: 0,
        isActive: false,
        startTime: undefined
      })));
    }
  };
  
  // Restore a timer from archive
  const restoreTimer = (id: number) => {
    setButtons(prev => 
      prev.map(button => 
        button.id === id ? { ...button, archived: false } : button
      )
    );
  };
  
  // Toggle archive view
  const toggleArchiveView = () => {
    setShowArchive(prev => !prev);
  };
  
  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Format the current date in a more readable format
  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-AU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  // Format the current time
  const formatDisplayTime = (date: Date): string => {
    return date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Export timer data as CSV for WorkflowMax
  const exportToCSV = () => {
    // Filter out timers with zero time and archived timers
    const activeTimers = buttons.filter(button => button.elapsedTime > 0 && !button.archived);
    
    if (activeTimers.length === 0) {
      alert('No timer data to export!');
      return;
    }
    
    // Convert to hours with 2 decimal places
    const toHours = (ms: number): string => {
      return (ms / (1000 * 60 * 60)).toFixed(2);
    };
    
    // Current date in YYYY-MM-DD format
    const today = formatDate(new Date());
    
    // Create CSV headers according to WorkflowMax format
    const headers = ['Staff', 'Date', 'Job', 'Task', 'Description', 'Hours'];
    
    // Create rows data - using assumed WorkflowMax format
    // Modify this according to actual WorkflowMax requirements
    const rows = activeTimers.map(timer => {
      return [
        'User', // Placeholder for staff name
        today,
        timer.name,
        'Standard', // Default task type 
        `Time tracked on ${today}`,
        toHours(timer.elapsedTime)
      ].join(',');
    });
    
    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `time-export-${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get buttons based on current view
  const filteredButtons = showArchive 
    ? buttons.filter(button => button.archived)
    : buttons.filter(button => !button.archived);

  return (
    <div className="app-container">
      <header>
        <div className="header-left">
          <div className="header-title">
            <h1>Job Timer</h1>
          </div>
          <div className="date-time-display">
            <div className="current-date">{formatDisplayDate(currentDateTime)}</div>
            <div className="current-time">{formatDisplayTime(currentDateTime)}</div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className={`header-button ${showArchive ? 'active-view' : ''}`} 
            onClick={toggleArchiveView}
          >
            {showArchive ? 'Back to Timers' : 'View Archive'}
          </button>
          {!showArchive && (
            <>
              <button className="header-button clear-button" onClick={clearAllTimers}>
                Clear All Timers
              </button>
              <button className="header-button export-button" onClick={exportToCSV}>
                Export to CSV
              </button>
            </>
          )}
        </div>
      </header>
      <div className="timer-grid">
        {filteredButtons.length === 0 && (
          <div className="empty-state">
            {showArchive ? 
              'No archived timers found.' : 
              'No active timers. Click "Add New Job" to create one.'}
          </div>
        )}
        
        {filteredButtons.map(button => (
          <button 
            key={button.id}
            className={`timer-button ${button.isActive ? 'active' : ''} ${button.elapsedTime > 0 && !button.isActive ? 'paused' : ''} ${showArchive ? 'archived-timer' : ''}`}
            onClick={showArchive ? () => {} : () => toggleTimer(button.id)}
            onTouchStart={showArchive ? undefined : () => handleTouchStart(button.id)}
            onTouchEnd={showArchive ? undefined : handleTouchEnd}
            onTouchCancel={showArchive ? undefined : handleTouchEnd}
          >
            {showArchive ? (
              <div className="restore-icon" onClick={() => restoreTimer(button.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4V9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 20V15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.5 7.5C15.3739 6.54061 13.9457 6.00044 12.4611 6.00044C10.9765 6.00044 9.54838 6.54061 8.42225 7.5M7.5 16.5C8.62613 17.4594 10.0543 17.9996 11.5389 17.9996C13.0235 17.9996 14.4516 17.4594 15.5777 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 4L9 9M20 20L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ) : (
              <div className="edit-icon" onClick={(e) => handleEditClick(e, button.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.4745 5.40801L18.5917 7.52524M17.8358 3.54289L11.6003 9.77846C11.3263 10.0525 11.1361 10.4012 11.0592 10.7785L10.5 14L13.7215 13.4408C14.0988 13.3639 14.4475 13.1737 14.7215 12.8997L20.9571 6.66417C21.281 6.34022 21.462 5.90021 21.462 5.44289C21.462 4.98557 21.281 4.54556 20.9571 4.22161C20.6331 3.89767 20.1931 3.71667 19.7358 3.71667C19.2785 3.71667 18.8385 3.89767 18.5145 4.22161L17.8358 3.54289Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 15V18C19 18.5304 18.7893 19.0391 18.4142 19.4142C18.0391 19.7893 17.5304 20 17 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div className="timer-content">
              <div className="job-info">
                <div className="job-number">{button.jobNumber}</div>
                <div className="job-name">{button.name}</div>
              </div>
              <div className="job-time">{formatTime(button.elapsedTime)}</div>
              <div className="timer-status">
                {button.isActive ? 'ACTIVE' : button.elapsedTime > 0 ? 'PAUSED' : 'IDLE'}
              </div>
            </div>
          </button>
        ))}
        
        {/* Only show add button in non-archive view */}
        {!showArchive && (
          <button 
            className="timer-button add-button"
            onClick={handleAddTimer}
          >
            <div className="timer-content add-content">
              <div className="add-icon">+</div>
              <div>Add New Job</div>
            </div>
          </button>
        )}
      </div>
      
      <div className="footer">
        <div className="footer-content">
          <div>&copy; {new Date().getFullYear()} Timer App</div>
          <div className="version">v1.0.0</div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {(editingTimer || isNewTimer) && (
        <EditModal 
          timer={editingTimer}
          isNew={isNewTimer}
          onSave={handleSaveTimer}
          onCancel={handleCancelEdit}
          onArchive={handleArchiveTimer}
        />
      )}
    </div>
  )
}

export default App