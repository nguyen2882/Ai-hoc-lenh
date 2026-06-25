// State Management
let scheduleData = {}; // Format: { 'YYYY-MM-DD': { status: 'study'|'exam'|'holiday'|'event'|'off'|'', notes: '...' } }
let currentMonth = 5; // June (0-indexed, so 5 is June)
let currentYear = 2026;

// Date Names Helper
const WEEKDAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

// Status options mapping for labels
const STATUS_LABELS = {
    'study': 'Đi trường',
    'exam': 'Thi cử',
    'holiday': 'Nghỉ lễ',
    'event': 'Sự kiện',
    'off': 'Nghỉ học',
    '': 'Chưa xếp'
};

// Seed Mock Data if first time opening
function seedMockSchedule(month, year) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mockSchedule = {};
    
    // Let's seed some realistic schedule notes for a student
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
        const dateStr = formatDateString(year, month, day);
        
        if (dayOfWeek === 0) {
            // Sunday: off
            mockSchedule[dateStr] = { status: 'off', notes: 'Nghỉ ngơi cuối tuần' };
        } else if (dayOfWeek === 6) {
            // Saturday: club or event
            if (day === 6 || day === 20) {
                mockSchedule[dateStr] = { status: 'event', notes: 'Sinh hoạt CLB Tin học & AI' };
            } else {
                mockSchedule[dateStr] = { status: '', notes: 'Tự học tại nhà' };
            }
        } else {
            // Weekdays
            if (dayOfWeek === 1 || dayOfWeek === 3) {
                // Mon, Wed: Go to school
                mockSchedule[dateStr] = { 
                    status: 'study', 
                    notes: 'Sáng: Học Lý thuyết đồ thị (Phòng 301)\nChiều: Thực hành Cấu trúc dữ liệu' 
                };
            } else if (dayOfWeek === 2 || dayOfWeek === 4) {
                // Tue, Thu: Go to school
                mockSchedule[dateStr] = { 
                    status: 'study', 
                    notes: 'Sáng: Học Tiếng Anh chuyên ngành\nChiều: Tự học ở thư viện' 
                };
            } else if (dayOfWeek === 5) {
                // Friday: Exam or study
                if (day === 12 || day === 26) {
                    mockSchedule[dateStr] = { 
                        status: 'exam', 
                        notes: 'Thi giữa kỳ môn Giải tích (Ca sáng - 8h00)' 
                    };
                } else {
                    mockSchedule[dateStr] = { 
                        status: 'study', 
                        notes: 'Sáng: Seminar chuyên đề Trí tuệ nhân tạo' 
                    };
                }
            }
        }
    }
    
    // Add a holiday example
    const holidayDateStr = formatDateString(year, month, 15);
    mockSchedule[holidayDateStr] = { status: 'holiday', notes: 'Nghỉ lễ Giữa kỳ (Toàn trường nghỉ)' };
    
    return mockSchedule;
}

// Helpers
function formatDateString(year, month, day) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
}

// Debounce helper to avoid saving on every single keystroke
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Save & Load
function loadData() {
    const storedSchedule = localStorage.getItem('chuanhoaai_schedule');
    const storedMonth = localStorage.getItem('chuanhoaai_month');
    const storedYear = localStorage.getItem('chuanhoaai_year');

    // Default to current date (June 2026 based on metadata)
    const now = new Date("2026-06-25T10:09:02+07:00");
    currentMonth = storedMonth ? parseInt(storedMonth) : now.getMonth();
    currentYear = storedYear ? parseInt(storedYear) : now.getFullYear();

    if (storedSchedule) {
        scheduleData = JSON.parse(storedSchedule);
    } else {
        // First time opening: seed mock data
        scheduleData = seedMockSchedule(currentMonth, currentYear);
        saveData();
    }
}

function saveData() {
    localStorage.setItem('chuanhoaai_schedule', JSON.stringify(scheduleData));
    localStorage.setItem('chuanhoaai_month', currentMonth);
    localStorage.setItem('chuanhoaai_year', currentYear);
}

// Populate Filters
function populateFilters() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    monthSelect.innerHTML = '';
    yearSelect.innerHTML = '';
    
    // Months 1-12
    for (let i = 0; i < 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Tháng ${i + 1}`;
        if (i === currentMonth) option.selected = true;
        monthSelect.appendChild(option);
    }
    
    // Years (currentYear - 3 to currentYear + 5)
    const startYear = currentYear - 3;
    const endYear = currentYear + 5;
    for (let i = startYear; i <= endYear; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Năm ${i}`;
        if (i === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

// Calculate and Update Stats
function updateStats() {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let schoolDaysCount = 0;
    let examsCount = 0;
    let holidaysCount = 0;
    let offDaysCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateString(currentYear, currentMonth, day);
        const dayData = scheduleData[dateStr] || { status: '', notes: '' };
        
        switch (dayData.status) {
            case 'study':
                schoolDaysCount++;
                break;
            case 'exam':
                examsCount++;
                break;
            case 'holiday':
                holidaysCount++;
                break;
            case 'off':
                offDaysCount++;
                break;
        }
    }

    document.getElementById('stat-school-days').textContent = schoolDaysCount;
    document.getElementById('stat-exams').textContent = examsCount;
    document.getElementById('stat-holidays').textContent = holidaysCount;
    document.getElementById('stat-off-days').textContent = offDaysCount;
}

// Render Calendar Grid
function renderCalendarGrid() {
    const gridContainer = document.getElementById('calendar-days-grid');
    gridContainer.innerHTML = '';

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Get column index of the 1st day of this month
    // JavaScript getDay() returns 0 for Sunday, 1 for Monday, etc.
    // Our grid is Monday (0) to Sunday (6).
    const firstDayDate = new Date(currentYear, currentMonth, 1);
    const firstDayOfWeek = firstDayDate.getDay();
    const colStart = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Translate Sunday to index 6, others shift -1

    // Previous month filler days
    const prevMonthDate = new Date(currentYear, currentMonth, 0);
    const prevMonthDaysCount = prevMonthDate.getDate();
    const prevMonth = prevMonthDate.getMonth();
    const prevMonthYear = prevMonthDate.getFullYear();

    // Next month filler days calculation
    const totalCellsNeeded = Math.ceil((colStart + daysInMonth) / 7) * 7;
    const nextMonthFillerCount = totalCellsNeeded - (colStart + daysInMonth);

    // Today Date components to check
    const today = new Date();
    const todayStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());

    // 1. Render Previous Month Faded Days
    for (let i = colStart - 1; i >= 0; i--) {
        const dayNum = prevMonthDaysCount - i;
        const dateStr = formatDateString(prevMonthYear, prevMonth, dayNum);
        const cellData = scheduleData[dateStr] || { status: '', notes: '' };
        
        const cell = createDayCell(dayNum, dateStr, cellData, true, todayStr);
        gridContainer.appendChild(cell);
    }

    // 2. Render Current Month Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateString(currentYear, currentMonth, day);
        const cellData = scheduleData[dateStr] || { status: '', notes: '' };
        
        const cell = createDayCell(day, dateStr, cellData, false, todayStr);
        gridContainer.appendChild(cell);
    }

    // 3. Render Next Month Faded Days
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextMonth = nextMonthDate.getMonth();
    const nextMonthYear = nextMonthDate.getFullYear();
    for (let day = 1; day <= nextMonthFillerCount; day++) {
        const dateStr = formatDateString(nextMonthYear, nextMonth, day);
        const cellData = scheduleData[dateStr] || { status: '', notes: '' };
        
        const cell = createDayCell(day, dateStr, cellData, true, todayStr);
        gridContainer.appendChild(cell);
    }

    // Update table header text
    const displayMonth = String(currentMonth + 1).padStart(2, '0');
    document.getElementById('calendar-title').textContent = `LỊCH TRÌNH ĐI TRƯỜNG - THÁNG ${displayMonth}/${currentYear}`;
}

// Create a single Day Cell Element
function createDayCell(dayNum, dateStr, cellData, isOtherMonth, todayStr) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    
    // Check if weekend (Saturday or Sunday)
    const cellDate = new Date(dateStr);
    const dayOfWeek = cellDate.getDay();
    if (dayOfWeek === 6) {
        cell.classList.add('sat-cell');
    } else if (dayOfWeek === 0) {
        cell.classList.add('sun-cell');
    }

    // Check if today
    if (dateStr === todayStr) {
        cell.classList.add('today-cell');
    }

    // Check if belongs to previous or next month
    if (isOtherMonth) {
        cell.classList.add('other-month');
    }

    // Apply status classes
    if (cellData.status) {
        cell.classList.add(`status-${cellData.status}`);
    }

    // Create Day Header row (Day Number & Status Selector)
    const headerRow = document.createElement('div');
    headerRow.className = 'day-cell-header';

    const daySpan = document.createElement('span');
    daySpan.className = 'day-number';
    daySpan.textContent = dayNum;
    headerRow.appendChild(daySpan);

    // Only render interactive status select if it's the current month
    if (!isOtherMonth) {
        const select = document.createElement('select');
        select.className = 'cell-status-select';
        
        // Add options
        const options = [
            { value: '', label: 'Trống' },
            { value: 'study', label: 'Đi trường' },
            { value: 'exam', label: 'Thi cử' },
            { value: 'holiday', label: 'Nghỉ lễ' },
            { value: 'event', label: 'Sự kiện' },
            { value: 'off', label: 'Nghỉ học' }
        ];

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === cellData.status) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        // Event listener for changing status
        select.addEventListener('change', (e) => {
            const newStatus = e.target.value;
            
            // Clean previous status classes
            cell.className = 'day-cell';
            if (dayOfWeek === 6) cell.classList.add('sat-cell');
            if (dayOfWeek === 0) cell.classList.add('sun-cell');
            if (dateStr === todayStr) cell.classList.add('today-cell');
            
            // Apply new status class
            if (newStatus) {
                cell.classList.add(`status-${newStatus}`);
            }

            // Update state
            if (!scheduleData[dateStr]) {
                scheduleData[dateStr] = { status: '', notes: '' };
            }
            scheduleData[dateStr].status = newStatus;
            
            saveData();
            updateStats();
        });

        headerRow.appendChild(select);
    } else {
        // Read-only indicator for other month
        if (cellData.status) {
            const labelSpan = document.createElement('span');
            labelSpan.style.fontSize = '9px';
            labelSpan.style.opacity = '0.7';
            labelSpan.style.fontWeight = 'bold';
            labelSpan.textContent = STATUS_LABELS[cellData.status].toUpperCase();
            headerRow.appendChild(labelSpan);
        }
    }

    cell.appendChild(headerRow);

    // Create Text Notes Area
    const textarea = document.createElement('textarea');
    textarea.className = 'day-notes-area';
    textarea.value = cellData.notes || '';
    textarea.placeholder = isOtherMonth ? '' : 'Ghi chú học tập...';
    
    if (isOtherMonth) {
        textarea.disabled = true; // Disable editing for other month days
    }

    // Auto-save logic on input typing (debounced)
    const debouncedSave = debounce((val) => {
        if (!scheduleData[dateStr]) {
            scheduleData[dateStr] = { status: '', notes: '' };
        }
        scheduleData[dateStr].notes = val;
        saveData();
    }, 300);

    textarea.addEventListener('input', (e) => {
        debouncedSave(e.target.value);
    });

    // Make sure we save on blur as well
    textarea.addEventListener('blur', (e) => {
        if (!scheduleData[dateStr]) {
            scheduleData[dateStr] = { status: '', notes: '' };
        }
        scheduleData[dateStr].notes = e.target.value;
        saveData();
    });

    cell.appendChild(textarea);

    return cell;
}

// Clear Month Schedule
function clearCurrentMonthSchedule() {
    const displayMonth = String(currentMonth + 1).padStart(2, '0');
    if (confirm(`Bạn có chắc chắn muốn xóa toàn bộ ghi chú và trạng thái lịch học của Tháng ${displayMonth}/${currentYear}?`)) {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDateString(currentYear, currentMonth, day);
            if (scheduleData[dateStr]) {
                delete scheduleData[dateStr];
            }
        }
        
        saveData();
        renderCalendarGrid();
        updateStats();
    }
}

// Export to CSV
function exportToCSV() {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const displayMonth = String(currentMonth + 1).padStart(2, '0');
    
    let csvContent = "";
    
    // Header Row 1: Title
    csvContent += `LỊCH ĐI TRƯỜNG CÁ NHÂN - THÁNG ${displayMonth}/${currentYear}\r\n`;
    
    // Header Row 2: Columns
    const headers = ["Ngày", "Thứ trong tuần", "Trạng thái", "Chi tiết lịch học / Ghi chú"];
    csvContent += headers.map(val => `"${val}"`).join(",") + "\r\n";
    
    // Rows
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateString(currentYear, currentMonth, day);
        const dayData = scheduleData[dateStr] || { status: '', notes: '' };
        
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeekLabel = WEEKDAY_NAMES[date.getDay()];
        const statusLabel = STATUS_LABELS[dayData.status] || 'Chưa xếp';
        const notesSanitized = (dayData.notes || '').replace(/"/g, '""'); // Escape double quotes for CSV
        
        const rowData = [
            `${day}/${displayMonth}/${currentYear}`,
            dayOfWeekLabel,
            statusLabel,
            notesSanitized
        ];
        
        csvContent += rowData.map(val => `"${val}"`).join(",") + "\r\n";
    }
    
    // Add BOM for Excel UTF-8 support
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `chuanhoaAI_Lich_Di_Truong_${displayMonth}_${currentYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    populateFilters();
    renderCalendarGrid();
    updateStats();

    // Event listeners for filters
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    monthSelect.addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        saveData();
        renderCalendarGrid();
        updateStats();
    });
    
    yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        saveData();
        renderCalendarGrid();
        updateStats();
    });

    // Control Buttons
    document.getElementById('btn-export-csv').addEventListener('click', exportToCSV);
    document.getElementById('btn-print').addEventListener('click', () => {
        window.print();
    });
    document.getElementById('btn-clear-month').addEventListener('click', clearCurrentMonthSchedule);
});
