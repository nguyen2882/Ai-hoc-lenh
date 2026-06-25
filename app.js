// State Management
let scheduleData = {}; // Format: { 'YYYY-MM-DD_sang': { status, notes }, 'YYYY-MM-DD_chieu': { status, notes } }
let userName = "Trần Quang Nguyên";
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
function seedMockWeeklySchedule(month, year) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mockSchedule = {};
    
    // Seed some mock schedules for morning and afternoon
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
        const dateStr = formatDateString(year, month, day);
        
        const keySang = `${dateStr}_sang`;
        const keyChieu = `${dateStr}_chieu`;
        
        if (dayOfWeek === 0) {
            // Sunday: off
            mockSchedule[keySang] = { status: 'off', notes: 'Nghỉ cuối tuần' };
            mockSchedule[keyChieu] = { status: 'off', notes: 'Nghỉ cuối tuần' };
        } else if (dayOfWeek === 6) {
            // Saturday
            if (day === 6 || day === 20) {
                mockSchedule[keySang] = { status: 'event', notes: 'Sinh hoạt CLB Tin học' };
                mockSchedule[keyChieu] = { status: '', notes: 'Học nhóm' };
            } else {
                mockSchedule[keySang] = { status: '', notes: 'Tự học ca sáng' };
                mockSchedule[keyChieu] = { status: 'off', notes: 'Nghỉ cuối tuần' };
            }
        } else {
            // Weekdays (Monday - Friday)
            if (dayOfWeek === 1 || dayOfWeek === 3) {
                // Mon, Wed
                mockSchedule[keySang] = { status: 'study', notes: 'Lý thuyết Mạng Máy Tính' };
                mockSchedule[keyChieu] = { status: 'study', notes: 'Thực hành Hệ Điều Hành' };
            } else if (dayOfWeek === 2 || dayOfWeek === 4) {
                // Tue, Thu
                mockSchedule[keySang] = { status: 'study', notes: 'Tiếng Anh Chuyên Ngành' };
                mockSchedule[keyChieu] = { status: '', notes: 'Nghiên cứu khoa học' };
            } else if (dayOfWeek === 5) {
                // Friday
                if (day === 12 || day === 26) {
                    mockSchedule[keySang] = { status: 'exam', notes: 'Thi cuối kỳ môn Giải Tích' };
                    mockSchedule[keyChieu] = { status: 'off', notes: 'Nghỉ sau khi thi' };
                } else {
                    mockSchedule[keySang] = { status: 'study', notes: 'Chuyên đề Trí Tuệ Nhân Tạo' };
                    mockSchedule[keyChieu] = { status: 'study', notes: 'Thực hành Lập Trình AI' };
                }
            }
        }
    }
    
    // Add a holiday example
    const holidayDateStr = formatDateString(year, month, 15);
    mockSchedule[`${holidayDateStr}_sang`] = { status: 'holiday', notes: 'Nghỉ lễ Giữa kỳ' };
    mockSchedule[`${holidayDateStr}_chieu`] = { status: 'holiday', notes: 'Nghỉ lễ Giữa kỳ' };
    
    return mockSchedule;
}

// Helpers
function formatDateString(year, month, day) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
}

// Format date to DD/MM
function formatDateDDMM(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
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
    const storedSchedule = localStorage.getItem('chuanhoaai_weekly_schedule');
    const storedMonth = localStorage.getItem('chuanhoaai_month');
    const storedYear = localStorage.getItem('chuanhoaai_year');
    const storedName = localStorage.getItem('chuanhoaai_username');

    // Default to current date (June 2026 based on metadata)
    const now = new Date("2026-06-25T10:09:02+07:00");
    currentMonth = storedMonth ? parseInt(storedMonth) : now.getMonth();
    currentYear = storedYear ? parseInt(storedYear) : now.getFullYear();
    userName = storedName ? storedName : "Trần Quang Nguyên";

    if (storedSchedule) {
        scheduleData = JSON.parse(storedSchedule);
    } else {
        // First time opening: seed mock data
        scheduleData = seedMockWeeklySchedule(currentMonth, currentYear);
        saveData();
    }
}

function saveData() {
    localStorage.setItem('chuanhoaai_weekly_schedule', JSON.stringify(scheduleData));
    localStorage.setItem('chuanhoaai_month', currentMonth);
    localStorage.setItem('chuanhoaai_year', currentYear);
    localStorage.setItem('chuanhoaai_username', userName);
}

// Populate Filter Dropdowns
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
    let schoolSessions = 0;
    let examSessions = 0;
    let holidaySessions = 0;
    let offSessions = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateString(currentYear, currentMonth, day);
        const keySang = `${dateStr}_sang`;
        const keyChieu = `${dateStr}_chieu`;
        
        const dataSang = scheduleData[keySang] || { status: '', notes: '' };
        const dataChieu = scheduleData[keyChieu] || { status: '', notes: '' };
        
        // Count Sáng
        if (dataSang.status === 'study') schoolSessions++;
        else if (dataSang.status === 'exam') examSessions++;
        else if (dataSang.status === 'holiday') holidaySessions++;
        else if (dataSang.status === 'off') offSessions++;

        // Count Chiều
        if (dataChieu.status === 'study') schoolSessions++;
        else if (dataChieu.status === 'exam') examSessions++;
        else if (dataChieu.status === 'holiday') holidaySessions++;
        else if (dataChieu.status === 'off') offSessions++;
    }

    document.getElementById('stat-school-days').textContent = schoolSessions;
    document.getElementById('stat-exams').textContent = examSessions;
    document.getElementById('stat-holidays').textContent = holidaySessions;
    document.getElementById('stat-off-days').textContent = offSessions;
}

// Calculate Weeks partition of the month
// Return array of objects: { start: Date, end: Date, days: [Date, Date...] }
function getWeeksOfMonth() {
    const weeks = [];
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Find the Monday of the week containing the 1st of the month
    const firstDayOfWeek = firstOfMonth.getDay(); // 0 is Sunday, 1 is Monday
    const mondayOffset = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    
    let currentMonday = new Date(currentYear, currentMonth, 1 + mondayOffset);
    const lastOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Loop through weeks until the Monday is past the last day of the month
    while (currentMonday <= lastOfMonth) {
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + i);
            weekDays.push(day);
        }
        
        weeks.push({
            start: weekDays[0],
            end: weekDays[6],
            days: weekDays
        });
        
        // Advance to next Monday
        currentMonday = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + 7);
    }
    
    return weeks;
}

// Render Weekly Tables
function renderWeeklyTables() {
    const container = document.getElementById('weeks-container');
    container.innerHTML = '';
    
    const weeks = getWeeksOfMonth();
    const today = new Date();
    const todayStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());

    weeks.forEach((week, weekIdx) => {
        const weekGroup = document.createElement('div');
        weekGroup.className = 'week-table-group';

        // Week Title: e.g. "TUẦN 2 (08/06 - 14/06)"
        const weekTitle = document.createElement('div');
        weekTitle.className = 'week-table-title';
        const startLabel = formatDateDDMM(week.start);
        const endLabel = formatDateDDMM(week.end);
        weekTitle.textContent = `Tuần ${weekIdx + 1}: (${startLabel} - ${endLabel})`;
        weekGroup.appendChild(weekTitle);

        // Table Wrapper
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'week-table-wrapper';

        // Table
        const table = document.createElement('table');
        table.className = 'week-table';

        // Table Head
        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');

        // Headers: Tên | Buổi | Thứ 2 (DD/MM) | ...
        const thName = document.createElement('th');
        thName.className = 'col-th-name';
        thName.textContent = 'Họ và Tên';
        trHead.appendChild(thName);

        const thSession = document.createElement('th');
        thSession.className = 'col-th-session';
        thSession.textContent = 'Buổi';
        trHead.appendChild(thSession);

        week.days.forEach(day => {
            const thDay = document.createElement('th');
            thDay.className = 'col-th-day';
            const dayOfWeek = day.getDay();
            const dayLabel = WEEKDAY_NAMES[dayOfWeek];
            const dateLabel = formatDateDDMM(day);
            thDay.innerHTML = `<div>${dayLabel}</div><div style="font-size: 10px; opacity: 0.7;">${dateLabel}</div>`;
            
            // Highlight Saturday & Sunday headers
            if (dayOfWeek === 6) {
                thDay.classList.add('weekend-sat-header');
            } else if (dayOfWeek === 0) {
                thDay.classList.add('weekend-sun-header');
            }
            
            trHead.appendChild(thDay);
        });
        thead.appendChild(trHead);
        table.appendChild(thead);

        // Table Body
        const tbody = document.createElement('tbody');

        // Row 1: Sáng (includes merged Tên column)
        const trSang = document.createElement('tr');
        
        // Merged User Name Cell
        const tdUserName = document.createElement('td');
        tdUserName.rowSpan = 2;
        tdUserName.className = 'col-user-name';
        tdUserName.textContent = userName;
        trSang.appendChild(tdUserName);

        // Session Label (Sáng)
        const tdSessionSang = document.createElement('td');
        tdSessionSang.className = 'col-session';
        tdSessionSang.textContent = 'Sáng';
        trSang.appendChild(tdSessionSang);

        // Row 2: Chiều
        const trChieu = document.createElement('tr');

        // Session Label (Chiều)
        const tdSessionChieu = document.createElement('td');
        tdSessionChieu.className = 'col-session';
        tdSessionChieu.textContent = 'Chiều';
        trChieu.appendChild(tdSessionChieu);

        // Populate cell nodes for Sáng & Chiều
        week.days.forEach(day => {
            const dateStr = formatDateString(day.getFullYear(), day.getMonth(), day.getDate());
            const dayOfWeek = day.getDay();
            
            const isOtherMonth = day.getMonth() !== currentMonth;
            const isToday = dateStr === todayStr;

            // 1. Morning Cell
            const tdDaySang = createScheduleCell(dateStr, 'sang', dayOfWeek, isOtherMonth, isToday);
            trSang.appendChild(tdDaySang);

            // 2. Afternoon Cell
            const tdDayChieu = createScheduleCell(dateStr, 'chieu', dayOfWeek, isOtherMonth, isToday);
            trChieu.appendChild(tdDayChieu);
        });

        tbody.appendChild(trSang);
        tbody.appendChild(trChieu);
        table.appendChild(tbody);
        
        tableWrapper.appendChild(table);
        weekGroup.appendChild(tableWrapper);
        container.appendChild(weekGroup);
    });

    // Update title text
    const displayMonth = String(currentMonth + 1).padStart(2, '0');
    document.getElementById('calendar-title').textContent = `BẢNG LỊCH TRÌNH CHI TIẾT - THÁNG ${displayMonth}/${currentYear}`;
}

// Create an individual schedule cell td element
function createScheduleCell(dateStr, session, dayOfWeek, isOtherMonth, isToday) {
    const td = document.createElement('td');
    const key = `${dateStr}_${session}`;
    const cellData = scheduleData[key] || { status: '', notes: '' };

    // Set classes
    if (dayOfWeek === 6) td.className = 'cell-sat';
    else if (dayOfWeek === 0) td.className = 'cell-sun';

    if (isToday) td.classList.add('cell-today');
    if (isOtherMonth) td.classList.add('cell-other-month');

    // Status classes
    if (cellData.status) {
        td.classList.add(`cell-${cellData.status}`);
    }

    // Cell Content Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'cell-content-wrapper';

    // Status select (only interactive for current month days)
    if (!isOtherMonth) {
        const select = document.createElement('select');
        select.className = 'cell-status-select';
        
        const options = [
            { value: '', label: 'Trống' },
            { value: 'study', label: 'Đi học' },
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

        select.addEventListener('change', (e) => {
            const newStatus = e.target.value;
            
            // Clean classes
            td.className = '';
            if (dayOfWeek === 6) td.className = 'cell-sat';
            else if (dayOfWeek === 0) td.className = 'cell-sun';
            if (isToday) td.classList.add('cell-today');
            
            if (newStatus) {
                td.classList.add(`cell-${newStatus}`);
            }

            // Save to state
            if (!scheduleData[key]) {
                scheduleData[key] = { status: '', notes: '' };
            }
            scheduleData[key].status = newStatus;
            
            saveData();
            updateStats();
        });

        wrapper.appendChild(select);
    } else {
        // Read only label for other month
        if (cellData.status) {
            const labelSpan = document.createElement('span');
            labelSpan.style.fontSize = '8.5px';
            labelSpan.style.opacity = '0.6';
            labelSpan.style.fontWeight = 'bold';
            labelSpan.style.textAlign = 'right';
            labelSpan.textContent = STATUS_LABELS[cellData.status].toUpperCase();
            wrapper.appendChild(labelSpan);
        }
    }

    // Textarea for schedule details
    const textarea = document.createElement('textarea');
    textarea.className = 'cell-textarea';
    textarea.value = cellData.notes || '';
    textarea.placeholder = isOtherMonth ? '' : 'Ghi chú...';
    
    if (isOtherMonth) {
        textarea.disabled = true;
    }

    // Auto save logic with debounce
    const debouncedSave = debounce((val) => {
        if (!scheduleData[key]) {
            scheduleData[key] = { status: '', notes: '' };
        }
        scheduleData[key].notes = val;
        saveData();
    }, 300);

    textarea.addEventListener('input', (e) => {
        debouncedSave(e.target.value);
    });

    textarea.addEventListener('blur', (e) => {
        if (!scheduleData[key]) {
            scheduleData[key] = { status: '', notes: '' };
        }
        scheduleData[key].notes = e.target.value;
        saveData();
    });

    wrapper.appendChild(textarea);
    td.appendChild(wrapper);

    return td;
}

// Clear Current Month Schedule
function clearCurrentMonthSchedule() {
    const displayMonth = String(currentMonth + 1).padStart(2, '0');
    if (confirm(`Bạn có chắc chắn muốn xóa sạch toàn bộ lịch trình Tháng ${displayMonth}/${currentYear}?`)) {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDateString(currentYear, currentMonth, day);
            delete scheduleData[`${dateStr}_sang`];
            delete scheduleData[`${dateStr}_chieu`];
        }
        
        saveData();
        renderWeeklyTables();
        updateStats();
    }
}

// Sync name to columns
function handleNameSync(newName) {
    userName = newName || "Trần Quang Nguyên";
    saveData();
    
    // Quick DOM update for all user-name cells without full re-render
    const nameCells = document.querySelectorAll('.col-user-name');
    nameCells.forEach(cell => {
        cell.textContent = userName;
    });
}

// Export to CSV
function exportToCSV() {
    const displayMonth = String(currentMonth + 1).padStart(2, '0');
    const weeks = getWeeksOfMonth();
    
    let csvContent = "";
    
    // Header Info
    csvContent += `LỊCH TRÌNH ĐI TRƯỜNG PHÂN THEO TUẦN - THÁNG ${displayMonth}/${currentYear}\r\n`;
    csvContent += `Ho va Ten: ${userName}\r\n\r\n`;
    
    // Table Header Columns
    const headerRow = ["Tuan", "Buoi (Ca)", "Thu 2", "Thu 3", "Thu 4", "Thu 5", "Thu 6", "Thu 7", "Chu Nhat"];
    csvContent += headerRow.map(val => `"${val}"`).join(",") + "\r\n";
    
    // Populate weeks
    weeks.forEach((week, weekIdx) => {
        const startLabel = formatDateDDMM(week.start);
        const endLabel = formatDateDDMM(week.end);
        const weekName = `Tuan ${weekIdx + 1} (${startLabel} - ${endLabel})`;
        
        // Row 1: Sáng
        let rowSang = [weekName, "Sang"];
        week.days.forEach(day => {
            const dateStr = formatDateString(day.getFullYear(), day.getMonth(), day.getDate());
            const val = scheduleData[`${dateStr}_sang`] || { status: '', notes: '' };
            const statusLabel = STATUS_LABELS[val.status] || '';
            const cellValue = val.notes ? `${statusLabel ? `[${statusLabel}] ` : ''}${val.notes}` : statusLabel;
            rowSang.push(cellValue.replace(/"/g, '""'));
        });
        csvContent += rowSang.map(val => `"${val}"`).join(",") + "\r\n";
        
        // Row 2: Chiều
        let rowChieu = ["", "Chieu"];
        week.days.forEach(day => {
            const dateStr = formatDateString(day.getFullYear(), day.getMonth(), day.getDate());
            const val = scheduleData[`${dateStr}_chieu`] || { status: '', notes: '' };
            const statusLabel = STATUS_LABELS[val.status] || '';
            const cellValue = val.notes ? `${statusLabel ? `[${statusLabel}] ` : ''}${val.notes}` : statusLabel;
            rowChieu.push(cellValue.replace(/"/g, '""'));
        });
        csvContent += rowChieu.map(val => `"${val}"`).join(",") + "\r\n";
    });
    
    // Add BOM for UTF-8 Vietnamese Excel loading
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `chuanhoaAI_Lich_Hoc_Tuan_${displayMonth}_${currentYear}.csv`);
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
    
    // Setup Name Input
    const nameInput = document.getElementById('user-name-input');
    nameInput.value = userName;
    nameInput.addEventListener('input', (e) => {
        handleNameSync(e.target.value.trim());
    });

    renderWeeklyTables();
    updateStats();

    // Event listeners for month/year selectors
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    monthSelect.addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        saveData();
        renderWeeklyTables();
        updateStats();
    });
    
    yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        saveData();
        renderWeeklyTables();
        updateStats();
    });

    // Control Buttons
    document.getElementById('btn-export-csv').addEventListener('click', exportToCSV);
    document.getElementById('btn-print').addEventListener('click', () => {
        window.print();
    });
    document.getElementById('btn-clear-month').addEventListener('click', clearCurrentMonthSchedule);
});
