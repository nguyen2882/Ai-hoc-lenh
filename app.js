// State Management
let employees = [];
let currentMonth = 5; // June (0-indexed, so 5 is June)
let currentYear = 2026;
let selectedCellInfo = null; // { empIdx, dateStr, cellElement }

// Attendance Configuration
const ATTENDANCE_VALUES = {
    'X': 1.0,    // Công cả ngày
    '½': 0.5,    // Nửa ngày
    'P': 1.0,    // Nghỉ phép có lương
    'L': 1.0,    // Nghỉ lễ
    'KP': 0.0,   // Không phép
    'OFF': 0.0   // Nghỉ tuần
};

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Mock Data Seed
const MOCK_EMPLOYEES = [
    {
        id: 'NV001',
        name: 'Nguyễn Văn An',
        position: 'Trưởng phòng Nhân sự',
        attendance: {}
    },
    {
        id: 'NV002',
        name: 'Trần Thị Bình',
        position: 'Lập trình viên',
        attendance: {}
    },
    {
        id: 'NV003',
        name: 'Lê Minh Cường',
        position: 'Nhân viên Thiết kế',
        attendance: {}
    }
];

// Initialize mock attendance values
function seedMockAttendance(month, year) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    MOCK_EMPLOYEES.forEach((emp, index) => {
        emp.attendance = {};
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
            const dateStr = formatDateString(year, month, day);
            
            if (dayOfWeek === 0) { // Sunday
                emp.attendance[dateStr] = 'OFF';
            } else if (dayOfWeek === 6) { // Saturday
                // Alternate half-day or off
                emp.attendance[dateStr] = index % 2 === 0 ? '½' : 'OFF';
            } else {
                // Randomly present or leave for demo
                const rand = Math.random();
                if (rand > 0.95) {
                    emp.attendance[dateStr] = 'P'; // Paid Leave
                } else if (rand > 0.92) {
                    emp.attendance[dateStr] = 'KP'; // Unpaid Leave
                } else {
                    emp.attendance[dateStr] = 'X'; // Full day
                }
            }
        }
    });
}

// Helper Functions
function formatDateString(year, month, day) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// Load from LocalStorage
function loadData() {
    const storedEmployees = localStorage.getItem('chuanhoaai_employees');
    const storedMonth = localStorage.getItem('chuanhoaai_month');
    const storedYear = localStorage.getItem('chuanhoaai_year');

    // Default to current date (June 2026 based on metadata)
    const now = new Date("2026-06-25T10:09:02+07:00");
    currentMonth = storedMonth ? parseInt(storedMonth) : now.getMonth();
    currentYear = storedYear ? parseInt(storedYear) : now.getFullYear();

    if (storedEmployees) {
        employees = JSON.parse(storedEmployees);
    } else {
        // First time opening: seed mock data
        seedMockAttendance(currentMonth, currentYear);
        employees = JSON.parse(JSON.stringify(MOCK_EMPLOYEES));
        saveData();
    }
}

// Save to LocalStorage
function saveData() {
    localStorage.setItem('chuanhoaai_employees', JSON.stringify(employees));
    localStorage.setItem('chuanhoaai_month', currentMonth);
    localStorage.setItem('chuanhoaai_year', currentYear);
}

// Populate Filter Dropdowns
function populateFilters() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    monthSelect.innerHTML = '';
    yearSelect.innerHTML = '';
    
    // Month options 1-12
    for (let i = 0; i < 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Tháng ${i + 1}`;
        if (i === currentMonth) option.selected = true;
        monthSelect.appendChild(option);
    }
    
    // Year options (current - 3 to current + 5)
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

// Render Header of the Attendance Table
function renderTableHeader(daysInMonth) {
    const thead = document.querySelector('#attendance-table thead');
    thead.innerHTML = '';
    
    // Row 1: General Category Labels
    const tr1 = document.createElement('tr');
    
    // Sticky headers
    const thStt = document.createElement('th');
    thStt.className = 'sticky-col col-stt';
    thStt.rowSpan = 2;
    thStt.textContent = 'STT';
    tr1.appendChild(thStt);
    
    const thId = document.createElement('th');
    thId.className = 'sticky-col col-id';
    thId.rowSpan = 2;
    thId.textContent = 'Mã NV';
    tr1.appendChild(thId);
    
    const thName = document.createElement('th');
    thName.className = 'sticky-col col-name';
    thName.rowSpan = 2;
    thName.textContent = 'Họ và Tên';
    tr1.appendChild(thName);
    
    const thPos = document.createElement('th');
    thPos.className = 'sticky-col col-pos';
    thPos.rowSpan = 2;
    thPos.textContent = 'Chức vụ';
    tr1.appendChild(thPos);
    
    // Days columns label (header title span)
    const thDays = document.createElement('th');
    thDays.colSpan = daysInMonth;
    thDays.textContent = 'Ngày trong tháng';
    tr1.appendChild(thDays);
    
    // Summary columns labels
    const thSummaryLabel = document.createElement('th');
    thSummaryLabel.colSpan = 5;
    thSummaryLabel.textContent = 'Tổng hợp công';
    tr1.appendChild(thSummaryLabel);
    
    // Action column label
    const thAction = document.createElement('th');
    thAction.rowSpan = 2;
    thAction.className = 'action-cell';
    thAction.textContent = 'Thao tác';
    tr1.appendChild(thAction);
    
    // Row 2: Days numbers and Weekday initials, and detailed summary metrics
    const tr2 = document.createElement('tr');
    
    // Populate Days cells
    for (let day = 1; day <= daysInMonth; day++) {
        const thDay = document.createElement('th');
        thDay.className = 'day-column';
        
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay(); // 0 = CN, 1 = T2...
        const dayName = DAY_NAMES[dayOfWeek];
        
        thDay.innerHTML = `<div style="font-size: 10px; opacity: 0.8">${dayName}</div><div>${day}</div>`;
        
        // Highlight weekends
        if (dayOfWeek === 0) {
            thDay.classList.add('weekend-sun-header');
        } else if (dayOfWeek === 6) {
            thDay.classList.add('weekend-sat-header');
        }
        
        tr2.appendChild(thDay);
    }
    
    // Detailed summary headers
    const thsSum = [
        { label: 'Thực Tế', title: 'Công làm việc thực tế (X + 0.5*½)' },
        { label: 'Phép P', title: 'Tổng nghỉ phép hưởng lương (P)' },
        { label: 'Nghỉ Lễ', title: 'Nghỉ lễ tết hưởng lương (L)' },
        { label: 'K.Phép', title: 'Tổng nghỉ không phép (KP)' },
        { label: 'Công Lương', title: 'Tổng công hưởng lương (Thực Tế + Phép + Lễ)' }
    ];
    
    thsSum.forEach((item, idx) => {
        const thSumCol = document.createElement('th');
        thSumCol.textContent = item.label;
        thSumCol.title = item.title;
        thSumCol.className = idx === 4 ? 'summary-total' : 'summary-col';
        tr2.appendChild(thSumCol);
    });
    
    thead.appendChild(tr1);
    thead.appendChild(tr2);
}

// Render Attendance Data Rows
function renderTableBody(daysInMonth) {
    const tbody = document.querySelector('#attendance-table tbody');
    tbody.innerHTML = '';
    
    if (employees.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4 + daysInMonth + 5 + 1; // sticky + days + summary + action
        td.className = 'no-data';
        td.style.padding = '40px';
        td.style.fontSize = '16px';
        td.style.color = 'var(--text-muted)';
        td.innerHTML = '<i class="fa-solid fa-users-slash" style="font-size: 24px; margin-bottom: 8px; display: block;"></i> Chưa có nhân viên nào. Hãy nhấn nút "Thêm Nhân Viên"!';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    
    employees.forEach((emp, empIdx) => {
        const tr = document.createElement('tr');
        
        // 1. Sticky Columns
        const tdStt = document.createElement('td');
        tdStt.className = 'sticky-col col-stt';
        tdStt.textContent = empIdx + 1;
        tr.appendChild(tdStt);
        
        const tdId = document.createElement('td');
        tdId.className = 'sticky-col col-id';
        tdId.textContent = emp.id;
        tr.appendChild(tdId);
        
        const tdName = document.createElement('td');
        tdName.className = 'sticky-col col-name';
        tdName.textContent = emp.name;
        tr.appendChild(tdName);
        
        const tdPos = document.createElement('td');
        tdPos.className = 'sticky-col col-pos';
        tdPos.textContent = emp.position || '-';
        tr.appendChild(tdPos);
        
        // 2. Attendance Status Columns for Each Day
        let sumWorkdays = 0;
        let sumPaidLeave = 0;
        let sumHoliday = 0;
        let sumAbsent = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const tdDay = document.createElement('td');
            tdDay.className = 'day-column';
            
            const date = new Date(currentYear, currentMonth, day);
            const dayOfWeek = date.getDay();
            const dateStr = formatDateString(currentYear, currentMonth, day);
            const value = emp.attendance[dateStr] || '';
            
            // Render beautiful badge inside cell
            tdDay.innerHTML = getBadgeHTML(value);
            
            // Weekend background highlighting
            if (dayOfWeek === 0) {
                tdDay.classList.add('weekend-sun');
            } else if (dayOfWeek === 6) {
                tdDay.classList.add('weekend-sat');
            }
            
            // Click listener to toggle/change attendance state
            tdDay.addEventListener('click', (e) => {
                showCellPopover(e, empIdx, dateStr, tdDay);
            });
            
            // Sum statistics
            if (value === 'X') {
                sumWorkdays += 1.0;
            } else if (value === '½') {
                sumWorkdays += 0.5;
            } else if (value === 'P') {
                sumPaidLeave += 1.0;
            } else if (value === 'L') {
                sumHoliday += 1.0;
            } else if (value === 'KP') {
                sumAbsent += 1.0;
            }
            
            tr.appendChild(tdDay);
        }
        
        // 3. Summary Calculations Columns
        const tdWork = document.createElement('td');
        tdWork.className = 'summary-col';
        tdWork.textContent = sumWorkdays || '-';
        tr.appendChild(tdWork);
        
        const tdP = document.createElement('td');
        tdP.className = 'summary-col';
        tdP.textContent = sumPaidLeave || '-';
        tr.appendChild(tdP);
        
        const tdL = document.createElement('td');
        tdL.className = 'summary-col';
        tdL.textContent = sumHoliday || '-';
        tr.appendChild(tdL);
        
        const tdKp = document.createElement('td');
        tdKp.className = 'summary-col';
        tdKp.textContent = sumAbsent || '-';
        tr.appendChild(tdKp);
        
        // Total Paid Days = Workdays + Paid Leave + Holiday
        const totalPayDays = sumWorkdays + sumPaidLeave + sumHoliday;
        const tdTotal = document.createElement('td');
        tdTotal.className = 'summary-total';
        tdTotal.textContent = totalPayDays || '-';
        tr.appendChild(tdTotal);
        
        // 4. Action buttons column
        const tdAction = document.createElement('td');
        tdAction.className = 'action-cell';
        tdAction.innerHTML = `
            <div class="action-cell-btns">
                <button class="btn-icon btn-icon-edit" title="Sửa thông tin" onclick="openEditEmployee(${empIdx})">
                    <i class="fa-solid fa-user-gear"></i>
                </button>
                <button class="btn-icon btn-icon-delete" title="Xóa nhân viên" onclick="deleteEmployee(${empIdx})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        tr.appendChild(tdAction);
        
        tbody.appendChild(tr);
    });
}

// Generate badge HTML based on state value
function getBadgeHTML(value) {
    if (!value) return '<span class="badge badge-empty">-</span>';
    
    switch (value) {
        case 'X':
            return '<span class="badge badge-x">X</span>';
        case '½':
            return '<span class="badge badge-half">½</span>';
        case 'P':
            return '<span class="badge badge-p">P</span>';
        case 'L':
            return '<span class="badge badge-l">L</span>';
        case 'KP':
            return '<span class="badge badge-kp">KP</span>';
        case 'OFF':
            return '<span class="badge badge-off">OFF</span>';
        default:
            return '<span class="badge badge-empty">-</span>';
    }
}

// Update Top Statistics Dashboard
function updateStatsDashboard(daysInMonth) {
    document.getElementById('stat-total-employees').textContent = employees.length;
    
    let totalWorkdays = 0;
    let totalPaidLeave = 0;
    let totalAbsent = 0;
    
    employees.forEach(emp => {
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDateString(currentYear, currentMonth, day);
            const val = emp.attendance[dateStr] || '';
            
            if (val === 'X') {
                totalWorkdays += 1.0;
            } else if (val === '½') {
                totalWorkdays += 0.5;
            } else if (val === 'P') {
                totalPaidLeave += 1.0;
            } else if (val === 'KP') {
                totalAbsent += 1.0;
            }
        }
    });
    
    // Formatting statistics values
    document.getElementById('stat-total-workdays').textContent = totalWorkdays % 1 === 0 ? totalWorkdays : totalWorkdays.toFixed(1);
    document.getElementById('stat-total-leave').textContent = totalPaidLeave;
    document.getElementById('stat-total-absent').textContent = totalAbsent;
}

// Render Entire UI
function renderUI() {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    // Update title text
    const displayMonth = String(currentMonth + 1).padStart(2, '0');
    document.getElementById('table-title').textContent = `BẢNG CHẤM CÔNG - THÁNG ${displayMonth}/${currentYear}`;
    
    renderTableHeader(daysInMonth);
    renderTableBody(daysInMonth);
    updateStatsDashboard(daysInMonth);
}

// Show Selector Popover on Day Cell Click
function showCellPopover(e, empIdx, dateStr, cellElement) {
    e.stopPropagation();
    selectedCellInfo = { empIdx, dateStr, cellElement };
    
    const popover = document.getElementById('cell-popover');
    popover.style.display = 'flex';
    
    // Calculate popover coordinates near click or cell
    const rect = cellElement.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Position popover below the cell, adjusting horizontally to keep visible
    let leftPos = rect.left + scrollLeft - 50;
    let topPos = rect.bottom + scrollTop + 4;
    
    // Screen boundary check
    if (leftPos < 10) leftPos = 10;
    if (leftPos + 150 > window.innerWidth) leftPos = window.innerWidth - 160;
    
    popover.style.left = `${leftPos}px`;
    popover.style.top = `${topPos}px`;
}

// Hide Cell Popover
function hideCellPopover() {
    const popover = document.getElementById('cell-popover');
    popover.style.display = 'none';
    selectedCellInfo = null;
}

// Set Attendance state for selected employee & date
function setAttendanceState(value) {
    if (!selectedCellInfo) return;
    
    const { empIdx, dateStr } = selectedCellInfo;
    
    // Update state
    employees[empIdx].attendance[dateStr] = value;
    
    // Save to local storage
    saveData();
    
    // Re-render only required parts or full UI
    renderUI();
    hideCellPopover();
}

// Employee Modal Control
function openAddEmployee() {
    document.getElementById('modal-title').textContent = 'Thêm Nhân Viên Mới';
    document.getElementById('edit-employee-idx').value = '';
    document.getElementById('employee-form').reset();
    document.getElementById('emp-id').disabled = false; // Allow edit ID for new
    
    document.getElementById('employee-modal').style.display = 'flex';
}

function openEditEmployee(idx) {
    const emp = employees[idx];
    document.getElementById('modal-title').textContent = 'Sửa Thông Tin Nhân Viên';
    document.getElementById('edit-employee-idx').value = idx;
    document.getElementById('emp-id').value = emp.id;
    document.getElementById('emp-id').disabled = true; // Disable editing ID (primary key)
    document.getElementById('emp-name').value = emp.name;
    document.getElementById('emp-position').value = emp.position || '';
    
    document.getElementById('employee-modal').style.display = 'flex';
}

function closeEmployeeModal() {
    document.getElementById('employee-modal').style.display = 'none';
}

function saveEmployee(e) {
    e.preventDefault();
    
    const editIdxStr = document.getElementById('edit-employee-idx').value;
    const empId = document.getElementById('emp-id').value.trim();
    const empName = document.getElementById('emp-name').value.trim();
    const empPosition = document.getElementById('emp-position').value.trim();
    
    if (!empId || !empName) {
        alert('Mã NV và Họ tên không được để trống.');
        return;
    }
    
    if (editIdxStr === '') {
        // Mode: ADD NEW
        // Check for ID duplication
        const duplicate = employees.find(emp => emp.id.toLowerCase() === empId.toLowerCase());
        if (duplicate) {
            alert('Mã nhân viên này đã tồn tại trong hệ thống!');
            return;
        }
        
        // Create new employee object
        const newEmp = {
            id: empId,
            name: empName,
            position: empPosition,
            attendance: {}
        };
        
        // Seed default days off (OFF) on Sundays for the current month
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(currentYear, currentMonth, d);
            if (date.getDay() === 0) { // Sunday
                const dateStr = formatDateString(currentYear, currentMonth, d);
                newEmp.attendance[dateStr] = 'OFF';
            }
        }
        
        employees.push(newEmp);
    } else {
        // Mode: EDIT
        const idx = parseInt(editIdxStr);
        employees[idx].name = empName;
        employees[idx].position = empPosition;
    }
    
    saveData();
    renderUI();
    closeEmployeeModal();
}

function deleteEmployee(idx) {
    const emp = employees[idx];
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên ${emp.name} (${emp.id})?`)) {
        employees.splice(idx, 1);
        saveData();
        renderUI();
    }
}

// Clear all attendance/employees
function clearAllData() {
    if (confirm('CẢNH BÁO: Bạn sẽ xóa toàn bộ danh sách nhân viên và dữ liệu chấm công! Bạn có chắc chắn muốn tiếp tục?')) {
        employees = [];
        saveData();
        renderUI();
    }
}

// Export to Excel / CSV with UTF-8 BOM for Vietnamese support
function exportToCSV() {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const displayMonth = String(currentMonth + 1).padStart(2, '0');
    
    let csvContent = "";
    
    // Header Line 1: Table Title
    csvContent += `BẢNG CHẤM CÔNG - THÁNG ${displayMonth}/${currentYear}\r\n`;
    
    // Header Line 2: Column Titles
    let headerRow = ["STT", "Ma NV", "Ho va Ten", "Chuc vu"];
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        headerRow.push(`${day} (${DAY_NAMES[dayOfWeek]})`);
    }
    headerRow.push("Cong Thuc Te", "Nghi Phep (P)", "Nghi Le (L)", "Khong Phep (KP)", "Tong Cong Huong Luong");
    
    csvContent += headerRow.map(val => `"${val}"`).join(",") + "\r\n";
    
    // Populate rows
    employees.forEach((emp, empIdx) => {
        let rowData = [
            empIdx + 1,
            emp.id,
            emp.name,
            emp.position || ""
        ];
        
        let sumWorkdays = 0;
        let sumPaidLeave = 0;
        let sumHoliday = 0;
        let sumAbsent = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDateString(currentYear, currentMonth, day);
            const val = emp.attendance[dateStr] || "";
            rowData.push(val);
            
            if (val === 'X') {
                sumWorkdays += 1.0;
            } else if (val === '½') {
                sumWorkdays += 0.5;
            } else if (val === 'P') {
                sumPaidLeave += 1.0;
            } else if (val === 'L') {
                sumHoliday += 1.0;
            } else if (val === 'KP') {
                sumAbsent += 1.0;
            }
        }
        
        const totalPay = sumWorkdays + sumPaidLeave + sumHoliday;
        
        rowData.push(sumWorkdays, sumPaidLeave, sumHoliday, sumAbsent, totalPay);
        
        csvContent += rowData.map(val => `"${val}"`).join(",") + "\r\n";
    });
    
    // Add BOM (Byte Order Mark) for UTF-8 so Excel displays Vietnamese correctly
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `chuanhoaAI_Bang_Cham_Cong_${displayMonth}_${currentYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Global Event Listeners & Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load configuration and state
    loadData();
    populateFilters();
    renderUI();
    
    // 2. Register filters change events
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    monthSelect.addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        saveData();
        renderUI();
    });
    
    yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        saveData();
        renderUI();
    });
    
    // 3. Action Buttons Listeners
    document.getElementById('btn-add-employee').addEventListener('click', openAddEmployee);
    document.getElementById('btn-export-csv').addEventListener('click', exportToCSV);
    document.getElementById('btn-print').addEventListener('click', () => {
        window.print();
    });
    document.getElementById('btn-clear-all').addEventListener('click', clearAllData);
    
    // 4. Modal actions
    document.getElementById('close-modal').addEventListener('click', closeEmployeeModal);
    document.getElementById('btn-cancel').addEventListener('click', closeEmployeeModal);
    document.getElementById('employee-form').addEventListener('submit', saveEmployee);
    
    // 5. Popover Options Selection
    const popoverOptions = document.querySelectorAll('.popover-option');
    popoverOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const val = opt.getAttribute('data-value');
            setAttendanceState(val);
        });
    });
    
    // 6. Dismiss popover on outside click
    document.addEventListener('click', (e) => {
        const popover = document.getElementById('cell-popover');
        if (popover.style.display === 'flex' && !popover.contains(e.target)) {
            hideCellPopover();
        }
    });
    
    // Prevent dismissing when clicking inside target table cells (handled by cell click)
    document.getElementById('attendance-table').addEventListener('click', (e) => {
        if (e.target.closest('.day-column')) {
            e.stopPropagation();
        }
    });
});

// Global functions for inline HTML event bindings (called from dynamically generated buttons)
window.openEditEmployee = openEditEmployee;
window.deleteEmployee = deleteEmployee;
