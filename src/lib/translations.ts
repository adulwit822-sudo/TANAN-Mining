export type Lang = 'th' | 'en'

export const translations = {
  th: {
    // Nav
    nav: {
      overview: 'ภาพรวม', operations: 'การดำเนินงาน', reports: 'รายงาน', analytics: 'วิเคราะห์ข้อมูล',
      logout: 'ออกจากระบบ', backHome: 'กลับหน้าหลัก', departments: 'แผนก',
    },
    // Home
    home: {
      badge: 'ระบบบริหารงานเหมืองแร่ — บริษัท ธนธรณินทร์ จำกัด',
      title1: 'ศูนย์ควบคุม',
      title2: 'การดำเนินงานเหมืองแร่',
      subtitle: 'ระบบบริหารจัดการข้อมูลแบบครบวงจร เชื่อมต่อทุกแผนกในองค์กร\nเพื่อการตัดสินใจที่รวดเร็วและแม่นยำ',
      selectDept: 'เลือกแผนก',
      enterDept: 'เข้าสู่แผนก',
      safetyDays: 'วันที่ปลอดภัย',
    },
    // KPI labels
    kpi: {
      productionMTD: 'ผลผลิตสะสม', equipmentOnline: 'อุปกรณ์ที่ใช้งาน',
      activeStaff: 'พนักงานปฏิบัติงาน', safetyDays: 'วันปลอดภัย',
    },
    // Departments
    dept: {
      mineOperation:  { label: 'Mine Operation',   labelTh: 'ปฏิบัติการเหมือง',  desc: 'ข้อมูลการผลิต, บันทึก Shift, รายงานประจำวัน' },
      minePlanning:   { label: 'Mine Planning',    labelTh: 'วางแผนเหมือง',      desc: 'แผนการขุด, Pit Design, Reserve Estimate' },
      maintenance:    { label: 'Maintenance',      labelTh: 'ซ่อมบำรุง',         desc: 'PM Schedule, Work Order, อะไหล่คงคลัง' },
      she:            { label: 'SHE',              labelTh: 'ความปลอดภัย',       desc: 'Safety Incident, Near Miss, Environmental Report' },
      geology:        { label: 'Geology',          labelTh: 'ธรณีวิทยา',         desc: 'Drill Hole, Sample Data, Geological Survey' },
      corporate:      { label: 'Corporate Service',labelTh: 'บริการองค์กร',      desc: 'HR, จัดซื้อ, IT, ทรัพย์สิน' },
      finance:        { label: 'Finance & Account',labelTh: 'การเงิน & บัญชี',   desc: 'งบการเงิน, Cost Control, Budget vs Actual' },
    },
    // Mine Operation page
    mineOp: {
      title: 'Mine Operation', subtitle: 'ข้อมูลการผลิตและบันทึก Shift',
      addRecord: 'บันทึกข้อมูล', exportExcel: 'ส่งออก Excel', importData: 'นำเข้าข้อมูล', refresh: 'รีเฟรช',
      today: 'วันนี้', last30: '30 วันล่าสุด', records: 'รายการ', shifts: 'กะ',
      chartTitle: 'ปริมาณการผลิต — 14 วันล่าสุด',
      search: 'ค้นหา...', allShifts: 'ทุกกะ', morning: 'เช้า', afternoon: 'บ่าย', night: 'กลางคืน',
      date: 'วันที่', site: 'สถานที่', shift: 'กะ', oreType: 'ประเภทแร่',
      volume: 'ปริมาณ (ตัน)', grade: 'เกรด (%)', operators: 'ผู้ปฏิบัติงาน', actions: 'จัดการ',
      edit: 'แก้ไข', delete: 'ลบ', cancel: 'ยกเลิก', save: 'บันทึก', saving: 'กำลังบันทึก...',
      addTitle: 'บันทึกข้อมูลการผลิต', editTitle: 'แก้ไขข้อมูล',
      confirmDelete: 'ยืนยันการลบ?', confirmDeleteDesc: 'ข้อมูลจะถูกลบถาวร ไม่สามารถกู้คืนได้',
      notes: 'หมายเหตุ', notesPlaceholder: 'หมายเหตุเพิ่มเติม...', selectSite: 'เลือก Site',
    },
    // Import
    import: {
      title: 'นำเข้าข้อมูล', subtitle: 'อัปโหลดไฟล์ Excel หรือ CSV เพื่อนำเข้าข้อมูล',
      dragDrop: 'ลากไฟล์มาวางที่นี่ หรือ', browse: 'เลือกไฟล์',
      supported: 'รองรับ .xlsx, .xls, .csv',
      preview: 'ตัวอย่างข้อมูล', rowCount: 'แถว', colCount: 'คอลัมน์',
      mapColumns: 'จับคู่คอลัมน์', dbField: 'ฟิลด์ในระบบ', fileColumn: 'คอลัมน์ในไฟล์',
      ignore: '— ไม่นำเข้า —',
      confirmImport: 'ยืนยันนำเข้า', importing: 'กำลังนำเข้า...',
      success: 'นำเข้าข้อมูลสำเร็จ', successDesc: 'รายการ', error: 'เกิดข้อผิดพลาด',
      close: 'ปิด', back: 'ย้อนกลับ',
    },
  },

  en: {
    nav: {
      overview: 'Overview', operations: 'Operations', reports: 'Reports', analytics: 'Analytics',
      logout: 'Logout', backHome: 'Back to Home', departments: 'Departments',
    },
    home: {
      badge: 'Mining Operations System — TANAN Co., Ltd.',
      title1: 'Control Center for',
      title2: 'Mining Operations',
      subtitle: 'An integrated data management system connecting all departments\nfor fast and accurate decision making.',
      selectDept: 'Select Department',
      enterDept: 'Enter Department',
      safetyDays: 'Safety Days',
    },
    kpi: {
      productionMTD: 'Production MTD', equipmentOnline: 'Equipment Online',
      activeStaff: 'Active Staff', safetyDays: 'Safety Days',
    },
    dept: {
      mineOperation:  { label: 'Mine Operation',   labelTh: 'Mine Operation',  desc: 'Production data, Shift records, Daily reports' },
      minePlanning:   { label: 'Mine Planning',    labelTh: 'Mine Planning',   desc: 'Mining plan, Pit design, Reserve estimate' },
      maintenance:    { label: 'Maintenance',      labelTh: 'Maintenance',     desc: 'PM schedule, Work orders, Spare parts inventory' },
      she:            { label: 'SHE',              labelTh: 'SHE',             desc: 'Safety incidents, Near miss, Environmental reports' },
      geology:        { label: 'Geology',          labelTh: 'Geology',         desc: 'Drill holes, Sample data, Geological survey' },
      corporate:      { label: 'Corporate Service',labelTh: 'Corporate',       desc: 'HR, Procurement, IT, Assets' },
      finance:        { label: 'Finance & Account',labelTh: 'Finance',         desc: 'Financial statements, Cost control, Budget vs actual' },
    },
    mineOp: {
      title: 'Mine Operation', subtitle: 'Production data and shift records',
      addRecord: 'Add Record', exportExcel: 'Export Excel', importData: 'Import Data', refresh: 'Refresh',
      today: 'Today', last30: 'Last 30 Days', records: 'Records', shifts: 'Shifts',
      chartTitle: 'Production Volume — Last 14 Days',
      search: 'Search...', allShifts: 'All Shifts', morning: 'Morning', afternoon: 'Afternoon', night: 'Night',
      date: 'Date', site: 'Site', shift: 'Shift', oreType: 'Ore Type',
      volume: 'Volume (t)', grade: 'Grade (%)', operators: 'Operators', actions: 'Actions',
      edit: 'Edit', delete: 'Delete', cancel: 'Cancel', save: 'Save', saving: 'Saving...',
      addTitle: 'Add Production Record', editTitle: 'Edit Record',
      confirmDelete: 'Confirm Delete?', confirmDeleteDesc: 'This action cannot be undone.',
      notes: 'Notes', notesPlaceholder: 'Additional notes...', selectSite: 'Select Site',
    },
    import: {
      title: 'Import Data', subtitle: 'Upload an Excel or CSV file to import data',
      dragDrop: 'Drag & drop file here, or', browse: 'Browse',
      supported: 'Supports .xlsx, .xls, .csv',
      preview: 'Data Preview', rowCount: 'rows', colCount: 'columns',
      mapColumns: 'Map Columns', dbField: 'Database Field', fileColumn: 'File Column',
      ignore: '— Ignore —',
      confirmImport: 'Confirm Import', importing: 'Importing...',
      success: 'Import successful', successDesc: 'records', error: 'Import failed',
      close: 'Close', back: 'Back',
    },
  },
} as const
