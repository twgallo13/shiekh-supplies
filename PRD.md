# SupplySync ERP - Product Requirements Document (v2.0)

A centralized enterprise platform for managing non-merchandise supplies across a multi-location retail network with predictive automation and role-aware workflows. This document outlines the core features, user roles, data schemas, and design principles required for implementation.

## 1. Core Objectives & Experience Qualities

The platform is designed to achieve specific strategic business goals while delivering a high-quality user experience.

### Strategic Goals

- **Operational Continuity**: Prevent supply shortages through predictive analytics and automated replenishment triggers.
- **Lowest Landed Cost**: Utilize deterministic logic to source supplies at the best possible price.
- **Governance & Compliance**: Ensure every action is tracked in an immutable, auditable log with clear accountability.
- **Role-Aware Control**: Provide precise, role-based permissions to ensure users only see and act on what's relevant to them.

### Experience Qualities

- **Professional**: A clean, enterprise-grade interface that builds trust and confidence.
- **Efficient**: Streamlined workflows that minimize clicks and cognitive load for all users.
- **Transparent**: Clear visibility into order status, approval chains, costs, and the logic behind system-generated decisions.

## 2. User Roles & Permissions

Access and functionality are strictly governed by the user's assigned role.

| Role | Scope of Control | Primary Function |
| :--- | :--- | :--- |
| **Store Manager (SM)** | Assigned Store Only | Manage day-to-day supply needs: request orders, confirm receipt, report variances. |
| **District Manager (DM)**| Assigned District | First-line approval for store requests, budget enforcement, and policy monitoring. |
| **Facility Manager (FM)**| Assigned Facility Region | Final authority on logistics and fulfillment; can override vendors and shipping methods. |
| **Administrator (Admin)**| System-Wide | Configure rules, manage users and roles, and oversee system-wide audits. |
| **Cost Analyst** | System-Wide (Read-Only) | Monitor financials, validate vendor SLAs, and analyze cost variances. |
| **AI Agent (System)** | System-Wide | Autonomously generate predictive replenishment orders and detect anomalies. |

## 3. Essential Features & User Stories

### 3.1 Role-Based Dashboard

- **User Story 1**: As a **Store Manager**, I want to see a summary of my recent orders and their current status on my dashboard so that I can quickly track my supplies.
- **User Story 2**: As a **District Manager**, I need my dashboard to immediately show me any store requests that are pending my approval so that I can take action without delay.
- **User Story 3**: As a **Facility Manager**, I want a high-level view of fulfillment KPIs and any escalated issues so I can manage regional logistics effectively.
- **Success Criteria**: Upon login, each user sees a personalized dashboard with relevant data and clear calls-to-action for their role.
- **Technical Considerations**: Requires API endpoints that provide role-specific data (e.g., `GET /api/v1/dashboard`).

### 3.2 Order Management Workflow

- **User Story 1**: As a **Store Manager**, I need to create an ad-hoc order for a restricted item (e.g., a POS terminal) and provide a justification, so that it can be routed for approval.
- **User Story 2**: As a **District Manager**, I must be able to approve or reject a store's request for a restricted item, providing a mandatory reason if I reject it.
- **User Story 3**: As a **Store Manager**, I must be able to confirm receipt of an order via a barcode scan and report any variances (damaged, short-shipped) with photo evidence.
- **Success Criteria**: Orders flow through the correct SM → DM → FM approval chain, and every status change is captured in an immutable audit trail.
- **Technical Considerations**: Involves `POST /api/v1/orders`, `POST /api/v1/orders/{id}/approve`, and `POST /api/v1/orders/{id}/variance`.

### 3.3 Storefront Catalog

- **User Story 1**: As a **Store Manager**, I need to search and browse a catalog of approved supplies so I can easily find the items I need.
- **User Story 2**: When I select a non-restricted item, I want to add it directly to my cart. When I select a restricted item, the button should change to "Request Approval" to make the workflow clear.
- **Success Criteria**: Users can find products quickly via search and filters. The purchasing controls (Add to Cart vs. Request Approval) are enforced at the UI level based on the product's `isRestricted` flag.
- **Technical Considerations**: Requires `GET /api/v1/products` with search and filter parameters.

### 3.4 Audit & Analytics Dashboard

- **User Story 1**: As an **Admin**, I need to search and filter the complete audit trail by user, date, or action type (e.g., "FM Override") to support compliance reviews.
- **User Story 2**: As a **Cost Analyst**, I want to view dashboards on cost variance and vendor SLA compliance, and be able to export this data as a CSV for reporting.
- **Success Criteria**: Provides complete, searchable visibility into all system activity, with data export capabilities for compliance and financial analysis.
- **Technical Considerations**: Requires `GET /api/v1/audit-entries` and `GET /api/v1/analytics/reports`.

## 4. Data Schemas (Simplified)

These are simplified models for UI development. The full, authoritative schemas are in the master technical specification.

### Product

```json
{
  "productId": "UUID",
  "sku": "String",
  "productName": "String",
  "imageUrl": "String (Signed URL)",
  "isRestricted": "Boolean",
  "barcodeAliases": ["String"]
}
Order
JSON

{
  "orderId": "UUID",
  "storeId": "UUID",
  "status": "Enum('PENDING_DM_APPROVAL', 'IN_TRANSIT', 'RECEIVED_COMPLETE', 'RECEIVED_VARIANCE')",
  "orderType": "Enum('REPLENISHMENT', 'AD_HOC')",
  "lineItems": [{ "productId": "UUID", "quantityOrdered": "Integer" }],
  "auditTrail": [{ "timestamp": "Timestamp", "action": "String", "role": "String" }],
  "createdAt": "Timestamp"
}
User
JSON

{
  "userId": "UUID",
  "fullName": "String",
  "email": "String",
  "role": "Enum('SM', 'DM', 'FM', 'ADMIN', 'COST_ANALYST')"
}
5. Core API Endpoints
GET /api/v1/orders: Fetches a list of orders relevant to the current user's role and scope.

POST /api/v1/orders: Creates a new ad-hoc or replenishment order.

POST /api/v1/orders/{id}/approve: Approves an order (DM or FM action).

POST /api/v1/orders/{id}/variance: Reports a variance for a received order.

GET /api/v1/products: Fetches products for the catalog with search and filter capabilities.

POST /api/v1/products/{id}/aliases: Adds a new UPC alias to a product, pending FM approval.

GET /api/v1/audit-entries: Fetches audit logs with filtering options.

6. Edge Case Handling
Connection Loss: The application should preserve the state of forms or carts offline and sync upon reconnection.

Role Changes: If an admin changes a user's role, their UI and permissions must update immediately upon the next action or page refresh.

Approval Timeouts: Orders pending approval for more than 48 hours must be automatically escalated to the approver's supervisor with a notification.

Invalid UPC Scans: The UI must guide the SM through a workflow to confirm a new, unrecognized barcode and submit it for FM approval as a new alias.

Variance Disputes: The workflow must clearly support uploading photo evidence and notes, and place the order into a RECEIVED_VARIANCE state for FM resolution.

7. Design System
Design Direction
The design should feel professional, trustworthy, and efficient - similar to enterprise tools like ServiceNow or Salesforce. Clean lines, purposeful hierarchy, and subtle interactions that feel responsive without being flashy. Minimal interface with generous whitespace serves the information-dense nature of supply chain data.

Color Selection
Complementary (opposite colors) - Using professional blue-gray as primary with warm amber accents for actions and alerts. This creates trust and urgency where needed.

Primary Color: Deep blue-gray (oklch(0.25 0.02 250)) - Conveys professionalism and stability

Secondary Colors: Light gray backgrounds (oklch(0.96 0.005 250)) for subtle content areas

Accent Color: Warm amber (oklch(0.7 0.15 70)) for call-to-action buttons and important status indicators

Foreground/Background Pairings:

Background (Light Gray): Dark text (oklch(0.15 0.01 250)) - Ratio 14.2:1 ✓

Primary (Deep Blue): White text (oklch(0.99 0 0)) - Ratio 12.8:1 ✓

Accent (Warm Amber): Dark text (oklch(0.15 0.01 250)) - Ratio 6.1:1 ✓

Font Selection
Typography should convey clarity and professionalism with excellent readability for data-heavy interfaces. Inter font family provides the clean, technical precision needed for enterprise applications.

Typographic Hierarchy:

H1 (Page Title): Inter Bold/32px/tight spacing

H2 (Section Headers): Inter SemiBold/24px/normal spacing

H3 (Card Titles): Inter Medium/18px/normal spacing

Body Text: Inter Regular/16px/relaxed line height

Small Text (Meta): Inter Regular/14px/normal spacing

Animations
Animations should be subtle and functional, reinforcing the professional nature while providing clear feedback. Motion should feel precise and purposeful, never distracting from the work at hand.

Purposeful Meaning: Smooth transitions communicate system reliability and responsiveness.

Hierarchy of Movement: Status changes and approvals deserve the most animation attention, followed by navigation transitions, with subtle hover states for interactive elements.

Component Selection
Components: Cards for order summaries, Tables for data lists, Dialogs for approvals, Forms with inline validation, Badges for status indicators, Tabs for dashboard sections.

Customizations: Status timeline component for order tracking, Approval queue with batch actions, Analytics chart components for KPIs.

States: Buttons show loading, success, and error states; Form inputs provide immediate validation feedback; Status indicators use color + icon combinations.

Icon Selection: Phosphor icons for clean, consistent iconography throughout the interface.

Spacing: Consistent 4px grid with 16px base unit for component padding and 24px for section margins.

Mobile: Responsive stack layouts with collapsible navigation, touch-friendly 44px minimum tap targets, and simplified approval workflows.
