# RCMS Demo App

Prototype สำหรับนำเสนอโครงการ **Registration and Capital Monitoring System (RCMS)**
ความร่วมมือระหว่างกระทรวงอุตสาหกรรมและการค้า (MOIC) กับธนาคารส่งเสริมการเกษตร (APB)

เป็นเว็บแอปแบบ single-page ที่เขียนด้วย vanilla JS ล้วน (ไม่มี framework) รองรับ
2 ภาษา ลาว / อังกฤษ สลับได้ทันที และมีข้อมูลจำลอง (mock data) ที่ผูกตัวเลขให้
สอดคล้องกัน เพื่อให้สาธิต flow การทำงานได้จริงตั้งแต่ต้นจนจบ

> ข้อมูลทั้งหมดเป็น mock data สำหรับสาธิตเท่านั้น ไม่ได้เชื่อมฐานข้อมูลจริง

---

## โครงสร้างโปรเจกต์

รันผ่าน Vite เพื่อให้ import npm package จริงได้ (เช่น Leaflet สำหรับแผนที่)
แต่ build ออกมาเป็น **ไฟล์ HTML เดียวจบ** ที่ self-contained

- `src/index.html` คือ **source** ที่แก้ไข (ใช้ ES module + `import`)
- `index.html` ที่ root คือ **ไฟล์ build** (สร้างจาก `npm run build`)
  GitHub Pages เสิร์ฟจาก root นี้ และเปิดตรงๆ ด้วย `file://` ก็ได้

```
npm install
npm run dev      # dev server ที่ http://localhost:5173 (เสิร์ฟ src/)
npm run build    # build เป็นไฟล์เดียวไปทับ index.html ที่ root
npm run preview  # เสิร์ฟตัว build ไว้เช็คก่อน deploy
```

> ⚠️ แก้โค้ดที่ `src/index.html` เท่านั้น แล้ว `npm run build` จะทับ `index.html`
> ที่ root อย่าแก้ `index.html` ที่ root ตรงๆ เพราะมันคือ output ที่ถูก generate
> ทับทุกครั้งที่ build

**เหตุผลที่ต้อง build เป็นไฟล์เดียว:** แอปใช้ ES module + Leaflet ที่ browser จะรัน
ได้เฉพาะผ่าน http(s) ปลั๊กอิน `vite-plugin-singlefile` จะ inline JS/CSS ทั้งหมด และ
ฝังรูป (โลโก้ / ภาพพื้นหลัง) เป็น data URI ทำให้เหลือไฟล์ HTML เดียวที่เปิดที่ไหนก็ได้

ต้องมีเน็ตตอน `npm install` ครั้งแรก ส่วนตอนเปิดใช้งานถ้าไม่มีเน็ต ฟอนต์จะ fallback
เป็นฟอนต์ระบบ และแผนที่ / โลโก้จาก URL ภายนอกจะไม่ขึ้น (โลโก้ login มี fallback
เป็นโลโก้ที่ฝังในไฟล์อยู่แล้ว)

---

## บทบาท (Roles)

หน้า login ใส่ **ชื่อผู้ใช้ + รหัสผ่านอะไรก็ได้ + OTP 6 หลักอะไรก็ได้** (เป็น demo)
หรือเข้าแล้วสลับบทบาทได้จากเมนู avatar มุมขวาบน แต่ละบทบาทมีเมนูและหน้า Dashboard
ของตัวเอง

| ชื่อผู้ใช้ (demo) | บทบาท | หน้าแรก | เมนูที่เห็น |
|---|---|---|---|
| `lao.agri` | ผู้ประกอบการ (Business owner) | My Registered Capital | ทุนของฉัน |
| `khamla.p` | เจ้าหน้าที่เคาน์เตอร์ APB (Maker) | Counter Workspace | Dashboard, Search Enterprises |
| `sivilay.a` | เจ้าหน้าที่ตรวจสอบ (Checker) | Verification Workspace | Dashboard, Search Enterprises, Valuation Queue, Finance, Reports |
| `head.moic` | หัวหน้าพะแนก (Approver + E-Sign) | Approval Workspace | Dashboard, Search Enterprises, Valuation Queue, Finance, Reports |
| `lao.valuation` | บริษัทประเมิน (In-network firm) | My Valuation Jobs | งานประเมินของฉัน |
| `mof.gov` | หน่วยงานภายนอก (External agency) | External Portal | พอร์ทัลภายนอก |
| `bounmy.m` | ผู้ดูแลระบบ (System administrator) | System Overview | Dashboard, Search Enterprises, Reports, System Settings |

---

## ฟีเจอร์หลักตามหน้าจอ

### หน้า Login
- โลโก้ MOIC อย่างเป็นทางการ ขนาด 150×150 พร้อม white glow (โหลดจาก
  `moic.gov.la` และ fallback เป็นโลโก้ที่ฝังในไฟล์ถ้าออฟไลน์)
- ยืนยันตัวตนแบบ MFA (OTP), สลับภาษา ลาว / อังกฤษ, กู้รหัสผ่าน

### Dashboard แยกตามบทบาท
แต่ละบทบาทเห็น Dashboard ที่ออกแบบเฉพาะงานของตัวเอง

- **Maker (Counter Workspace)** งานที่ต้องทำ + ภาพรวมพอร์ต (จำนวนบริษัท, ชำระ
  แล้ว/ยังไม่ชำระ, งานที่ส่งไปแล้วรออนุมัติ, ค่าปรับค้าง)
- **Checker (Verification Workspace)** คิวตรวจสอบ (เน้นกล่องเมื่อมีงานด้วย
  เส้นขอบสีแดง gradient หมุน), งานตีกลับ, สถิติ
- **Approver (Approval Workspace)** คิวรออนุมัติ + ลงลายเซ็นดิจิทัล (เน้นกล่อง
  เมื่อมีงาน), รายการเสี่ยง / เกินกำหนด
- **System administrator (System Overview)** แยกจากงานติดตามทุน มาเน้นงานดูแล
  ระบบแทน ได้แก่
  - **System health**: ผู้ใช้ทั้งหมด / ออนไลน์ / ถูกล็อก, สถานะการเชื่อมต่อ,
    จำนวน API ที่ล้มเหลว
  - **Users & RBAC**: โดนัทผู้ใช้ตามหน่วยงาน / ตามสิทธิ์ + ตารางจำแนก
  - **Integrations & API**: สถานะ endpoint (eBRS, TaxRIS, FinLink, GovPay)
  - **System configuration**: ตารางค่าธรรมเนียม, Master data, Virtual GL
  - **Audit & security log**: บันทึกการเข้าใช้ / เปลี่ยนสิทธิ์ / เหตุการณ์ระบบ

KPI ทุกใบใช้การ์ดแบบมีกรอบ + ไอคอน [Lucide](https://lucide.dev/icons/) และกราฟ
โดนัทดีไซน์ใหม่ (segment ปลายมน เว้นช่องว่างบางๆ, legend จุดกลม, palette สีสด)

### ทะเบียนวิสาหกิจ (Search Enterprises)
- ค้นหา + กรองตามสถานะ / แขวง / ISIC / ช่วงวันจดทะเบียน
- ปุ่ม Export to Excel และ Print อยู่เหนือตาราง จัดชิดขวา

### รายละเอียดวิสาหกิจ / Case detail
- Layout 2 คอลัมน์ (Enterprise Registration Details อยู่ซ้าย, รายละเอียด/
  ฟอร์มอยู่ขวา ความสูงเท่ากัน) พร้อมแผนที่ Leaflet และไทม์ไลน์การประกอบทุน
  งวด 30% / 70%

### บันทึกการชำระทุน (Declare Capital Payment)
- ฟอร์มกรอกข้อมูลจัดเรียงอยู่แถวเดียวกับ Enterprise Registration Details
- รองรับ Single payment และแบบแบ่งชำระ 2 งวด (Instalment), แนบเอกสารหลักฐาน

### ประเมินทรัพย์สิน (Valuation)
- บริษัทประเมิน In-network เห็น My Valuation Jobs, หน้ารายละเอียดงานเป็น 2
  คอลัมน์ (Case detail / Collateral / Fields ซ้าย, Supporting documents /
  Submit result ขวา)
- Checker/Approver มี Asset Valuation Queue พร้อม KPI

### ตรวจทาน → อนุมัติ → ใบรับรอง
- Reviewer ตรวจแล้วส่งต่อหรือตีกลับ, Approver อนุมัติ + ลงลายเซ็นดิจิทัล (ต้อง MFA
  ซ้ำ), ออกใบรับรองการฝากทุน (Print Preview + ฉบับจริง/สำเนาพร้อม watermark)

### Finance
- 3 แท็บภายในเมนูเดียว: **Fees / Penalties / E-Receipts**
- แต่ละแท็บมี search filter แยกตาม criteria ของตัวเอง (เช่น Enterprise,
  Reference, Payment status, Days overdue, Receipt no, ช่วงวันที่) จัด layout
  แบบเดียวกับหน้า Search Enterprises

### Reports
- เลือกรายงานตามประเภท + ช่วงวันที่ แล้ว generate / export (ตัด chart ออก เหลือ
  ส่วนรายงาน)

### System Settings (ผู้ดูแลระบบ)
เมนูย่อยถูกจัดเป็น **แท็บภายในหน้า**: Fees / Master Data / Virtual GL / Users / API Log

- **Fees** 3 คอลัมน์ความสูงเท่ากัน: Fee by enterprise type, Fee by registered
  capital, Penalty rate per day
- **Master Data** grid 3 คอลัมน์ 2 แถว: (ISIC Code, Province, Entity type) /
  (Files, Valuation firm) ความสูงเท่ากันในแต่ละแถว
- **Virtual GL** ตารางลงบัญชีทุกการประกอบทุนที่อนุมัติแล้ว + search filter
  (Enterprise, Capital account, ช่วงวันที่, Channel, Submit by)
- **Users** จัดการผู้ใช้ / RBAC + search filter (User, Organisation, Role, Status)
- **API Log** บันทึกการเชื่อมต่อระบบภายนอก

---

## แนวทางดีไซน์ (UI conventions)

- **ไอคอนเมนู** ทุกบทบาทใช้ Lucide SVG (dashboard, search, clipboard, globe,
  banknote, chart, settings, wallet)
- **กราฟโดนัท** วงหนา ปลาย segment มน เว้นช่องว่างบางๆ, legend เป็นจุดกลม +
  ชื่อ + ตัวเลข + เปอร์เซ็นต์, ใช้ palette สีสด
  (`#3078ED #9570FF #67CFFF #2FD4C1 #FE9647 #FFC835`)
- **ปุ่มใน popup** กรณี 1 ปุ่ม ชิดขวา, กรณี 2 ปุ่มวาง secondary (Close/Cancel)
  ซ้าย และ primary ขวา
- **ตัวอักษร** หลีกเลี่ยงการใช้เครื่องหมาย em-dash ทั้งใน UI และเอกสาร ใช้ `-` แทน

---

## Business rule ที่ฝังไว้จริง (ลองกดให้ error ดูได้)

- งวดแรกต้องไม่ต่ำกว่า 30% ของทุนจดทะเบียน
- ยอดที่บันทึกต้องไม่เกินยอดคงเหลือ
- ต้องแนบเอกสารหลักฐานอย่างน้อย 1 ไฟล์
- ปุ่มออกใบรับรองกดไม่ได้จนกว่าทุนจะชำระครบ
- ผู้อนุมัติจะไม่เห็นงานจนกว่าจะผ่านการตรวจทานก่อน

---

## หมายเหตุ

- ข้อมูลทั้งหมดเป็น **mock data** ตัวเลขในระบบผูกกันให้สอดคล้อง
  (เช่น 1,284 = 742 + 311 + 133 + 98) เพื่อให้ตรวจสอบระหว่างนำเสนอได้
  ส่วนตัวเลขรายเดือนในกราฟและอัตราต่างๆ เป็นค่าสมมติสำหรับแสดงโครงสร้างรายงาน
- ชื่อสถานะบนหน้าจอใช้ภาษาลาว/ไทยเป็นหลัก และมีรหัสระบบ
  (PENDING / PARTIAL / COMPLETED / OVERDUE) กำกับไว้เพื่อเทียบกับเอกสาร requirement
- โค้ดทั้งหมดอยู่ในไฟล์เดียว (`src/index.html`) แบ่งส่วนด้วยคอมเมนต์:
  dictionary 2 ภาษา, ข้อมูล mock, helper (โดนัท / KPI / ไอคอน), ฟังก์ชัน view
  ต่อหน้าจอ (`vDash`, `vSet`, `vFin` ...), และตัว `render()` / `bind()` ที่วาดใหม่ทุกครั้ง

---

## Deploy

push ขึ้น branch `main` แล้ว GitHub Pages (Deploy from a branch, main / root) จะเสิร์ฟ
`index.html` ที่ root ให้อัตโนมัติ
