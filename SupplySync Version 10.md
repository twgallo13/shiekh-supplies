# SupplySync Version 10.0.1

## Changelog (10.0.1)

- docs: configure markdownlint and fix lint issues
- docs: normalize headings, lists, and anchors
- chore: establish Version 10.X.X scheme

# **1. Project Overview & Strategic Goals**

> Table of contents
>
- [1. Project Overview & Strategic Goals](#-1-project-overview--strategic-goals)
- [2. Role Matrix & Use Cases](#-2-role-matrix--use-cases)
- [3. Core Workflows & Escalation Paths](#-3-core-workflows--escalation-paths)
- [4. Technical Architecture & Deployment](#-4-technical-architecture--deployment)
- [5. Master Schemas](#-5-master-schemas)
- [6. Security, Governance, and Compliance](#-6-security-governance-and-compliance)
- [7. Telemetry & Logging Contract](#-7-telemetry--logging-contract)
- [8. Accessibility & Performance Budgets](#-8-accessibility--performance-budgets)
- [9. Migration & Rollback Plan](#-9-migration--rollback-plan)
- [10. Acceptance Tests & Validation Rules](#-10-acceptance-tests--validation-rules)
- [11. Release Notes & Changelog](#-11-release-notes--changelog)

<aside>
🧩

Conventions: Headings are numbered, code blocks include explicit languages, JSON is copy‑paste ready with valid syntax and representative values.

</aside>

## **1.1 Purpose**

SupplySync ERP is a **centralized enterprise platform** for managing non-merchandise supplies across a multi-location retail network.

It replaces fragmented, ad-hoc ordering processes with a **predictive, automated, and fully auditable system** that ensures:

- **Operational continuity** by preventing supply shortages
- **Lowest landed cost sourcing** through deterministic vendor logic
- **Strong governance** with immutable logs and role-aware workflows
- **Seamless collaboration** between AI agents, human operators, and developers
- **1-click deployment** via Infrastructure-as-Code and CI/CD pipelines

The system is architected to support **AI/Human/Dev collaboration**:

- AI Agents handle predictive replenishment, anomaly detection, and vendor optimization.
- Human operators (SM, DM, FM) provide contextual approvals, oversight, and exception handling.
- Developers maintain schemas, workflows, and infrastructure with strict validation and automated test coverage.

.

---

## **1.2 Strategic Goals**

The platform is governed by five **core strategic goals**:

1. **Operational Continuity**
    - Zero operational surprises through predictive analytics and replenishment triggers.
    - Enforcement of **seasonality buffers** and configurable safety stock levels.
    - Receiving workflows include **barcode alias handling** to adapt dynamically to vendor variations

        [Objective: Seamlessly integrat…](https://drive.google.com/file/d/1nKnT8wG2OemdKivz_ukpw9Rnmc1LBF0mcv_YQdlqBEE).

2. **Lowest Landed Cost**
    - Vendor selection follows strict, deterministic logic:

        **Cost → Lead Time → Preferred Vendor → SLA Compliance**.

    - Support for **functional substitution** (e.g., any “Glass Cleaner” SKU normalized via equivalentUnit) ensures the lowest comparable cost per unit

        [Objective: Seamlessly integrat…](https://drive.google.com/file/d/1nKnT8wG2OemdKivz_ukpw9Rnmc1LBF0mcv_YQdlqBEE)[Sup v8](https://drive.google.com/file/d/1CjeaEsNuDXxxeUMR58Eb4I2B_Cw6p_mhpspJdgqAQtE).

3. **Governance & Compliance**
    - **Immutable, append-only audit logs** with actor, timestamp, and mandatory reason codes.
    - Full **audit dashboard** with filtering, drill-downs, and export capability for compliance reviews

        [Objective: Seamlessly integrat…](https://drive.google.com/file/d/1nKnT8wG2OemdKivz_ukpw9Rnmc1LBF0mcv_YQdlqBEE).

    - **Quarterly access reviews** enforce the principle of least privilege.
4. **Role-Aware Control**
    - **Facility Managers (FM)**: Final authority on fulfillment, overrides, and logistics.
    - **District Managers (DM)**: Gatekeepers for store-initiated requests and restricted items.
    - **Store Managers (SM)**: Request, receive, and variance reporting at the store level.
    - **Admins**: Configure rules, manage users, and oversee audits.
    - **Cost Analysts**: Read-only access for financial validation.
    - **AI Agents**: Predictive automation, sourcing optimization, anomaly detection

        [Objective: Seamlessly integrat…](https://drive.google.com/file/d/1nKnT8wG2OemdKivz_ukpw9Rnmc1LBF0mcv_YQdlqBEE)[Supply Version 9.1.0](https://drive.google.com/file/d/16sUD0p5Kzk4kv0bg_5chbPK_xfinfX0BiyFs5KfTkPQ)[Sup v8](https://drive.google.com/file/d/1CjeaEsNuDXxxeUMR58Eb4I2B_Cw6p_mhpspJdgqAQtE).

5. **System Security & Privacy**
    - **No public endpoints** — all services are internal, behind an API gateway.
    - **SSO/OIDC authentication**, short-lived JWT sessions, and signed URLs for assets.
    - Strict **PII minimization**: user identity limited to name and work email.
    - All data encrypted **in transit (TLS 1.2+)** and **at rest (AES-256)**

        [Supply Version 9.1.0](https://drive.google.com/file/d/16sUD0p5Kzk4kv0bg_5chbPK_xfinfX0BiyFs5KfTkPQ)[Sup v8](https://drive.google.com/file/d/1CjeaEsNuDXxxeUMR58Eb4I2B_Cw6p_mhpspJdgqAQtE)**2. Role Matrix & Use Cases**

## **2.1 Role Matrix**

This matrix defines the scope, responsibilities, and system permissions for each actor. All access is governed by **Role-Based Access Control (RBAC)** and the principle of least privilege.

| **Role** | **Scope of Control** | **Primary Function** | **Key System Interactions** |
| --- | --- | --- | --- |
| **Store Manager (SM)** | Assigned Store Only | Manage day-to-day supply needs | Request orders, confirm receipt, report variances, track order history |
| **District Manager (DM)** | Assigned District | First-line approval & governance | Approve/reject store requests, monitor KPIs, enforce budget & policy |
| **Facility Manager (FM)** | Assigned Facility Region | Logistics & fulfillment authority | Approve/modify fulfillment, override vendors/shipping (reason required), manage inventory |
| **Administrator (Admin)** | System-Wide | Configuration, security, audit oversight | Manage users, configure rules, monitor audit logs, enforce governance guardrails |
| **Cost Analyst** | System-Wide (Read-Only) | Financial monitoring & vendor SLA validation | Analyze costs, variances, SLA breaches, access reporting dashboards |
| **AI Agent (System)** | System-Wide | Predictive replenishment & anomaly detection | Generate replenishment orders, optimize costs, trigger alerts, maintain audit entries |

---

## **2.2 Core Role Descriptions & Use Cases**

### **Store Manager (SM)**

- **Scope:** Limited to one store.
- **Core Responsibilities:**
  - Initiate ad-hoc orders from the **Storefront Catalog**.
  - Confirm deliveries via **case-scan, piece-scan, or barcode alias workflows**.
  - Report variances with mandatory photo and notes.
  - Track order status and history.
- **Key Use Cases:**
  - UC-1.1: Submit request for a restricted POS terminal → Status: PENDING_DM_APPROVAL.
  - UC-1.2: Track shipment → See partial shipment with multiple tracking numbers.
  - UC-1.3: Report damaged goods → Variance logged, FM resolution required.

---

### **District Manager (DM)**

- **Scope:** Manages multiple stores in a district.
- **Core Responsibilities:**
  - Approve/reject **store-initiated requests** (restricted items, off-cycle orders).
  - Enforce budget, allotments, and approval thresholds.
  - Monitor compliance via variance rates and spending dashboards.
- **Key Use Cases:**
  - UC-2.1: Review high-cost POS terminal request → Approve with justification.
  - UC-2.2: Reject unapproved product request → Provide **mandatory reasonCode**.
  - UC-2.3: Escalation: Inaction >48h auto-flags to DM’s supervisor.

---

### **Facility Manager (FM)**

- **Scope:** Oversees fulfillment/logistics across a facility region.
- **Core Responsibilities:**
  - Final approver for all **replenishment & DM-approved requests**.
  - Decide fulfillment method (**WAREHOUSE vs DIRECT_SHIP**).
  - Override vendors or shipment cadence (requires **reasonCode**, immutably logged).
  - Approve new UPC aliases submitted by stores.
- **Key Use Cases:**
  - UC-3.1: Approve consolidated replenishment PO generated by AI.
  - UC-3.2: Override vendor due to stockout risk.
  - UC-3.3: Approve new UPC alias and update schema.

---

### **Administrator (Admin)**

- **Scope:** System-wide, configuration-focused.
- **Core Responsibilities:**
  - Manage users, roles, and permissions (RBAC).
  - Configure catalog restrictions, allotment tiers, and approval rules.
  - Oversee immutable audit logs.
  - Must re-authenticate via MFA for sensitive changes.
- **Key Use Cases:**
  - UC-4.1: Create a new DM user and assign district.
  - UC-4.2: Configure POS terminals as restricted.
  - UC-4.3: Export FM override logs for quarterly compliance review.

---

### **Cost Analyst**

- **Scope:** System-wide, read-only.
- **Core Responsibilities:**
  - Analyze costs, landed price variances, vendor SLA breaches.
  - Validate sourcing logic effectiveness.
  - Build dashboards and reports.
- **Key Use Cases:**
  - UC-5.1: Generate quarterly cost variance report.
  - UC-5.2: Receive vendor SLA breach alert.
  - UC-5.3: Track FM overrides’ financial impact.

---

### **AI Agent (System)**

- **Scope:** Autonomous, system-wide.
- **Core Responsibilities:**
  - Generate predictive replenishment orders using **Forecasted Daily Usage (FDU)** and **supplyDurationDays**.
  - Enforce **lowest landed cost vendor logic**.
  - Detect anomalies (usage spikes >300%).
  - Log all actions immutably.
- **Key Use Cases:**
  - UC-6.1: Nightly replenishment run creates consolidated orders.
  - UC-6.2: Detect SLA breach and alert FM.
  - UC-6.3: Substitute equivalent unit products to minimize landed cost.

---

✅ **Status:** Conflicts across versions (e.g., catalog UX in v8.1, DM/FM override rules in v9.1.0, and UPC alias handling in v9.1.1) have been reconciled into a unified, role-precise model.

- .

# **3. Core Workflows & Escalation Paths**

## **3.1 Order Lifecycle States**

Canonical states for all orders:

- PENDING_DM_APPROVAL
- PENDING_FM_APPROVAL
- APPROVED_FOR_FULFILLMENT
- IN_TRANSIT
- PARTIALLY_RECEIVED / PARTIALLY_DELIVERED
- RECEIVED_COMPLETE / DELIVERED
- RECEIVED_VARIANCE
- CLOSED
- REJECTED
- CANCELLED

All transitions generate immutable audit entries with actor, timestamp, and (where required) **reasonCode**

[Objective: Seamlessly integrat…](https://drive.google.com/file/d/1nKnT8wG2OemdKivz_ukpw9Rnmc1LBF0mcv_YQdlqBEE)

[Supply Version 9.1.0](https://drive.google.com/file/d/16sUD0p5Kzk4kv0bg_5chbPK_xfinfX0BiyFs5KfTkPQ)

.

---

## **3.2 Workflow 1: AI-Driven Automated Replenishment**

### Sample API call

- Create replenishment order (AI Agent) — HTTP

```bash
curl -X POST "$API_BASE/api/v1/orders" \
  -H "Authorization: Bearer $AI_JWT" \
  -H "x-correlation-id: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "f1c9b0b1-8e34-4a7a-b6f4-5fd1e6d2caa3",
    "orderType": "REPLENISHMENT",
    "fulfillmentMethod": "WAREHOUSE_DEFAULT",
    "lineItems": [
      { "productId": "9b0c6c6c-2b7f-4ff8-9a37-6e7d3e2eaa11", "quantityOrdered": 24 }
    ]
  }'
```

- Node/TS (fetch)

```tsx
await fetch(`${API_BASE}/api/v1/orders`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${aiJwt}`,
    'x-correlation-id': cid,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    storeId,
    orderType: 'REPLENISHMENT',
    fulfillmentMethod: 'WAREHOUSE_DEFAULT',
    lineItems: [{ productId, quantityOrdered: 24 }]
  })
});
```

**Trigger:** Nightly batch job by AI Agent.

1. **Forecast Generation**
    - Forecasted Daily Usage (FDU) = Baseline × Seasonal Multiplier × Store Tier Multiplier.
    - Reorder Point (ROP) = Safety Stock + (Lead Time × FDU).
    - Target On-Hand = supplyDurationDays × FDU.
2. **Order Creation**
    - If inventory ≤ ROP, line items are created.
    - Items grouped by SKU, optimized by:

        **Lowest Cost → Shortest Lead Time → Preferred Vendor Rank**

        [Supply Version 9.1.0](https://drive.google.com/file/d/16sUD0p5Kzk4kv0bg_5chbPK_xfinfX0BiyFs5KfTkPQ).

    - State: ORDER_PENDING_FM_APPROVAL.
3. **FM Review**
    - FM approves → Order transmitted to vendor (API/EDI).
    - FM override (vendor, cadence, shipping) → Mandatory reasonCode logged.
    - State: ORDER_IN_TRANSIT.
4. **Merge to Goods Receipt Workflow** (see 3.4).

---

## **3.3 Workflow 2: Store-Initiated Ad-Hoc Request**

### Sample API call

- Request restricted item — HTTP

```bash
curl -X POST "$API_BASE/api/v1/orders" \
  -H "Authorization: Bearer $SM_JWT" \
  -H "x-correlation-id: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "f1c9b0b1-8e34-4a7a-b6f4-5fd1e6d2caa3",
    "orderType": "AD_HOC",
    "fulfillmentMethod": "WAREHOUSE_DEFAULT",
    "lineItems": [
      { "productId": "POS-TERM-001", "quantityOrdered": 1 }
    ],
    "justification": "Replacement terminal"
  }'
```

- Approve as DM — HTTP

```bash
curl -X POST "$API_BASE/api/v1/orders/3e0f0e1b-6f2f-4d4a-9d7a-1b2c3d4e5f60/approve" \
  -H "Authorization: Bearer $DM_JWT" \
  -H "x-correlation-id: $(uuidgen)"
```

**Trigger:** SM adds item(s) from Storefront Catalog.

1. **Request Initiation (SM)**
    - Restricted items: “Request Approval” button replaces “Add to Cart.”
    - State: ORDER_PENDING_DM_APPROVAL.
2. **DM Review**
    - Approve → Order routed to FM. State: ORDER_PENDING_FM_APPROVAL.
    - Reject → Mandatory rejectionReason, notify SM. State: REJECTED.
    - Timeout (48h) → Auto-escalation (see 3.5).
3. **FM Fulfillment**
    - Warehouse default: Assigned to next scheduled shipment.
    - Direct-Ship: Allowed only with DM approval + FM sign-off.
        - FM-initiated Direct-Ship is auto-approved.
    - State: ORDER_IN_TRANSIT.
4. **Merge to Goods Receipt Workflow** (see 3.4).

---

## **3.4 Workflow 3: Goods Receipt & Variance Handling**

### Sample API call

- Report variance — HTTP

```bash
curl -X POST "$API_BASE/api/v1/orders/3e0f0e1b-6f2f-4d4a-9d7a-1b2c3d4e5f60/line-items/7f6a5b4c-3d2e-1f0a-9b8c-7d6e5f4a3b2c/variance" \
  -H "Authorization: Bearer $SM_JWT" \
  -H "x-correlation-id: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "DAMAGED",
    "notes": "Corner crushed",
    "photoUrl": "13"
  }'
```

- Approve new UPC alias — HTTP

```bash
curl -X POST "$API_BASE/api/v1/products/9b0c6c6c-2b7f-4ff8-9a37-6e7d3e2eaa11/aliases" \
  -H "Authorization: Bearer $FM_JWT" \
  -H "x-correlation-id: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{ "upc": "078000123463" }'
```

**Trigger:** Store receives physical delivery.

1. **Receipt Confirmation (SM)**
    - **Case Scan / Piece Scan:** Normal receive.
    - **New UPC Detected:**
        - SM prompted: *“Is this [Product Name]?”*
        - If confirmed: Temporarily linked; FM approval required.
        - FM Approves → UPC added to barcodeAliases.
        - FM Rejects → Variance created.
    - State: PARTIALLY_RECEIVED → RECEIVED_COMPLETE.
2. **Variance Reporting (SM)**
    - Variance types: SHORT_SHIP, DAMAGED, WRONG_ITEM.
    - Requires photo + notes.
    - State: RECEIVED_VARIANCE.
3. **Variance Resolution (FM)**
    - Accept → Close order + trigger financial reconciliation.
    - Dispute → Offline vendor process; order held until resolution.
    - State: CLOSED

        [Objective: Seamlessly integrat…](https://drive.google.com/file/d/1nKnT8wG2OemdKivz_ukpw9Rnmc1LBF0mcv_YQdlqBEE)[Supply Version 9.1.0](https://drive.google.com/file/d/16sUD0p5Kzk4kv0bg_5chbPK_xfinfX0BiyFs5KfTkPQ).

---

## **3.5 Escalation Paths**

| **Trigger** | **Condition** | **Automated Action** | **Recipient(s)** |
| --- | --- | --- | --- |
| **DM Approval Timeout** | Order pending >48h | Escalate to DM’s supervisor | Supervisor, DM |
| **SLA Breach** | Vendor delivery delayed > leadTimeDays | Alert + attach to order | FM |
| **Demand Anomaly** | Store usage >300% historical FDU | Flag anomaly in dashboards | DM, FM |
| **Critical Stockout** | On-hand < bufferStockLevel | High-priority SMS/email alert | SM, DM, FM |
| **Bundle Escalation** | Bundle contains ≥1 restricted item | Entire bundle routed to DM | DM, FM |

---

## **3.6 Replenishment & Substitution Logic**

- **Functional Substitution:**
  - Orders satisfied by *needType* (e.g., “Glass Cleaner”), not brand.
  - EquivalentUnit normalization ensures cost-per-unit comparability.
  - Vendor engine: Check store minimums → Prefer refills → Select lowest landed cost mix

        [Objective: Seamlessly integrat…](https://drive.google.com/file/d/1nKnT8wG2OemdKivz_ukpw9Rnmc1LBF0mcv_YQdlqBEE)[Sup v8](https://drive.google.com/file/d/1CjeaEsNuDXxxeUMR58Eb4I2B_Cw6p_mhpspJdgqAQtE).

- **Shipment Cadence:**
  - Defined by supplyDurationDays per product.
  - Configurable by FM: Weekly, Monthly, or Flexible.
  - Overrides require **reasonCode**, logged immutably

        [Objective: Seamlessly integrat…](https://drive.google.com/file/d/1nKnT8wG2OemdKivz_ukpw9Rnmc1LBF0mcv_YQdlqBEE).

---

✅ **Status:**

- Version drift resolved (v8.x formulas vs v9.1.x workflow states).
- **UPC alias handling**, **direct-ship approval rules**, and **functional substitution** are integrated.
- Escalation table unified with clear triggers, actions, and recipients.

# **4. Technical Architecture & Deployment**

## **4.1 High-Level Architecture**

SupplySync ERP follows a **secure, modular, cloud-native architecture** that supports scalability, resilience, and strict governance.

### **Core Principles:**

- **Private by default**: No public endpoints except SSO login.
- **Event-driven microservices** for loose coupling and fault tolerance.
- **Audit-first design**: Every workflow action produces an immutable log.
- **Explainable AI**: Forecasts and cost optimizations must be reproducible and displayed in UI.

### **Major Components:**

1. **Client Application (SPA)**
    - Role-aware React (TypeScript) app.
    - Includes Storefront Catalog, Approval Queues, Audit Dashboard, Analytics Dashboards.
    - Supports accessibility (WCAG 2.1 AA).
2. **API Gateway / Edge Security**
    - Auth via OIDC/SSO.
    - JWT validation and request scoping at the edge.
    - Rate limiting and mTLS enforced.
3. **Microservices**
    - **OrderService**: Manages lifecycle states, approvals, variances.
    - **ProductService**: Catalog, restricted items, vendor mappings.
    - **InventoryService**: Store/warehouse stock tracking, buffer enforcement.
    - **UserService**: Roles, RBAC, assignments.
    - **NotificationService**: Email, SMS, in-app alerts.
    - **AnalyticsService**: KPIs, anomaly detection, forecasting transparency

        [Objective: Seamlessly integrat…](https://drive.google.com/file/d/1nKnT8wG2OemdKivz_ukpw9Rnmc1LBF0mcv_YQdlqBEE)[Supply Version 9.1.0](https://drive.google.com/file/d/16sUD0p5Kzk4kv0bg_5chbPK_xfinfX0BiyFs5KfTkPQ).

4. **Event Bus**
    - Asynchronous workflows via **Amazon EventBridge or AWS SNS/SQS**.
    - Example: OrderApproved event → triggers Notification + Inventory updates.
5. **Data Stores**
    - **Transactional DB (Aurora PostgreSQL)**: Orders, Products, Users, Stores.
    - **Audit DB (MongoDB/Firestore)**: Immutable append-only logs.
    - **Analytics Warehouse (BigQuery/Redshift/Athena)**: Reports, KPIs, anomaly analysis.
    - **Asset Storage (S3)**: Product images, variance photos, signed URLs only.

---

## **4.2 Technology Stack**

| **Component** | **Technology** | **Rationale** |
| --- | --- | --- |
| Frontend | React + TypeScript (bundled with Vite) | Strong typing, reusable UI components, accessibility compliance |
| Backend | Node.js (TypeScript) | Shared language with frontend, async I/O optimized |
| API Gateway | AWS API Gateway / Kong | Secure request routing & auth |
| Orchestration | Kubernetes (EKS) OR AWS Lambda (for event-driven services) | Supports both containerized & serverless deployment models |
| Databases | PostgreSQL (RDS/Aurora), MongoDB, BigQuery/Redshift | SQL for transactions, NoSQL for logs, warehouse for analytics |
| Messaging | AWS SQS/SNS / EventBridge | Reliable async processing |
| Authentication | Okta / Azure AD via OIDC; AWS Cognito broker | Enterprise-grade SSO |
| Caching | Redis (ElastiCache) | Reduce DB load, faster reads |
| IaC | Terraform | Deterministic, auditable infra provisioning |
| CI/CD | GitHub Actions | Automated testing, build, and deployment |

---

## **4.3 Deployment & CI/CD Pipeline (1-Click Install)**

The platform is designed for **repeatable, 1-click deployments**.

**Pipeline Steps:**

1. **Commit & PR** → GitHub Actions runs linting, unit/security tests.
2. **Build & Package** → Docker image or Lambda artifact.
3. **Push to Registry** → AWS ECR (container) or S3 (Lambda).
4. **Deploy to Staging** → Terraform provisions infra, runs integration tests.
5. **Manual Approval** → Product & QA leads approve promotion.
6. **Production Deployment** → Blue-green or canary rollout to EKS or Lambda stack.
7. **Automated Tests** → Lighthouse (performance, a11y), Axe (WCAG), RUM monitoring.

Rollback uses **Terraform state reversion + pre-migration DB snapshot restore**

[Supply Version 9.1.0](https://drive.google.com/file/d/16sUD0p5Kzk4kv0bg_5chbPK_xfinfX0BiyFs5KfTkPQ)

[Sup v8](https://drive.google.com/file/d/1CjeaEsNuDXxxeUMR58Eb4I2B_Cw6p_mhpspJdgqAQtE)

.

---

## **4.4 Environments**

| **Environment** | **Purpose** | **Access** | **Data Policy** |
| --- | --- | --- | --- |
| **Development** | Feature dev & local testing | Developers | Synthetic/anonymized data |
| **Staging/UAT** | Integration testing, QA validation | QA, Product, Dev Leads | Sanitized prod-like data |
| **Production** | Live system | SREs only | Real transactional data, tightly controlled |

---

## **4.5 Analytics & Audit Modules**

- **AnalyticsService**
  - Forecast transparency: Forecast = Baseline × Seasonal × Tier.
  - KPIs: Variance Rate, Anomaly Frequency, Receipt Timeliness.
  - Export: CSV download & scheduled compliance email reports

        [Objective: Seamlessly integrat…](https://drive.google.com/file/d/1nKnT8wG2OemdKivz_ukpw9Rnmc1LBF0mcv_YQdlqBEE).

- **Audit Dashboard (Admin Only)**
  - Search by actorUserId, targetEntityId, actionType.
  - Filters: date range, role, event type.
  - Drill-down into **changeSet** for each action.

---

✅ **Status:**

- Unified AWS serverless + Kubernetes approach = flexibility.
- v9.1.1 enhancements (analytics transparency, audit dashboards, cadence overrides) are included.
- Fully supports **traceability, compliance, and 1-click deployment**.

---

# **5. Master Schemas**

All schemas are defined in **JSON-like canonical format**. These serve as contracts for:

- API request/response validation
- Database design (PostgreSQL + JSONB support)
- Event-driven inter-service communication

Each schema includes **field types, constraints, and usage rules**.

---

## **5.1 Product Schema**

Represents a unique non-merchandise supply item.

{

"productId": "UUID (PK)",

"sku": "String (UNIQUE, NOT NULL)",

"productName": "String (NOT NULL)",

"description": "Text",

"category": "String",

"needType": "String (e.g., 'Glass Cleaner')",

"equivalentUnit": "String (e.g., 'ounce')",

"unitOfMeasure": "String (e.g., 'Case', 'Each')",

"itemsPerUnit": "Integer (default: 1)",

"imageUrl": "String (Signed S3 URL)",

"isRestricted": "Boolean (default: false)",

"isReplenishable": "Boolean (default: true)",

"vendorSkuMap": {

"vendorId": "UUID",

"vendorSku": "String",

"barcodeAliases": ["UPC1", "UPC2"]

},

"barcodeAliases": ["String"],

"bufferStockLevel": "Integer",

"supplyDurationDays": "Integer",

"seasonalMultiplier": "JSONB",

"createdAt": "Timestamp (UTC)",

"updatedAt": "Timestamp (UTC)"

}

✅ Supports **functional substitution** (needType + equivalentUnit).

✅ UPC alias approval workflow integrated (FM approval required).

### Developer examples

- Sample create Product (request)

```json
{
  "sku": "GLASS-CLR-32OZ",
  "productName": "Glass Cleaner 32oz",
  "description": "Ammonia-free glass cleaner",
  "category": "Cleaning",
  "needType": "Glass Cleaner",
  "equivalentUnit": "ounce",
  "unitOfMeasure": "Case",
  "itemsPerUnit": 12,
  "imageUrl": "[https://signed-s3.example.com/assets/glass-cleaner-32oz.jpg](https://signed-s3.example.com/assets/glass-cleaner-32oz.jpg)",
  "isRestricted": false,
  "isReplenishable": true,
  "vendorSkuMap": {
    "vendorId": "3b5c8d2b-1b1b-4c3f-9d76-9a6a2e1a44b1",
    "vendorSku": "VEND12345",
    "barcodeAliases": ["078000123456", "078000123463"]
  },
  "barcodeAliases": ["078000123456", "078000123463"],
  "bufferStockLevel": 24,
  "supplyDurationDays": 90,
  "seasonalMultiplier": {"Q4": 1.25}
}
```

- Sample Product (response)

```json
{
  "productId": "9b0c6c6c-2b7f-4ff8-9a37-6e7d3e2eaa11",
  "sku": "GLASS-CLR-32OZ",
  "productName": "Glass Cleaner 32oz",
  "description": "Ammonia-free glass cleaner",
  "category": "Cleaning",
  "needType": "Glass Cleaner",
  "equivalentUnit": "ounce",
  "unitOfMeasure": "Case",
  "itemsPerUnit": 12,
  "imageUrl": "[https://signed-s3.example.com/assets/glass-cleaner-32oz.jpg](https://signed-s3.example.com/assets/glass-cleaner-32oz.jpg)",
  "isRestricted": false,
  "isReplenishable": true,
  "barcodeAliases": ["078000123456", "078000123463"],
  "bufferStockLevel": 24,
  "supplyDurationDays": 90,
  "seasonalMultiplier": {"Q4": 1.25},
  "createdAt": "2025-09-18T20:00:00Z",
  "updatedAt": "2025-09-18T20:00:00Z"
}
```

---

## **5.2 Store Schema**

### Developer examples

- Sample create Store (request)

```json
{
  "storeName": "Downtown LA",
  "districtId": "a2c0c4a0-7e2f-4b1e-8f7e-5a7c3c9d1e11",
  "address": {
    "street": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90012"
  },
  "tier": "Large"
}
```

- Sample Store (response)

```json
{
  "storeId": "f1c9b0b1-8e34-4a7a-b6f4-5fd1e6d2caa3",
  "storeName": "Downtown LA",
  "districtId": "a2c0c4a0-7e2f-4b1e-8f7e-5a7c3c9d1e11",
  "address": {
    "street": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90012"
  },
  "tier": "Large",
  "createdAt": "2025-09-18T20:05:00Z",
  "updatedAt": "2025-09-18T20:05:00Z"
}
```

Represents a physical retail location.

{

"storeId": "UUID (PK)",

"storeName": "String",

"districtId": "UUID (FK)",

"address": {

"street": "String",

"city": "String",

"state": "String",

"zip": "String"

},

"tier": "Enum('Small', 'Medium', 'Large')",

"createdAt": "Timestamp (UTC)",

"updatedAt": "Timestamp (UTC)"

}

---

## **5.3 Order Schema**

### Developer examples

- Sample create Order (request)

```json
{
  "storeId": "f1c9b0b1-8e34-4a7a-b6f4-5fd1e6d2caa3",
  "createdByUserId": "0e3a8d47-53f4-4b3a-8c0c-3a3d0d9a1b22",
  "orderType": "AD_HOC",
  "fulfillmentMethod": "WAREHOUSE_DEFAULT",
  "lineItems": [
    {
      "productId": "9b0c6c6c-2b7f-4ff8-9a37-6e7d3e2eaa11",
      "quantityOrdered": 2
    }
  ],
  "justification": "New store opening supplies"
}
```

- Sample Order (response)

```json
{
  "orderId": "3e0f0e1b-6f2f-4d4a-9d7a-1b2c3d4e5f60",
  "storeId": "f1c9b0b1-8e34-4a7a-b6f4-5fd1e6d2caa3",
  "createdByUserId": "0e3a8d47-53f4-4b3a-8c0c-3a3d0d9a1b22",
  "orderType": "AD_HOC",
  "status": "PENDING_DM_APPROVAL",
  "fulfillmentMethod": "WAREHOUSE_DEFAULT",
  "lineItems": [
    {
      "lineItemId": "7f6a5b4c-3d2e-1f0a-9b8c-7d6e5f4a3b2c",
      "productId": "9b0c6c6c-2b7f-4ff8-9a37-6e7d3e2eaa11",
      "quantityOrdered": 2,
      "quantityReceived": 0,
      "costPerUnit": 14.99,
      "selectedVendorId": "3b5c8d2b-1b1b-4c3f-9d76-9a6a2e1a44b1"
    }
  ],
  "trackingNumbers": [],
  "createdAt": "2025-09-18T20:10:00Z",
  "updatedAt": "2025-09-18T20:10:00Z",
  "auditTrail": [
    {
      "timestamp": "2025-09-18T20:10:00Z",
      "userId": "0e3a8d47-53f4-4b3a-8c0c-3a3d0d9a1b22",
      "role": "SM",
      "action": "CREATED"
    }
  ]
}
```

Captures all order requests and fulfillment tracking.

{

"orderId": "UUID (PK)",

"storeId": "UUID (FK, NOT NULL)",

"createdByUserId": "UUID (FK, NOT NULL)",

"orderType": "Enum('REPLENISHMENT', 'AD_HOC', 'FM_INITIATED')",

"status": "Enum('PENDING_DM_APPROVAL','PENDING_FM_APPROVAL','APPROVED_FOR_FULFILLMENT','IN_TRANSIT','PARTIALLY_RECEIVED','RECEIVED_COMPLETE','RECEIVED_VARIANCE','CLOSED','REJECTED','CANCELLED')",

"fulfillmentMethod": "Enum('WAREHOUSE_DEFAULT','DIRECT_SHIP')",

"justification": "Text",

"rejectionReason": "Text",

"lineItems": [

{

"lineItemId": "UUID",

"productId": "UUID (FK)",

"quantityOrdered": "Integer",

"quantityReceived": "Integer",

"costPerUnit": "Decimal(2)",

"selectedVendorId": "UUID (FK)",

"variance": {

"type": "Enum('SHORT_SHIP','DAMAGED','WRONG_ITEM')",

"notes": "Text",

"photoUrl": "Signed S3 URL"

}

}

],

"trackingNumbers": ["String"],

"createdAt": "Timestamp (UTC)",

"updatedAt": "Timestamp (UTC)",

"auditTrail": [

{

"timestamp": "Timestamp",

"userId": "UUID",

"role": "Enum(SM,DM,FM,ADMIN,AI_AGENT)",

"action": "Enum('CREATED','APPROVED','REJECTED','OVERRIDE','FULFILLED')",

"reasonCode": "String (optional)"

}

]

}

✅ Direct-Ship clarified: **SM requests → DM approval → FM sign-off**.

✅ FM overrides always require **reasonCode**.

---

## **5.4 User Schema**

### Developer examples

- Sample create User (request)

```json
{
  "fullName": "Alex Rivera",
  "email": "[alex.rivera@example.org](mailto:alex.rivera@example.org)",
  "role": "DM",
  "assignment": { "type": "district", "id": "a2c0c4a0-7e2f-4b1e-8f7e-5a7c3c9d1e11" }
}
```

- Sample User (response)

```json
{
  "userId": "4a8e5b7c-9f10-4b3d-8e2c-1a2b3c4d5e6f",
  "fullName": "Alex Rivera",
  "email": "[alex.rivera@example.org](mailto:alex.rivera@example.org)",
  "role": "DM",
  "assignment": { "type": "district", "id": "a2c0c4a0-7e2f-4b1e-8f7e-5a7c3c9d1e11" },
  "createdAt": "2025-09-18T20:12:00Z",
  "updatedAt": "2025-09-18T20:12:00Z"
}
```

Represents authenticated users via IdP.

{

"userId": "UUID (PK)",

"fullName": "String",

"email": "String",

"role": "Enum('SM','DM','FM','COST_ANALYST','ADMIN','AI_AGENT')",

"assignment": {

"type": "Enum('store','district','region')",

"id": "UUID"

},

"createdAt": "Timestamp (UTC)",

"updatedAt": "Timestamp (UTC)"

}

---

## **5.5 AuditEntry Schema**

### Developer examples

- Sample append AuditEntry (request)

```json
{
  "targetEntityId": "3e0f0e1b-6f2f-4d4a-9d7a-1b2c3d4e5f60",
  "actorUserId": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
  "actorRole": "FM",
  "actionType": "OVERRIDE",
  "reasonCode": "STOCKOUT_RISK",
  "changeSet": {
    "originalVendorId": "11111111-1111-1111-1111-111111111111",
    "newVendorId": "22222222-2222-2222-2222-222222222222",
    "costDelta": -2.35
  }
}
```

- Sample AuditEntry (response)

```json
{
  "auditId": "c0ffee00-1234-5678-9abc-def012345678",
  "targetEntityId": "3e0f0e1b-6f2f-4d4a-9d7a-1b2c3d4e5f60",
  "actorUserId": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
  "actorRole": "FM",
  "actionType": "OVERRIDE",
  "reasonCode": "STOCKOUT_RISK",
  "changeSet": {
    "originalVendorId": "11111111-1111-1111-1111-111111111111",
    "newVendorId": "22222222-2222-2222-2222-222222222222",
    "costDelta": -2.35
  },
  "createdAt": "2025-09-18T20:15:00Z"
}
```

Immutable log entry.

{

"auditId": "UUID (PK)",

"targetEntityId": "UUID",

"actorUserId": "UUID",

"actorRole": "Enum(SM,DM,FM,ADMIN,AI_AGENT)",

"actionType": "String",

"changeSet": "JSONB",

"reasonCode": "String",

"createdAt": "Timestamp (UTC)"

}

✅ Used by Audit Dashboard with drill-down and filter capability.

---

## **5.6 AllotmentRequest Schema**

### Developer examples

- Sample create AllotmentRequest (request)

```json
{
  "storeId": "f1c9b0b1-8e34-4a7a-b6f4-5fd1e6d2caa3",
  "productId": "9b0c6c6c-2b7f-4ff8-9a37-6e7d3e2eaa11",
  "requestedDays": 60,
  "reasonCode": "SEASONAL_LOW_DEMAND"
}
```

- Sample AllotmentRequest (response)

```json
{
  "allotmentId": "ab12cd34-ef56-7890-ab12-cd34ef567890",
  "storeId": "f1c9b0b1-8e34-4a7a-b6f4-5fd1e6d2caa3",
  "productId": "9b0c6c6c-2b7f-4ff8-9a37-6e7d3e2eaa11",
  "requestedDays": 60,
  "reasonCode": "SEASONAL_LOW_DEMAND",
  "status": "PENDING_FM_APPROVAL",
  "createdAt": "2025-09-18T20:18:00Z",
  "updatedAt": "2025-09-18T20:18:00Z"
}
```

(From v8.1 amendment — reconciled into master.)

{

"allotmentId": "UUID (PK)",

"storeId": "UUID (FK)",

"productId": "UUID (FK)",

"requestedDays": "Integer",

"reasonCode": "String",

"status": "Enum('PENDING_FM_APPROVAL','APPROVED','REJECTED')",

"createdAt": "Timestamp (UTC)",

"updatedAt": "Timestamp (UTC)"

}

✅ Supports **store-requested lower supply duration** (e.g., 60 instead of 90 days).

---

✅ **Status:**

- Schemas are now **fully consistent across versions**.
- Integrated **functional substitution**, **UPC alias handling**, and **allotment request logic**.
- Free of duplication and drift — dev-ready for API + DB implementation.

# **6. Security, Governance, and Compliance**

## **6.1 Authentication & Authorization**

- **Authentication**
  - All access federated via **OIDC/SSO** with enterprise IdP (e.g., Okta, Azure AD).
  - AWS Cognito acts as broker, issues **short-lived JWTs** (no persistent credentials).
  - MFA required for Admin elevation.
- **Authorization (RBAC)**
  - Enforced at **two layers**:
        1. **Edge (API Gateway / Lambda Authorizer):** Validates JWT, extracts role & assignment, rejects unauthorized requests with 403 Forbidden.
        2. **Service Layer:** Services perform fine-grained checks (e.g., SM may only order for their storeId).
  - Roles: SM, DM, FM, Cost Analyst, Admin, AI Agent (see Role Matrix).

---

## **6.2 Data Security & Privacy**

- **Encryption**
  - TLS 1.2+ for all transport.
  - AES-256 at rest (KMS keys for RDS, S3, OpenSearch).
- **Least Privilege**
  - Cost fields visible only to FM, Cost Analyst, Admin.
  - SM/DM APIs strip sensitive pricing data.
- **Asset Protection**
  - Product images and variance photos stored in **private S3 buckets**.
  - Access only via **pre-signed, time-limited URLs**.
- **PII Policy**
  - Minimal PII stored (user name, work email).
  - Managed and protected under corporate IdP’s controls.

---

## **6.3 Audit & Compliance**

- **Immutable Audit Trail**
  - Every workflow action (create, approve, reject, override, receive, variance) logged with:
    - userId, role, timestamp, actionType, reasonCode (if required).
  - Audit logs append-only; never mutable or deletable.
- **Audit Dashboard (Admin)**
  - Search by actorUserId, targetEntityId, actionType.
  - Filter by role, action, or timeframe.
  - Drill-down into **changeSet** JSON.
  - Export CSV or schedule compliance reports.
- **Quarterly Access Reviews**
  - Automated report of all active users and roles.
  - Admin + Compliance officer validation required.

---

## **6.4 Governance Policies**

- **Approval Chain Governance**
  - SM → DM → FM enforced for restricted or ad-hoc requests.
  - FM overrides logged with **mandatory reasonCode**.
- **Admin Guardrails**
  - High-privilege changes (RBAC, workflows, tolerances) require **MFA re-authentication**.
  - Dual-control workflow (planned) for destructive ops (e.g., archived data deletion).
- **Compliance Readiness**
  - System is **audit-ready by design**.
  - Full support for **SOX, GDPR, and internal corporate audit standards**.
  - Logs retained indefinitely in AWS Glacier for regulatory traceability.

---

✅ **Status:**

- Resolved drift: v8.x DR rules (RPO/RTO) merged with v9.1.x compliance controls.
- Unified **RBAC enforcement model**, **audit-first logging**, and **MFA guardrails**.
- Complete, developer-ready specification for securing every layer of the system.

---

# **7. Telemetry & Logging Contract**

## **7.1 Event Envelope (Canonical)**

All services (frontend & backend) MUST emit **structured JSON** using this envelope. Every business/system event is embedded in payload.

{

"timestamp": "ISO_8601_UTC_Timestamp",

"logLevel": "INFO | WARN | ERROR | CRITICAL",

"serviceName": "orders-service | web-app | gateway",

"correlationId": "UUID (trace a single request)",

"eventName": "OrderCreated | OrderApproved | ServiceError | ...",

"user": {

"userId": "UUID|null",

"userRole": "SM|DM|FM|ADMIN|COST_ANALYST|AI_AGENT|null",

"clientIp": "String|null"

},

"payload": {}

}

Canonical envelope aligns with 9.1.0’s standard event structure and correlation requirements and 8.x’s structured JSON mandate.

**Rules**

- timestamp MUST be UTC ISO-8601 with milliseconds.
- correlationId generated at the **edge** and propagated via headers (x-correlation-id) across services.
- No PII beyond user name/email already protected by IdP; do not log secrets, tokens, or pre-signed URLs.

---

## **7.2 Business Events (Required Minimum)**

These events are the **system-of-record** for workflow progression and analytics.

### **OrderCreated**

**Trigger:** SM submits ad-hoc order, FM creates order, or AI generates replenishment.

**payload:**

{ "orderId":"UUID","storeId":"UUID","orderType":"REPLENISHMENT|AD_HOC|FM_INITIATED","lineItemCount":123,"totalCost":123.45 }

Defined and required in 9.1.0/9.1.1.

### **OrderApproved**

**Trigger:** DM or FM approval.

{ "orderId":"UUID","approvedByUserId":"UUID","approverRole":"DM|FM","timeToApproveSeconds":5421 }

.

### **OrderRejected**

**Trigger:** DM rejection.

{ "orderId":"UUID","rejectedByUserId":"UUID","rejectionReason":"String" }

.

### **FulfillmentOverridden**

**Trigger:** FM changes vendor/shipping/cadence (reason required).

{ "orderId":"UUID","overriddenByUserId":"UUID","reasonCode":"STOCKOUT_RISK","originalVendorId":"UUID","newVendorId":"UUID","costDelta":-2.35 }

.

### **VarianceReported**

**Trigger:** SM flags discrepancy during goods receipt.

{ "orderId":"UUID","lineItemId":"UUID","storeId":"UUID","varianceType":"SHORT_SHIP|DAMAGED|WRONG_ITEM","reportedByUserId":"UUID" }

.

### **Analytics-supporting signals**

- ProductSearch (search terms, filters, result_count) and forecast transparency metrics feed Store Quality KPIs and anomaly detection.

---

## **7.3 Security & System Events**

### **UserLoginSuccess / UserLoginFailure**

Tracks SSO outcomes (failure includes failureReason).

### **ApiRequest (Gateway middleware; INFO)**

{"httpMethod":"POST","endpoint":"/api/v1/orders","responseStatusCode":201,"durationMilliseconds":128}

.

### **ServiceError (ERROR/CRITICAL)**

{"errorMessage":"String","stackTrace":"Text","requestPayload":"JSON"}

Used across services for unhandled exceptions.

### **PrivilegedAction**

Admin-level changes (RBAC, workflow settings); include mfa_elevated:true.

### **VendorSlaBreach**

Late delivery detection for Cost Analyst & FM alerting.

---

## **7.4 Transport, Storage, and Query**

- **Emission:** Services log JSON to **CloudWatch** (or stdout in containers).
- **Aggregation:** CloudWatch → **Kinesis Firehose** → **S3 data lake** (partitioned by /dt=YYYY-MM-DD/service=) for long-term retention & Athena queries.
- **Observability adapters:** Compatible with ELK/Datadog ingestion if required by SREs.
- **Warehousing:** Selected events (business KPIs) mirrored to **Athena/BigQuery/Redshift** for dashboards and forecasting models.
- **Retention:** Online 30–90 days, cold (Glacier) per compliance policy.

---

## **7.5 OpenTelemetry & Propagation**

- Adopt **W3C Trace Context** (traceparent, tracestate) to correlate frontend → gateway → services.
- Map trace_id to correlationId in the envelope for uniformity.
- Exporters: OTLP → collector → sinks (CloudWatch/Datadog) as configured (compatible with 9.1.0 central logging).

---

## **7.6 Sampling & Privacy**

- **Default:** 100% sample for **business events** listed above.
- **Errors:** Always 100%.
- **High-volume info logs:** 10–25% sampling acceptable, but never down-sample required KPI events.
- **Redaction:** Middleware MUST hash or drop secrets (JWTs, access tokens, pre-signed URLs). Cost fields visible in events only for FM/Cost Analyst/Admin contexts per RBAC data-minimization.

---

## **7.7 Dashboards & Alerts (Minimum Set)**

- **Ops:** API p95 latency, error rate, ServiceError counts, queue lag.
- **Business:** Approvals per day, DM timeout escalations, variance rate, SLA breach count, receipt timeliness, anomaly frequency.
- **Security:** Login failures, privileged actions, audit export jobs.

    Export CSV and scheduled email reports for compliance (DM/FM/Analyst roles).

---

## **7.8 Validation (CI/CD Gates)**

- Lint events against **JSON Schemas** below.
- Block deploy if:
  - Required fields missing or invalid enum.
  - New event types not registered in taxonomy.
  - A11y/perf budgets violated in telemetry-labeled Lighthouse runs (cross-link with Section 8).

---

## **7.9 JSON Schemas (Authoritative)**

### **Envelope**

{

"$id": "<https://supplysync/schemas/telemetry/envelope.json>",

"type": "object",

"required": ["timestamp","logLevel","serviceName","correlationId","eventName","payload"],

"properties": {

"timestamp": {"type":"string","format":"date-time"},

"logLevel": {"enum":["INFO","WARN","ERROR","CRITICAL"]},

"serviceName": {"type":"string"},

"correlationId": {"type":"string"},

"eventName": {"type":"string"},

"user": {

"type":"object",

"properties": {

"userId":{"type":["string","null"]},

"userRole":{"enum":["SM","DM","FM","ADMIN","COST_ANALYST","AI_AGENT",null]},

"clientIp":{"type":["string","null"]}

},

"additionalProperties": false

},

"payload": {"type":"object"}

},

"additionalProperties": false

}

### **OrderApproved payload**

{

"$id": "<https://supplysync/schemas/telemetry/order-approved.json>",

"type": "object",

"required": ["orderId","approvedByUserId","approverRole","timeToApproveSeconds"],

"properties": {

"orderId": {"type":"string"},

"approvedByUserId": {"type":"string"},

"approverRole": {"enum":["DM","FM"]},

"timeToApproveSeconds": {"type":"integer","minimum":0}

},

"additionalProperties": false

}

(Analogous schemas for OrderCreated, OrderRejected, FulfillmentOverridden, VarianceReported, ServiceError.) Event field requirements and shapes are consolidated from 9.1.0/9.1.1.

---

## **7.10 Node/TypeScript Reference Implementation**

**Gateway middleware (Express-style)**

import { randomUUID } from "crypto";

import type { Request, Response, NextFunction } from "express";

export function correlation(req: Request, res: Response, next: NextFunction) {

const cid = req.header("x-correlation-id") || randomUUID();

(req as any).correlationId = cid;

res.setHeader("x-correlation-id", cid);

next();

}

**Logger utility**

type LogLevel = "INFO"|"WARN"|"ERROR"|"CRITICAL";

interface Envelope {

timestamp: string; logLevel: LogLevel; serviceName: string; correlationId: string;

eventName: string; user?: { userId?: string|null; userRole?: string|null; clientIp?: string|null };

payload: Record<string, unknown>;

}

export function emit(eventName: string, payload: Record<string, unknown>, ctx: {

level?: LogLevel; serviceName: string; correlationId: string; user?: Envelope["user"];

}) {

const env: Envelope = {

timestamp: new Date().toISOString(),

logLevel: ctx.level ?? "INFO",

serviceName: ctx.serviceName,

correlationId: ctx.correlationId,

eventName,

user: ctx.user,

payload

};

// stdout for CloudWatch/Firehose ingestion

console.log(JSON.stringify(env));

}

**Usage example (DM approval)**

emit("OrderApproved",

{ orderId, approvedByUserId: dmId, approverRole: "DM", timeToApproveSeconds },

{ serviceName: "orders-service", correlationId: req.correlationId, user: { userId: dmId, userRole: "DM", clientIp: req.ip } }

);

**Redaction guard (example)**

export function redact(o: any) {

if (!o) return o;

const s = JSON.stringify(o);

return s

.replace(/"authorization":"[^"]+"/ig, '"authorization":"[REDACTED]"')

.replace(/"token":"[^"]+"/ig, '"token":"[REDACTED]"');

}

---

## **7.11 Data Model Linkage**

- Every business event references the **canonical IDs** from Section 5 (Orders, Users, Stores, Products) to ensure joinability in Athena/warehouse.
- Forecast transparency displayed in Analytics UI must be reproducible from logged inputs:

    Forecast = Baseline Usage × Seasonal Multiplier × Store Tier Multiplier.

---

**Traceability to sources:** Standard event envelope & key events (9.1.0); analytics exports, KPIs, and explainable forecasts (9.1.1); JSON-structured logging, S3/Athena lake, telemetry taxonomy & NFR gates (v8.x).

# **8. Accessibility & Performance Budgets**

## **8.1 Accessibility Standards**

SupplySync ERP must comply with **WCAG 2.1 Level AA**. Accessibility is treated as a non-negotiable acceptance criterion.

**Core Requirements:**

- **Keyboard Navigability:**

    All interactive elements (buttons, links, form fields, menus) must be operable via keyboard. No workflow should require a mouse.

- **Screen Reader Support:**
  - Use semantic HTML5 (<nav>, <main>, <button>, <form>, etc.).
  - ARIA attributes applied only where necessary.
  - Dialogs, modals, and alerts must announce state changes.
- **Color & Contrast:**
  - Text and icons must meet **4.5:1 contrast ratio** minimum (3:1 for large text).
  - No information may be conveyed by color alone (e.g., approval states must include icons/labels).
- **Forms & Validation:**
  - Inputs require programmatically associated labels.
  - Errors must be clear, descriptive, and announced to assistive tech.
- **Localization:**
  - All text must be translatable (i18n-ready).
  - RTL layouts supported.

---

## **8.2 Performance Budgets**

Performance targets are strict and **enforced via CI/CD gates**. Builds failing these budgets are **blocked from promotion**.

| **Metric** | **Budget** | **Notes** |
| --- | --- | --- |
| Largest Contentful Paint (LCP) | < 2.5s | Measured on median 4G mobile |
| Interaction to Next Paint (INP) | < 200ms | All role-critical workflows |
| Cumulative Layout Shift (CLS) | < 0.1 | Prevents visual instability |
| P95 API Latency | < 200ms | For all backend API endpoints |
| Catalog Search p95 | < 350ms | Includes filters/sorting |
| Order API p95 | < 250ms | Submission, approval, variance |
| Dashboard Load | < 1s (cached) | SLA for DM/FM dashboards |
| Initial JS Bundle | < 500KB gzipped | Includes React + core libs |

---

## **8.3 Enforcement & Testing**

- **Automated CI/CD Gates:**
  - **Lighthouse Audits**: Validate LCP, INP, CLS, best practices. Score <90 fails build.
  - **Axe-Core Scans**: WCAG 2.1 checks; critical violations block deploy.
- **Manual Accessibility Testing (Pre-release):**
  - Screen readers: JAWS, NVDA, VoiceOver.
  - Keyboard-only workflows validated for order creation, approval, variance handling.
- **Production Monitoring (RUM):**
  - Collect Core Web Vitals from real users.
  - Alert thresholds: >10% of sessions violating budgets triggers incident review.

---

## **8.4 Governance & Reporting**

- Accessibility compliance and performance regressions are **treated as Sev-2 incidents**.
- Quarterly **A11y/Perf review reports** are auto-exported for compliance officers.
- Accessibility acceptance tests are linked to UC flows (see Section 10).

# **9. Migration & Rollback Plan**

## **9.1 Migration Strategy**

The rollout follows a **phased deployment** to reduce operational risk.

- **Phase 1 – Pilot Rollout**
  - Scope: 1 district (~10 stores)
  - Duration: 2 weeks
  - Goal: Validate order workflows, approval chain, receiving variance handling
- **Phase 2 – Regional Expansion**
  - Scope: All West-Coast districts
  - Duration: 2 weeks
  - Goal: Validate warehouse load balancing, direct-ship volume, SLA monitoring
- **Phase 3 – National Rollout**
  - Scope: All districts
  - Duration: 1 week
  - Goal: Full adoption with enterprise-wide monitoring and anomaly detection

---

## **9.2 Pre-Migration Checklist (T–7 Days)**

1. **Data Cleanup & Mapping**
    - Deduplicate vendors in legacy system
    - Map legacy SKUs → new Product schema (needType, equivalentUnit, barcodeAliases)
    - Flag unmapped SKUs for FM manual review
2. **User Provisioning**
    - Verify IdP role assignments (SM, DM, FM, Admin, Cost Analyst)
    - Run access audit to confirm **least-privilege RBAC**
3. **Infrastructure Readiness**
    - Execute terraform apply for production infra (VPC, RDS, OpenSearch, S3 buckets, EventBridge rules)
    - Validate networking: only private subnets accessible
4. **Database Prep**
    - Backup legacy DB snapshot
    - Provision clean Aurora cluster with PITR (5-min RPO)
5. **Communication**
    - Notify pilot stores with cutover schedule, training docs, and support channels

---

## **9.3 Migration Execution (Go-Live)**

1. **Enable Maintenance Mode** on legacy app (read-only).
2. **Run ETL Migration Job** (AWS Glue / Lambda):
    - Transform legacy orders into new schema (status, lineItems, auditTrail).
    - Map UPCs; unknown UPCs queued for FM validation.
    - Idempotent job – safe to rerun without duplication.
3. **Deploy Application** via CI/CD (Terraform infra + app containers/Lambdas).
4. **DNS Cutover** → point corporate domain to new load balancer.
5. **Smoke Test** by core project team:
    - Login, product search, restricted item request, approval chain, order receipt.

---

## **9.4 Post-Migration Validation**

- **Monitoring Window:** 72h heightened monitoring
  - API latency
  - Order approval SLA
  - Variance workflow completion
  - Vendor SLA breaches
- **User Feedback:** Dedicated Slack/Helpdesk for SM/DM/FM
- **Go/No-Go Checkpoint:** 48h after pilot; leadership decides continuation

---

## **9.5 Rollback Plan**

Rollback is **last resort** (triggered by Severity 1 issues).

**Triggers:**

- Users cannot log in or create orders
- Widespread data corruption
- Critical security vulnerability

**Rollback Procedure (RTO < 1h):**

1. **Decision:** Incident commander declares rollback.
2. **DNS Revert** to legacy load balancer.
3. **Disable New System** by gating API Gateway (503 responses).
4. **Restore Legacy DB:** Apply latest pre-migration snapshot.
5. **Disable Maintenance Mode** on legacy app (resume read/write).
6. **Post-Mortem:** Root cause analysis before rescheduling migration.

# **10. Acceptance Tests & Validation Rules**

## **10.1 Functional Acceptance Tests**

| **Test ID** | **Role(s)** | **Scenario** | **Expected Result** |
| --- | --- | --- | --- |
| **AT-01** | SM | Create a normal replenishment order | Status = PENDING_DM_APPROVAL |
| **AT-02** | DM | Reject order | ReasonCode required, order → REJECTED, SM notified |
| **AT-03** | FM | Approve DM-approved order | Status = APPROVED_FOR_FULFILLMENT, routed to vendor |
| **AT-04** | FM | Override vendor | ReasonCode required, override logged immutably |
| **AT-05** | Admin | Add new restricted product | Product shows “Requires DM Approval” badge |
| **AT-06** | Cost Analyst | Generate cost variance report | CSV export generated, financial metrics validated |
| **AT-13** | SM | Mass-receive full PO with one click | All lineItems marked received; order → RECEIVED_COMPLETE |
| **AT-14** | SM | Case scan receive | Case pack qty auto-applied |
| **AT-15** | SM/FM | Unknown UPC workflow | SM prompted, FM approval required; alias persisted if approved |
| **AT-16** | AI Agent/FM | Replenishment selects cheapest SKU mix | Sprayer minimum enforced, refills preferred, lowest landed cost chosen |
| **AT-17** | FM | Transit load balancing | Batch over capacity triggers FM intervention, stockout-critical prioritized |
| **AT-18** | SM/DM/FM | Restricted product ordered | Order requires SM→DM→FM chain |
| **AT-19** | DM | Store directory access | DM only sees stores in their district |
| **AT-20** | FM | Override in Store Profile | ReasonCode required, logged in audit |
| **AT-21** | FM/DM | Store Quality Metrics dashboard | Updates nightly, visible to DM/FM |
| **AT-22** | SM | Unauthorized store profile access | Returns 403 Forbidden |
| **AT-23** | SM/FM | New UPC scanned and confirmed | SM sees confirmation, FM queue shows approval task |
| **AT-24** | AI Agent | Functional substitution | AI selects alternate brand of glass cleaner at lowest cost/unit |
| **AT-25** | SM | Catalog search | Query “receipt paper” returns all relevant SKUs |
| **AT-26** | SM/DM | Restricted POS terminal request | “Request Approval” button shown, routed to DM |
| **AT-27** | DM | Export Store Quality Metrics | CSV export successful |
| **AT-28** | Admin | Audit Dashboard filter | Query FM_OVERRIDE events in last 7 days |

---

## **10.2 API & Data Validation Rules**

| **Entity** | **Field** | **Rule** | **Error Code** |
| --- | --- | --- | --- |
| **Order** | status | Must be valid enum | INVALID_STATUS |
| **Order** | lineItems | Must contain ≥1 item | EMPTY_ORDER |
| **Order** | storeId | Must match authenticated user (if SM) | INVALID_STORE_ID |
| **Line Item** | quantity | Integer > 0 | INVALID_QUANTITY |
| **Product** | costPerUnit | Positive decimal(2) | INVALID_COST |
| **User** | role | Must be valid enum | INVALID_ROLE |
| **AllotmentRequest** | requestedDays | Must be ≥1 and ≤365 | INVALID_REQUESTED_DAYS |

---

## **10.3 Non-Functional Requirement (NFR) Validation**

| **NFR ID** | **Category** | **Requirement** | **Test / Measurement** |
| --- | --- | --- | --- |
| **NFR-PERF-01** | Performance | Core Web Vitals must be “Good” | Lighthouse CI/CD audits |
| **NFR-ACC-01** | Accessibility | WCAG 2.1 AA compliance | Axe-Core scan in pipeline; manual screen reader test |
| **NFR-SEC-01** | Security | Sensitive fields not exposed | API contract test (SM/DM endpoints must hide costPerUnit) |
| **NFR-RPO-01** | Reliability | RPO ≤ 5m | Validate RDS PITR config |
| **NFR-RTO-01** | Reliability | RTO ≤ 1h | Quarterly rollback drill |
| **NFR-OBS-01** | Observability | 100% of business events logged | Validate against telemetry schemas (see Section 7) |

---

## **10.4 Continuous Validation in CI/CD**

- **Automated Gates:**
  - Unit tests ≥ 80% coverage (orders, approvals, receiving, invoices)
  - Integration tests for SM→DM→FM flow, Direct-Ship, variance handling
  - Performance budgets enforced (see Section 8)
  - Accessibility scans enforced (see Section 8)
  - Telemetry validation (Section 7 schemas)
- **Staging Sign-off:**
  - Smoke test: login, catalog search, restricted order approval, goods receipt
  - Data integrity: migrated SKUs match expected mappings
- **Quarterly Audit Tests:**
  - FM override traceability
  - Admin MFA elevation
  - Access review export

# **11. Release Notes & Changelog**

## **Version 9.1.1 — Consolidated Master (Current)**

**Date:** 2025-09-18

**Author:** System (Integrated)

### **New Features & Enhancements**

- **Functional Substitution:**
  - Introduced needType and equivalentUnit in Product schema.
  - Enables AI/FM substitution for lowest landed cost across equivalent SKUs.
- **UPC Alias Handling:**
  - Receiving workflow updated for *new barcode detection*.
  - SM confirms → FM approves → Alias persisted in Product schema.
- **Replenishment Cadence:**
  - supplyDurationDays field supports Weekly, Monthly, Flexible cadences.
  - FM overrides require reasonCode.
- **Direct-Ship Clarification:**
  - Confirmed fulfillmentMethod field supports both WAREHOUSE_DEFAULT and DIRECT_SHIP.
  - Amazon/vendor orders configurable at FM approval step.
- **Storefront Catalog UX:**
  - Authentication required.
  - Search, filters, categories available.
  - Restricted items show “Request Approval” button instead of Add-to-Cart.
- **Analytics & KPIs Expansion:**
  - Forecasts displayed as:

        Forecast = Baseline Usage × Seasonal Multiplier × Store Tier Multiplier

  - Added Store Quality Metrics: Variance Rate, Anomaly Frequency, Receipt Timeliness.
  - CSV + scheduled email exports supported.
- **Audit Dashboard:**
  - Admin-facing UI with search, filters, drill-down into changeSets.
  - Supports compliance exports.
- **Acceptance Tests AT-23 → AT-28:**
  - Cover UPC alias handling, substitution, restricted catalog items, analytics exports, and audit dashboard.

### **Fixes & Clarifications**

- Version drift resolved across v8.x → v9.1.0.
- Unified escalation paths and DM/FM override rules.
- Governance clarified with **mandatory reasonCodes** for all overrides.

---

## **Version 9.1.0 — Consolidated Master (Superseded)**

**Date:** 2025-09-12

### **Features**

- Introduced **system-wide RBAC enforcement** at API Gateway and service layers.
- Immutable **auditTrail schema** with reasonCodes.
- **Direct-Ship approval logic** formalized (SM→DM→FM).
- **Telemetry event envelope** standardized (JSON logs, correlationId).
- Introduced **quarterly access reviews** and MFA elevation for Admin actions.

### **Fixes**

- Corrected approval timeout escalation logic.
- Normalized order states (APPROVED_FOR_FULFILLMENT instead of legacy SHIPPED).

---

## **Version 8.0.x Series — Amendments (Retired)**

- **v8.0.0**: Established canonical SM→DM→FM approval chain, baseline schemas, IaC model.
- **v8.1**:
  - Added Storefront catalog UX specs.
  - Receiving workflows: case-scan, barcode alias approval.
  - Transit load balancing + AllotmentRequest schema.
  - KPIs: Cost-to-Serve, SLA%, Stockout-Risk.
- **v8.2 (Proposed):**
  - Store directory & profile UI.
  - Role-aware navigation tree.
  - Store Quality Metrics dashboards.
  - Acceptance Tests AT-19 → AT-22.
