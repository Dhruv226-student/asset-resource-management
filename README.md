# AssetFlow

## Enterprise Asset & Resource Management System

AssetFlow is a centralized web application that helps organizations manage their physical assets and shared resources.

Instead of maintaining asset details in spreadsheets, paper registers, or separate files, an organization can use AssetFlow to know:

- What assets are available
- Who is currently using an asset
- Which department owns or uses an asset
- Where an asset is located
- What condition the asset is in
- When an asset should be returned
- Which assets require maintenance
- Which rooms, vehicles, or equipment are already booked

AssetFlow can be used by offices, schools, hospitals, factories, government agencies, and any other organization that manages equipment, furniture, vehicles, rooms, or shared resources.

---

## Hackathon Problem

Many organizations still manage assets manually using spreadsheets and paper records. This creates problems such as:

- The same asset being assigned to multiple people
- Missing information about who currently holds an asset
- Overlapping room, vehicle, or equipment bookings
- Delayed maintenance
- Missing or damaged assets not being identified
- No proper record of transfers and returns
- Difficulty generating reports

Our solution is to build a secure and user-friendly ERP system that manages the complete lifecycle of organizational assets and shared resources.

---

## What We Are Building

We are building a responsive web-based Asset and Resource Management System with the following main modules.

### 1. Authentication and Role Management

Users can create an Employee account and log in using email and password.

Roles are not selected during signup. An Admin assigns or promotes users to roles such as:

- Admin
- Asset Manager
- Department Head
- Employee

This prevents users from giving themselves unauthorized access.

### 2. Dashboard

The dashboard provides a quick overview of the organization.

It shows information such as:

- Available assets
- Allocated assets
- Assets under maintenance
- Active resource bookings
- Pending transfer requests
- Upcoming returns
- Overdue returns

### 3. Organization Setup

The Admin can manage the basic organization data:

- Departments
- Asset categories
- Employees
- Employee roles
- Department heads
- Active and inactive users

### 4. Asset Registration and Tracking

Asset Managers can register assets such as:

- Laptops
- Computers
- Furniture
- Vehicles
- Machines
- Projectors
- Tools

Each asset receives a unique Asset Tag, such as `AF-0001`.

The system stores:

- Asset name
- Category
- Serial number
- Purchase date
- Cost
- Condition
- Location
- Images or documents
- Current status

Possible asset statuses include:

- Available
- Allocated
- Reserved
- Under Maintenance
- Lost
- Retired
- Disposed

### 5. Asset Allocation and Transfer

Assets can be assigned to an employee or department.

The system prevents double allocation. For example, when a laptop is already assigned to one employee, another employee cannot be assigned the same laptop.

Instead, the user can create a transfer request.

Transfer workflow:

`Requested → Approved → Re-allocated`

The system also stores allocation, transfer, return, and condition history.

### 6. Shared Resource Booking

Employees can book shared resources such as:

- Meeting rooms
- Vehicles
- Projectors
- Equipment
- Laboratories

The system validates booking times and prevents overlapping bookings.

For example:

- Existing booking: 9:00 AM to 10:00 AM
- New request: 9:30 AM to 10:30 AM
- Result: Rejected because the time overlaps

A booking from 10:00 AM to 11:00 AM is allowed.

### 7. Maintenance Management

Employees can raise a maintenance request when an asset has a problem.

Maintenance workflow:

`Pending → Approved/Rejected → Technician Assigned → In Progress → Resolved`

When maintenance is approved, the asset status automatically changes to `Under Maintenance`.

After the issue is resolved, the asset can return to `Available`.

### 8. Asset Audit

Admins can create scheduled audit cycles.

Auditors verify assets and mark them as:

- Verified
- Missing
- Damaged

The system then generates a discrepancy report.

After an audit is closed, confirmed missing assets can automatically be marked as `Lost`.

### 9. Reports and Analytics

Managers can view reports such as:

- Asset usage
- Most-used assets
- Idle assets
- Maintenance frequency
- Department-wise allocations
- Assets nearing retirement
- Resource booking usage
- Audit discrepancy reports

### 10. Notifications and Activity Logs

The system sends notifications for important actions such as:

- Asset assigned
- Transfer approved
- Booking confirmed
- Booking reminder
- Maintenance approved or rejected
- Overdue asset return
- Audit discrepancy found

An activity log records who performed an action and when it was performed.

---

## User Roles

### Admin

- Manages departments
- Manages asset categories
- Manages employees and roles
- Creates audit cycles
- Views organization-wide reports and analytics

### Asset Manager

- Registers assets
- Allocates assets
- Approves transfers
- Approves maintenance requests
- Approves returns
- Handles asset condition records
- Resolves audit discrepancies

### Department Head

- Views assets assigned to the department
- Approves department-level allocation and transfer requests
- Books shared resources for the department

### Employee

- Views assigned assets
- Books shared resources
- Raises maintenance requests
- Creates return requests
- Creates transfer requests

---

## Basic Workflow

1. The Admin creates departments and asset categories.
2. Employees create accounts.
3. The Admin assigns roles to selected employees.
4. The Asset Manager registers assets.
5. A new asset starts with the `Available` status.
6. The asset is allocated to an employee or department.
7. The system prevents the same asset from being allocated twice.
8. Employees can book shared resources without time conflicts.
9. Employees can raise maintenance requests.
10. Approved maintenance changes the asset status to `Under Maintenance`.
11. Assets can be returned or transferred.
12. Overdue returns are automatically highlighted.
13. Admins run audit cycles to find missing or damaged assets.
14. All activities are stored in logs and displayed through reports and notifications.

---

## Technology Stack

### Frontend

- Next.js
- React
- JavaScript or TypeScript
- Responsive UI

### Backend

- Node.js
- Express.js
- REST APIs

### Database

- MongoDB
- Mongoose

### Authentication and Security

- Email and password authentication
- Secure password hashing
- JWT or session-based authentication
- Role-Based Access Control
- Protected frontend routes
- Protected backend APIs

---

## Suggested Project Architecture

```text
assetflow/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── utils/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── validations/
│   └── utils/
│
└── README.md
```

---

## Main Database Collections

The project may use the following MongoDB collections:

- Users
- Departments
- AssetCategories
- Assets
- Allocations
- TransferRequests
- Bookings
- MaintenanceRequests
- AuditCycles
- AuditItems
- Notifications
- ActivityLogs

---

## Important Validation Rules

- A user cannot select an Admin role during signup.
- Only an Admin can assign higher-level roles.
- An allocated asset cannot be assigned to another user directly.
- A transfer request is required before re-allocation.
- Shared resource bookings cannot overlap.
- Maintenance work cannot start before approval.
- Overdue asset returns must be highlighted.
- Closed audit cycles cannot be edited.
- Every important action must be recorded in the activity log.

---

## Team Members

- Dhruv Kachwala
- Aniket Kachadiya
- Aayush Dobariya

---

## Project Goal

Our goal is to create a clean, secure, scalable, and easy-to-use ERP platform that gives organizations complete visibility over their assets and shared resources.

AssetFlow will help organizations reduce manual work, prevent allocation and booking conflicts, improve maintenance tracking, identify missing assets, and make better decisions using real-time reports.
