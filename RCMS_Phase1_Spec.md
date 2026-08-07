# Technical Specification: RCMS Phase 1 (Capital Monitoring Module)

## 1. System Overview

ระบบ **RCMS (Registration and Capital Monitoring System) Phase 1** มุ่งเน้นการบริหารจัดการและติดตามการประกอบทุนจดทะเบียนวิสาหกิจ (Capital Monitoring) ทั้งในรูปแบบ **ทุนเงินสด (Cash Capital)** และ **ทุนทรัพย์สิน (Asset Capital)** โดยเชื่อมต่อข้อมูลกับระบบ eBRS เดิม[cite: 1, 2] พร้อมรองรับกระบวนการตรวจสอบหลายระดับ (Approval Workflow / Four-Eyes Principle) การประทับลายเซ็นดิจิทัล (E-Sign) และการคิดค่าปรับกรณีชำระทุนเกินกำหนดเวลา (OVERDUE)

---

## 2. User Roles & Access Control (RBAC)

### 2.1 Role Definitions

1. **Owner (ผู้ประกอบการ):** ผู้ยื่นคำร้องแจ้งชำระทุนผ่าน Web / Mobile Application
2. **Maker (เจ้าหน้าที่เคาน์เตอร์ APB/MOIC):** เจ้าหน้าที่ผู้คีย์ข้อมูลคำร้องและรับชำระเงินแทน Owner ณ จุดบริการ
3. **Valuation Firm (บริษัทประเมินมูลค่าทรัพย์สิน):**
   - **In-network Firm:** มี Account ล็อกอินเข้า External Web Portal เพื่อกรอกและแนบรายงานประเมินได้เอง
   - **Out-of-network Firm:** ไม่มี Account ในระบบ (ทำรายงานกระดาษให้ Maker คีย์แทน)
4. **Checker (เจ้าหน้าที่ตรวจสอบ):** เจ้าหน้าที่ตรวจสอบความถูกต้องของคำร้อง เอกสารแนบ และหลักฐานการเงิน
5. **Approver (ผู้อนุมัติ):** ผู้มีอำนาจอนุมัติขั้นสุดท้าย และประทับลายเซ็นดิจิทัล (E-Sign)
6. **External Agencies:** หน่วยงานภายนอก (15 กระทรวง / ธนาคารกลาง / TaxRis) สำหรับค้นหาและดูรายงาน[cite: 1, 2]
7. **System Admin:** ผู้ดูแลระบบ จัดการผู้ใช้งาน, สิทธิ์ RBAC, Master Data และ Audit Logs

### 2.2 Menu Permission Matrix

| Module / Menu Item           |         Owner          |           Maker            |      Valuation Firm      |    Checker    |   Approver    | External Agencies |         Admin         |
| :--------------------------- | :--------------------: | :------------------------: | :----------------------: | :-----------: | :-----------: | :---------------: | :-------------------: |
| **Dashboard ภาพรวม**         |      View (Self)       |            View            |     View (Assigned)      |     View      |     View      |       View        |         View          |
| **Dashboard ผู้ใช้งาน**      |           -            |             -              |            -             |       -       |       -       |         -         |         View          |
| **แจ้งชำระทุน (Form Entry)** | Full (Online)[cite: 2] |  Full (Counter)[cite: 2]   |            -             |       -       |       -       |         -         |           -           |
| **คิวรายการคำร้องชำระทุน**   |           -            |        View (Self)         |            -             | Full[cite: 2] | Full[cite: 2] |         -         |           -           |
| **ติดตามสถานะการชำระทุน**    |  View (Self)[cite: 2]  |       View[cite: 2]        | View (Assigned)[cite: 2] | View[cite: 2] | View[cite: 2] |   View[cite: 2]   |     View[cite: 2]     |
| **คิวงานประเมินหลักทรัพย์**  |           -            | Full (Out-of-net)[cite: 2] |  Full (In-net)[cite: 2]  | View[cite: 2] | View[cite: 2] |         -         |           -           |
| **คำนวณและรายการค่าปรับ**    |  View (Self)[cite: 2]  |  Full (Payment)[cite: 2]   |            -             | View[cite: 2] | View[cite: 2] |         -         | Full (Rules)[cite: 2] |
| **ออกใบสั่งจ่าย / ใบเสร็จ**  |     View[cite: 2]      |       Full[cite: 2]        |            -             | View[cite: 2] | View[cite: 2] |         -         |           -           |
| **ค้นหาข้อมูลวิสาหกิจ**      |  View (Self)[cite: 2]  |       View[cite: 2]        | View (Assigned)[cite: 2] | View[cite: 2] | View[cite: 2] |   View[cite: 2]   |     View[cite: 2]     |
| **รายงานสถิติการชำระทุน**    |           -            |       View[cite: 2]        |            -             | View[cite: 2] | View[cite: 2] |   View[cite: 2]   |     View[cite: 2]     |
| **จัดการผู้ใช้งาน / RBAC**   |           -            |             -              |            -             |       -       |       -       |         -         |     Full[cite: 2]     |
| **จัดการ Master Data**       |           -            |             -              |            -             |       -       |       -       |         -         |     Full[cite: 2]     |
| **ตรวจสอบ Audit Logs**       |           -            |             -              |            -             |       -       |       -       |         -         |     View[cite: 2]     |

---

## 3. Core Business Process Workflows

### 3.1 Flow 1: Online Cash Capital (Payment Gateway)

กระบวนการยื่นแจ้งชำระทุนประเภทเงินสดผ่านช่องทางออนไลน์ โดยชำระเงินอัตโนมัติผ่าน QR Code[cite: 2]

```mermaid
sequenceDiagram
    autonumber
    actor O as ผู้ประกอบการ (Owner)
    participant R as RCMS
    participant B as APB Mobile / LAPNet
    participant C as เจ้าหน้าที่ตรวจสอบ (Checker)
    participant AP as ผู้อนุมัติ (Approver)
    participant E as กรมเทคโนโลยี (E-Sign)

    Note over O,R: ยื่นออนไลน์ Owner ทำเองผ่าน Web/Mobile

    O->>R: แจ้งชำระทุน (ประเภททุนเงินสด)[cite: 2]
    O->>R: อัปโหลดเอกสารคำร้อง (บัตร ปชช., มติที่ประชุม, ใบมอบสิทธิ)[cite: 2]
    R->>R: Validate งวดแรก >= 30% + ครบกำหนดใน 1 ปี[cite: 2]
    R-->>O: ออกใบสั่งจ่าย + สแกน QR Code (Payment Gateway)[cite: 2]
    Note over R: สถานะทุน = PENDING, สถานะชำระ = Unpaid[cite: 2]

    Note over O,B: ชำระเงินแบบอัตโนมัติ (Online Payment)
    O->>B: สแกน QR Code ชำระเงินผ่าน Mobile Banking App[cite: 2]
    B->>R: API Confirmation (Real-time Settlement & Auto-matching)[cite: 2]
    Note over R: สถานะทุน = PENDING, สถานะชำระ = Paid (อัตโนมัติ)[cite: 2]

    R->>C: ส่งเรื่องเข้าคิวรอตรวจสอบ (Inspection Queue)[cite: 2]
    C->>C: ตรวจสอบเอกสารคำร้องของผู้ประกอบการ[cite: 2]

    alt เอกสารคำร้องไม่ถูกต้อง / ไม่ครบถ้วน
        C-->>O: Return for Correction (ตีกลับ + ระบุเหตุผล)[cite: 2]
        O->>R: แก้ไขข้อมูล / แนบเอกสารใหม่ และ Resubmit[cite: 2]
    else เอกสารถูกต้องครบถ้วน
        C->>AP: ส่งต่อเรื่องให้ผู้อนุมัติ[cite: 2]
        AP->>AP: ยืนยันตัวตนด้วย MFA[cite: 2]
        AP->>E: ขอ E-Sign / PKI Certificate[cite: 2]
        E-->>AP: ส่งคืน Digital Certificate[cite: 2]
        AP->>R: อนุมัติคำร้อง + ประทับลายเซ็นดิจิทัล[cite: 2]
        R->>R: คำนวณยอดและอัปเดตสถานะการประกอบทุน[cite: 2]
        Note over R: ครบ 100% = COMPLETED<br/>ผ่อนชำระ = PARTIAL[cite: 2]
        R-->>O: ออกใบรับรองการฝากทุน (Capital Certificate) + แจ้งเตือน[cite: 2]
        R->>B: Sync ข้อมูลไปยัง eBRS / TaxRis / ระบบที่เกี่ยวข้อง[cite: 1, 2]
    end
```

### 3.2 Flow 2: Online Asset Capital

กระบวนการยื่นแจ้งชำระทุนประเภทหลักทรัพย์ผ่านออนไลน์ ร่วมกับบริษัทประเมินมูลค่าทรัพย์สิน[cite: 2]

```mermaid
sequenceDiagram
    autonumber
    actor O as ผู้ประกอบการ (Owner)
    participant R as RCMS
    participant VF as บริษัทประเมินทรัพย์สิน
    participant C as เจ้าหน้าที่ตรวจสอบ (Checker)
    participant AP as ผู้อนุมัติ (Approver)
    participant E as กรมเทคโนโลยี (E-Sign)

    Note over O,R: ยื่นเรื่องแจ้งชำระทุนด้วยทรัพย์สินผ่าน Web/Mobile

    O->>R: เลือกประเภททรัพย์สิน (ที่ดิน / อาคาร / รถยนต์ / เครื่องจักร)[cite: 2]
    O->>R: กรอกข้อมูลทรัพย์สิน + อัปโหลดเอกสารสิทธิ์/กรรมสิทธิ์[cite: 2]
    O->>R: เลือกบริษัทประเมินทรัพย์สิน (In-network / Out-of-network)[cite: 2]
    R->>VF: แจ้งเตือนรายการประเมินผ่าน External Web Portal (M.9)[cite: 2]

    Note over VF,R: ขั้นตอนประเมินและยืนยันมูลค่าทรัพย์สิน

    VF->>VF: ดำเนินการประเมินมูลค่าทรัพย์สิน[cite: 2]
    VF->>R: บันทึกมูลค่าประเมิน + อัปโหลดรายงานการประเมิน (Valuation Report)[cite: 2]

    R->>C: ส่งเรื่องเข้าคิวรอตรวจสอบ (Inspection Queue)[cite: 2]
    C->>C: ตรวจสอบเอกสารกรรมสิทธิ์ + รายงานการประเมิน[cite: 2]

    alt เอกสารกรรมสิทธิ์ไม่ถูกต้อง / ไม่ครบถ้วน
        C-->>O: Return for Correction (ตีกลับไปที่ Owner)[cite: 2]
        O->>R: แก้ไขข้อมูล / แนบเอกสารสิทธิ์ใหม่ และ Resubmit[cite: 2]
    else รายงานการประเมินมีข้อผิดพลาด
        C-->>VF: Return for Correction (ตีกลับไปที่บริษัทประเมิน)[cite: 2]
        VF->>R: อัปโหลดรายงานการประเมินฉบับแก้ไข[cite: 2]
    else ผ่านการตรวจสอบ
        C->>AP: ส่งต่อเรื่องให้ผู้อนุมัติ[cite: 2]
        AP->>AP: ยืนยันตัวตนด้วย MFA[cite: 2]
        AP->>E: ขอ E-Sign / PKI Certificate[cite: 2]
        E-->>AP: ส่งคืน Digital Certificate[cite: 2]
        AP->>R: อนุมัติคำร้อง + ประทับลายเซ็นดิจิทัล[cite: 2]
        R->>R: บันทึกมูลค่าทรัพย์สิน คำนวณยอดชำระทุนรวม[cite: 2]
        Note over R: ครบ 100% = COMPLETED<br/>ชำระบางส่วน = PARTIAL[cite: 2]
        R-->>O: ออกใบรับรองการฝากทุน (Capital Certificate) + แจ้งเตือน[cite: 2]
        R->>R: Sync ข้อมูลไปยัง eBRS / TaxRis[cite: 1, 2]
    end
```

### 3.3 Flow 3: Counter Service - Cash Capital

กระบวนการยื่นแจ้งชำระทุนเงินสด ณ จุดบริการเคาน์เตอร์ APB/MOIC โดย Maker[cite: 2]

```mermaid
sequenceDiagram
    autonumber
    actor O as ผู้ประกอบการ (Owner)
    actor M as เจ้าหน้าที่เคาน์เตอร์ (Maker)
    participant R as RCMS Center
    participant C as เจ้าหน้าที่ตรวจสอบ (Checker)
    participant AP as ผู้อนุมัติ (Approver)
    participant E as กรมเทคโนโลยี (E-Sign)

    Note over O,M: Owner เดินมาทำเรื่องที่เคาน์เตอร์ APB / MOIC

    O->>M: ยื่นเอกสารคำร้อง + หลักฐานชำระเงิน + แสดงบัตร ปชช.[cite: 2]
    M->>M: ยืนยันตัวตน Owner (Verify Identity)[cite: 2]
    M->>R: คีย์ข้อมูลคำร้อง + อัปโหลดสแกนเอกสารแนบ (ในนาม Owner)[cite: 2]
    R->>R: Validate เงื่อนไขงวดชำระทุน (งวดแรก >= 30%)[cite: 2]
    R-->>M: ออกใบสั่งจ่าย / ยืนยันรับเรื่องสำเร็จ[cite: 2]

    alt กรณีชำระด้วยเงินสด/เช็ค ที่เคาน์เตอร์
        O->>M: ชำระเงินสด / เช็ค[cite: 2]
        M->>R: บันทึกรับชำระเงินเข้าระบบ[cite: 2]
        Note over R: สถานะทุน = PENDING, สถานะชำระ = Paid[cite: 2]
    end

    R->>C: ส่งเรื่องเข้าคิวรอตรวจสอบ (Inspection Queue)[cite: 2]
    C->>C: ตรวจสอบเอกสารคำร้อง + ความถูกต้องของข้อมูลที่ Maker คีย์[cite: 2]

    alt เอกสารไม่ครบ / Maker คีย์ข้อมูลผิด
        C-->>M: Return for Correction (ตีกลับไปที่ Maker)[cite: 2]
        Note over M: Maker ติดต่อ Owner (ถ้าจำเป็น) / แก้ไขข้อมูลที่คีย์ผิด[cite: 2]
        M->>R: อัปโหลดเอกสารใหม่ / แก้ไขข้อมูล และ Resubmit[cite: 2]
    else ผ่านการตรวจสอบ
        C->>AP: ส่งต่อเรื่องให้ผู้อนุมัติ[cite: 2]
        AP->>AP: ยืนยันตัวตนด้วย MFA[cite: 2]
        AP->>E: ขอ E-Sign / PKI Certificate[cite: 2]
        E-->>AP: ส่งคืน Digital Certificate[cite: 2]
        AP->>R: อนุมัติคำร้อง + ประทับลายเซ็นดิจิทัล[cite: 2]
        R->>R: คำนวณยอดชำระและอัปเดตสถานะทุน[cite: 2]
        Note over R: ครบ 100% = COMPLETED<br/>ผ่อนชำระ = PARTIAL[cite: 2]
        R-->>M: พิมพ์ใบรับรองการฝากทุน (Capital Certificate)[cite: 2]
        M-->>O: มอบใบรับรองการฝากทุน + ใบเสร็จ ให้ Owner[cite: 2]
        R->>R: Sync ข้อมูลไปยัง eBRS / TaxRis[cite: 1, 2]
    end
```

### 3.4 Flow 4: Counter Service - Asset Capital

กระบวนการยื่นแจ้งชำระทุนหลักทรัพย์ ณ เคาน์เตอร์โดย Maker[cite: 2]

```mermaid
sequenceDiagram
    autonumber
    actor O as ผู้ประกอบการ (Owner)
    actor M as เจ้าหน้าที่เคาน์เตอร์ (Maker)
    participant R as RCMS Center
    participant VF as บริษัทประเมินทรัพย์สิน
    participant C as เจ้าหน้าที่ตรวจสอบ (Checker)
    participant AP as ผู้อนุมัติ (Approver)
    participant E as กรมเทคโนโลยี (E-Sign)

    Note over O,M: Owner ถือเอกสารสิทธิ์/กรรมสิทธิ์มาที่เคาน์เตอร์

    O->>M: ยื่นเอกสารกรรมสิทธิ์ (โฉนด/เล่มทะเบียน/ทะเบียนเครื่องจักร)[cite: 2]
    M->>M: ตรวจสอบตัวตน Owner (Verify Identity)[cite: 2]
    M->>R: คีย์ข้อมูลทรัพย์สิน + เลือกบริษัทประเมิน (In-network / Out-of-network)[cite: 2]
    R-->>M: ยืนยันการลงรับคำร้อง[cite: 2]

    Note over R,VF: ขั้นตอนการประเมินมูลค่าทรัพย์สิน

    alt เลือก In-network Firm
        R->>VF: แจ้งเตือนรายการประเมินผ่าน External Web Portal (M.9)[cite: 2]
        VF->>R: ล็อกอินเข้ามาบันทึกมูลค่า + อัปโหลดรายงานประเมิน (Valuation Report)[cite: 2]
    else เลือก Out-of-network Firm
        O->>M: ยื่นรายงานประเมินที่เป็นเอกสารกระดาษ (ถ้ามี)[cite: 2]
        M->>R: Maker เป็นคนคีย์มูลค่าประเมิน + อัปโหลดไฟล์รายงานแทน[cite: 2]
    end

    R->>C: ส่งเรื่องเข้าคิวรอตรวจสอบ (Inspection Queue)[cite: 2]
    C->>C: ตรวจสอบเอกสารกรรมสิทธิ์ + รายงานการประเมิน[cite: 2]

    alt เอกสารกรรมสิทธิ์ไม่ถูกต้อง / Maker คีย์ผิด
        C-->>M: Return for Correction (ตีกลับไปที่ Maker)[cite: 2]
        Note over M,O: Maker ตรวจสอบ / โทรแจ้ง Owner ขอเอกสารเพิ่ม[cite: 2]
        M->>R: แก้ไขข้อมูล / อัปโหลดไฟล์ใหม่ และ Resubmit[cite: 2]
    else รายงานการประเมินมีข้อผิดพลาด (กรณี In-network)
        C-->>VF: Return for Correction (ตีกลับไปที่บริษัทประเมิน)[cite: 2]
        VF->>R: อัปโหลดรายงานฉบับแก้ไข[cite: 2]
    else ผ่านการตรวจสอบ
        C->>AP: ส่งเรื่องให้ผู้อนุมัติ[cite: 2]
        AP->>AP: ยืนยันตัวตนด้วย MFA[cite: 2]
        AP->>E: ขอ E-Sign / PKI Certificate[cite: 2]
        E-->>AP: ส่งคืน Digital Certificate[cite: 2]
        AP->>R: อนุมัติคำร้อง + ประทับลายเซ็นดิจิทัล[cite: 2]
        R->>R: บันทึกมูลค่าทรัพย์สิน คำนวณสถานะทุน[cite: 2]
        R-->>M: แจ้งอนุมัติสำเร็จ / สั่งพิมพ์ใบรับรอง[cite: 2]
        M-->>O: พิมพ์/มอบใบรับรองการฝากทุนให้ Owner[cite: 2]
        R->>R: Sync ข้อมูลไป eBRS / TaxRis[cite: 1, 2]
    end
```

### 3.5 Flow 5: Overdue Penalty Handling

กระบวนการจัดการอัตโนมัติเมื่อค้างชำระทุนเกินกำหนด 1 ปี[cite: 2]

```mermaid
sequenceDiagram
    autonumber
    participant System as RCMS Batch Job
    participant Penalty as โมดูลคำนวณค่าปรับ (M.11)
    participant Noti as ระบบแจ้งเตือน (Notification)
    actor Owner as ผู้ประกอบการ (Owner)
    participant Pay as ระบบชำระเงิน (Online/Counter)

    Note over System: เฝ้าระวังวันหมดอายุชำระทุน (1 ปี)

    System->>System: ตรวจพบทุนค้างชำระเกิน 1 ปี[cite: 2]
    System->>System: อัปเดตสถานะทุนเป็น OVERDUE[cite: 2]
    System->>Penalty: ส่งข้อมูลเข้าโมดูล Penalty Management[cite: 2]

    Penalty->>Penalty: คำนวณค่าปรับอัตโนมัติตาม Rule กฎหมาย[cite: 2]
    Penalty->>Penalty: ออกใบแจ้งหนี้แยก (Separate Invoice) ค่าธรรมเนียม + ค่าปรับ[cite: 2]

    Penalty->>Noti: Trigger Alert แจ้งเตือนยอดค่าปรับ[cite: 2]
    Noti-->>Owner: ส่ง Push / SMS / Email แจ้งเตือน + ใบแจ้งหนี้ค่าปรับ[cite: 2]

    Note over Owner,Pay: ชำระค่าปรับและทุนส่วนที่เหลือ

    Owner->>Pay: ชำระเงินค่าปรับ + ทุนค้างชำระ (ผ่าน QR / App / เคาน์เตอร์)[cite: 2]
    Pay->>System: Confirm ยอดชำระสำเร็จ[cite: 2]
    System->>System: เปลี่ยนสถานะทุนเป็น COMPLETED (เมื่อชำระครบถ้วน)[cite: 2]
```

## 4. Key Data Models & Rules

### 4.1 Capital Status Rules

PENDING: ยื่นคำร้องแล้ว รอการชำระเงินหรือรอการอนุมัติ[cite: 2]
PARTIAL: ชำระทุนบางส่วน (ผ่อนชำระงวดแรก $\ge 30\%$ เรียบร้อยแล้ว)[cite: 2]
COMPLETED: ชำระทุนจดทะเบียนครบถ้วน 100%[cite: 2]
OVERDUE: เกินกำหนดชำระทุน 1 ปีนับจากวันขึ้นทะเบียน $\rightarrow$ ส่งเข้าโมดูลคำนวณค่าปรับอัตโนมัติ[cite: 2]

### 4.2 Asset Capital Categories (Collateral Master Data)

ที่ดิน (Land): โฉนด, เล่ม/หน้า/หน้าสำรวจ, เนื้อที่ (ไร่-งาน-วา), ผู้ถือครองกรรมสิทธิ์, ภาระผูกพัน
อาคาร (Building): ประเภทอาคาร, จำนวนชั้น, พื้นที่ใช้สอย ($m^2$), อายุอาคาร, ตำแหน่งที่ตั้ง
รถยนต์ (Car): เลขทะเบียน, จังหวัดที่จด, เลขตัวถัง (Chassis No.), เลขเครื่องยนต์, ยี่ห้อ/รุ่น
เครื่องจักร (Machine): ชื่อเครื่องจักร, ประเภทการวางหลักประกัน, เลขทะเบียนเครื่องจักร, ยี่ห้อ/รุ่น

## 5. UI Layout Specification: Company Detail Page

### 5.1 Top Navigation & Action Bar

Header Title: ชื่อวิสาหกิจ + เลขทะเบียนวิสาหกิจ[cite: 2]

Action Buttons: [พิมพ์ข้อมูล / ใบรับรอง][cite: 2], [แจ้งชำระทุนเพิ่ม][cite: 2]

Tab Items: ข้อมูลนิติบุคคล | ข้อมูลการประกอบทุน (Core Phase 1) | รายการหลักประกัน | ประวัติการอนุมัติ (Audit Trail)[cite: 2]

### 5.2 Card Layout Components

1. **Card: ข้อมูลนิติบุคคล:** ประเภทวิสาหกิจ, สถานะ, วันที่ขึ้นทะเบียน, ทุนจดทะเบียนรวม, เลข TaxRis[cite: 1, 2]
2. **Card: สถานะการชำระทุน:**
   **Status Badge:** COMPLETED / PARTIAL / PENDING / OVERDUE [cite: 2]
   **Progress Bar:** สัดส่วนเงินชำระแล้วเทียบกับทุนจดทะเบียนทั้งหมด
   **Countdown/Deadline:** วันหมดอายุครบกำหนด 1 ปี[cite: 2]
   **Outstanding & Penalty:** ยอดค้างชำระ และยอดค่าปรับกรณี OVERDUE[cite: 2]
3. **Card: รายการหลักประกัน (Collateral List):** ตารางแสดงรายการที่ดิน/อาคาร/รถยนต์/เครื่องจักร พร้อมลิงก์เปิดดูไฟล์รายงานประเมิน[cite: 2]
4. **Card: ประวัติรายการชำระทุน:** ตารางแสดงประวัติงวดชำระ ช่องทางชำระ สถานะ Transaction และปุ่มดาวน์โหลด E-Receipt / Capital Certificate[cite: 2]
