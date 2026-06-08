# TANAN Mining — Web Application Specification
## สำหรับ Claude Design / UI Redesign Brief

---

## 1. ภาพรวมโปรเจค (Project Overview)

**ชื่อบริษัท:** บริษัท ธนธรณินทร์ จำกัด (TANAN Mining Co., Ltd.)  
**ประเภทธุรกิจ:** บริษัททำเหมืองแร่ครบวงจร (Integrated Mining Operations)  
**ชื่อระบบ:** TANAN Mining Operations System  
**เวอร์ชัน:** v2.0  

**จุดประสงค์:** ระบบบริหารจัดการข้อมูลการดำเนินงานเหมืองแร่แบบครบวงจร เชื่อมต่อทุกแผนกในองค์กร รองรับทั้งภาษาไทยและภาษาอังกฤษ

---

## 2. Tech Stack

| Layer       | Technology |
|-------------|-----------|
| Frontend    | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend/DB  | Supabase (PostgreSQL + Auth + RLS) |
| Deploy      | Vercel |
| Charts      | Recharts |
| Icons       | Lucide React |
| Export      | xlsx (Excel), jsPDF (PDF) |
| Font        | Prompt (Thai + English, weight 900) |

---

## 3. Brand Identity & Design Tokens

### สีหลัก (Brand Colors)
```
Primary Dark Brown:  #1a0900 / #2a1205 / #3d1c08
Medium Brown:        #5c2c0e / #7a4018 / #9a5820
Gold Accent:         #c8902a / #e8b84a
Dark Background:     #080400 / #0c0500 / #120900
```

### โทนสีแต่ละแผนก (Department Colors)
```
Mine Operation:   Gold    #c8902a
Mine Planning:    Blue    #4a9eff
Maintenance:      Orange  #ff9040
SHE:              Green   #4ac47a
Geology:          Purple  #c87aff
Corporate:        Sky     #78c8ff
Finance:          Yellow  #ffd040
```

### Typography
- Font family: "Prompt" (ภาษาไทย + อังกฤษ)
- Heading weight: 900 (Black)
- Body weight: 400–600

### โลโก้ (Logo)
- ไฟล์: `/public/logo.png`
- พื้นหลังดำ — ใช้ `filter: brightness(3)` บนพื้นมืด
- ใช้ container สีน้ำตาลเข้มหรือพื้นขาวเพื่อแสดงบนพื้นสว่าง

---

## 4. โครงสร้างหน้า (Page Structure)

```
/                           → redirect ไป /home (หลัง login)
/auth/login                 → หน้า Login
/home                       → Hub Page (Gulf-style, dark theme)
/departments/mine-operation → แผนก Mine Operation
/departments/mine-planning  → แผนก Mine Planning
/departments/maintenance    → แผนก Maintenance
/departments/she            → แผนก SHE
/departments/geology        → แผนก Geology
/departments/corporate      → แผนก Corporate Service
/departments/finance        → แผนก Finance & Account
/dashboard                  → Dashboard รวม (legacy, สีครีม)
/dashboard/production       → Production (legacy)
/dashboard/equipment        → Equipment (legacy)
/dashboard/hr               → HR & Staff (legacy)
/dashboard/sites            → Mine Sites (legacy)
```

---

## 5. หน้า Login (`/auth/login`)

**Design:** Light cream theme, professional  
**Elements:**
- พื้นหลัง: `linear-gradient(145deg, #f9f1e6 → #eedcca)` (สีครีม/น้ำตาลอ่อน)
- Card สีขาว กลางจอ ขนาด max-width 460px
- Gold stripe ด้านบน card
- โลโก้ TANAN ขนาดใหญ่ (320×108px) บน container ขาว/ครีม — **เห็นชัดเจน**
- Badge: "Mining Operations System"
- Form: Email + Password fields (สไตล์ minimal, cream background)
- Submit button: gradient น้ำตาล-ทอง
- Footer: ชื่อบริษัทภาษาไทย + English

**Auth:** Supabase `signInWithPassword` → redirect `/home`

---

## 6. หน้า Home Hub (`/home`)

**Design Style:** ได้รับแรงบันดาลใจจาก Gulf Energy / Banpu — Premium Corporate  
**Theme:** Dark (พื้นหลังดำ/น้ำตาลเข้มมาก)

### Top Navigation Bar
- Logo TANAN (filter brightness(3) เพื่อให้เห็นบนพื้นดำ)
- Nav links: Overview | Operations | Reports | Analytics
- Right side: **TH/EN Language Toggle** | Bell notification | Admin avatar | Logout

### Hero Section
- Full-width dark gradient background
- Gold accent stripe ด้านบนสุด
- Badge: "MINING OPERATIONS SYSTEM — บริษัท ธนธรณินทร์ จำกัด"
- Heading ขนาดใหญ่ 52px (TH/EN ตาม language toggle)
- Subtitle description
- Quick stats cards (4 ใบ): Production MTD | Equipment Online | Active Staff | Safety Days

### Department Grid (7 cards, 3 columns)
แต่ละ card มี:
- Icon ประจำแผนก (colored)
- ชื่อแผนก (EN + TH)
- คำอธิบายสั้น
- Hover effect: gradient background + glow + slide up + color accent stripe ด้านบน
- Arrow → ที่เปลี่ยนสีเมื่อ hover

### Footer
- ชื่อบริษัทภาษาไทย
- Copyright

---

## 7. Department Layout (Shared)

**Sidebar (220px, dark):**
- Logo TANAN (ด้านบน)
- "กลับหน้าหลัก" button
- List แผนกทั้ง 7 พร้อม icon และ active state (colored)
- User info (avatar + email)
- **TH/EN Language Toggle**
- Logout button

**Main Content Area:**
- Dark background `#0c0500`
- Page header: icon + title + subtitle + action buttons
- Content section

---

## 8. แผนกและฟีเจอร์ (Department Features)

### 8.1 Mine Operation ✅ (สร้างแล้ว)
**ข้อมูลหลัก:** production_records (บันทึกการผลิตรายกะ)  
**ฟีเจอร์:**
- KPI cards: ผลผลิตวันนี้ / 30 วัน / จำนวน records / จำนวนกะ
- Area chart: ปริมาณการผลิต 14 วันล่าสุด
- Data table พร้อม filter (shift, search)
- **CRUD:** บันทึก/แก้ไข/ลบ ผ่าน modal
- **Export Excel:** export รายการที่ filter ไว้
- **Import Data:** upload Excel/CSV → preview → map columns → import to Supabase

**Fields:** date, site, shift (morning/afternoon/night), ore_type, volume_tons, grade_percent, operator_count, notes

### 8.2 Mine Planning 🔲 (ยังไม่สร้าง)
**ข้อมูลหลัก:** mine_plans, pit_designs, reserve_estimates  
**ฟีเจอร์ที่ต้องการ:**
- แผนการขุดรายเดือน/รายปี (Monthly/Annual Mining Plan)
- Pit Design records
- Reserve Estimate (ปริมาณสำรองแร่)
- Progress vs Plan chart
- CRUD + Export + Import

### 8.3 Maintenance 🔲 (ยังไม่สร้าง)
**ข้อมูลหลัก:** equipment (มีแล้ว), work_orders, pm_schedules, spare_parts  
**ฟีเจอร์ที่ต้องการ:**
- Work Order management (เปิด/ปิด WO)
- PM Schedule calendar
- Equipment status overview (Operational/Maintenance/Idle/Out of Service)
- Fleet utilization progress bar
- Spare parts inventory
- CRUD + Export + Import

### 8.4 SHE (Safety, Health, Environment) 🔲
**ข้อมูลหลัก:** safety_incidents, near_misses, environmental_reports  
**ฟีเจอร์ที่ต้องการ:**
- Safety Incident บันทึก (ประเภท, ความรุนแรง, วันที่, location)
- Near Miss reports
- Safe Days counter (วันที่ไม่มีอุบัติเหตุ)
- Environmental monitoring reports
- Risk matrix
- CRUD + Export + Import

### 8.5 Geology 🔲
**ข้อมูลหลัก:** drill_holes, geological_samples, survey_data  
**ฟีเจอร์ที่ต้องการ:**
- Drill Hole database (location, depth, lithology)
- Sample analysis results (grade, type)
- Geological survey data
- Section/Plan visualization (basic)
- CRUD + Export + Import

### 8.6 Corporate Service 🔲
**ข้อมูลหลัก:** employees (มีแล้ว), procurement_requests, assets  
**ฟีเจอร์ที่ต้องการ:**
- HR: พนักงาน, attendance, leave management
- จัดซื้อ: Purchase Requests, vendor management
- IT Asset tracking
- Document management (รายการ)
- CRUD + Export

### 8.7 Finance & Account 🔲
**ข้อมูลหลัก:** budget_items, expenses, cost_centers  
**ฟีเจอร์ที่ต้องการ:**
- Budget vs Actual (รายเดือน/รายปี)
- Cost Center breakdown
- Revenue tracking (ยอดขายแร่)
- Cash flow summary
- Financial charts (Bar, Line)
- CRUD + Export PDF/Excel

---

## 9. ฐานข้อมูล Supabase (Database Schema)

### ตารางที่มีแล้ว
```sql
mining_sites       -- ข้อมูล Mine Sites (5 sites)
production_records -- บันทึกการผลิตรายกะ (~270 records)
equipment          -- อุปกรณ์ (10 รายการ)
equipment_logs     -- ประวัติการใช้งานอุปกรณ์
employees          -- พนักงาน (15 คน, 8 แผนก)
attendance         -- การลงเวลา
kpi_targets        -- เป้าหมาย KPI
```

### ตารางที่ต้องสร้างเพิ่ม
```sql
work_orders        -- Maintenance work orders
pm_schedules       -- Preventive maintenance schedule
safety_incidents   -- SHE incidents
near_misses        -- Near miss reports
drill_holes        -- Geology drill holes
geological_samples -- Sample analysis
mine_plans         -- Mining plans
budget_items       -- Finance budget
expenses           -- Expense records
```

---

## 10. ระบบภาษา (i18n)

**ไฟล์:** `src/lib/translations.ts`  
**Context:** `src/contexts/LanguageContext.tsx`  
**Toggle Component:** `<LangToggle />` — ปุ่ม TH / EN ใน nav  

**ภาษาที่รองรับ:**
- 🇹🇭 ภาษาไทย (default)
- 🇬🇧 English

จำการเลือกใน `localStorage` key: `tanan_lang`

---

## 11. ระบบ Role (ต้องสร้างเพิ่ม)

| Role    | สิทธิ์ |
|---------|--------|
| Admin   | ดู + เพิ่ม + แก้ไข + ลบ + Export + Import |
| Viewer  | ดูข้อมูลได้อย่างเดียว |
| Manager | ดู + Export ได้ (ไม่สามารถแก้ไข/ลบ) |

**วิธีการ:** เก็บ role ใน Supabase Auth user_metadata หรือ table `user_roles`

---

## 12. Export Features

| Format | Library | สถานะ |
|--------|---------|--------|
| Excel (.xlsx) | xlsx | ✅ พร้อมใช้ (Mine Operation) |
| CSV | xlsx | ✅ (ใช้ xlsx export CSV ได้) |
| PDF | jsPDF | 🔲 ต้องสร้าง |

---

## 13. Import Data Feature ✅

**Flow:**
1. Upload file (.xlsx / .xls / .csv)
2. Preview ข้อมูล (แสดง 5 แถวแรก)
3. Map columns (จับคู่ column ในไฟล์กับ field ในฐานข้อมูล)
4. Auto-mapping อัตโนมัติตามชื่อ column
5. Confirm → Insert ลง Supabase
6. แสดงผล: success (จำนวน records) หรือ error message

---

## 14. Design Inspiration References

- **Gulf Energy:** https://www.gulf.co.th — Dark hero, top navigation, clean white sections
- **Banpu:** https://www.banpu.com — Sidebar left, white background, corporate feel
- **สไตล์ที่ต้องการ:** ผสมผสาน Gulf (dark hero + premium) กับ Banpu (sidebar navigation + structured content)

---

## 15. สรุป Pending Features

| Priority | Feature | รายละเอียด |
|----------|---------|-----------|
| 🔴 High | Fix build error | TypeScript errors ใน new pages ต้องแก้ก่อน deploy |
| 🔴 High | Mine Planning dashboard | CRUD + charts |
| 🔴 High | Maintenance dashboard | Work order + PM + Equipment |
| 🔴 High | SHE dashboard | Incidents + Safe days |
| 🟡 Med  | Geology dashboard | Drill holes + samples |
| 🟡 Med  | Corporate dashboard | HR + Procurement |
| 🟡 Med  | Finance dashboard | Budget vs actual + charts |
| 🟡 Med  | Role system | Admin / Viewer / Manager |
| 🟡 Med  | PDF Export | jsPDF integration |
| 🟢 Low  | Dashboard summary | Overview ของทุกแผนกในหน้าเดียว |
| 🟢 Low  | Notifications | Alert เมื่อ KPI ต่ำกว่าเป้า |
| 🟢 Low  | Mobile responsive | ปรับหน้าตาให้ใช้งานบนมือถือได้ |

---

## 16. Prompt สำหรับ Claude Design

```
ช่วยออกแบบ UI/UX สำหรับ TANAN Mining Operations System 
ซึ่งเป็น web application สำหรับบริษัทเหมืองแร่ไทย

**Brand:** บริษัท ธนธรณินทร์ จำกัด (TANAN Mining)
**สี:** น้ำตาลเข้ม (#1a0900, #3d1c08), ทอง (#c8902a, #e8b84a), พื้นดำ (#080400)
**Font:** Prompt (ภาษาไทย + อังกฤษ, weight 900)

**หน้าที่ต้องการออกแบบ:**
1. หน้า Login — สไตล์ elegant, light cream background, โลโก้ TANAN ชัดเจน
2. หน้า Home Hub — Gulf Energy style, dark hero, 7 department cards พร้อม hover effects
3. Department Dashboard (ตัวอย่าง: Mine Operation) — dark sidebar, data table, charts
4. Import Data Modal — 3-step wizard (Upload → Preview → Map → Done)
5. CRUD Modal — form สำหรับเพิ่ม/แก้ไขข้อมูล

**Design Requirements:**
- รองรับ TH/EN language toggle
- Responsive (desktop-first, mobile-friendly)
- Dark theme หลัก สำหรับ hub และ departments
- Data-dense แต่ยังดูสะอาดตา
- Premium corporate feeling เหมือน Gulf Energy / Banpu
- 7 แผนก แต่ละแผนกมีสีประจำตัว (ดูรายการในเอกสาร)
```

---

*Document สร้างโดย Claude · TANAN Mining v2.0 · มิถุนายน 2569*
