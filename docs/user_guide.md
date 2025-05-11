# Mynumba Don Win - Admin Portal User Guide

**Version:** 1.0
**Date:** May 11, 2025

## 1. Introduction

Welcome to the Mynumba Don Win Admin Portal User Guide. This portal is designed to allow authorized administrators to manage users, prize structures, execute draws, and view reports for the Mynumba Don Win promotion.

This guide provides instructions on how to use the portal based on different user roles.

## 2. Getting Started

### 2.1. Accessing the Portal

The Admin Portal is a web-based application. You will be provided with a URL to access it (e.g., `https://gp-admin-promo.vercel.app`).

### 2.2. Logging In

1.  Navigate to the portal URL.
2.  You will be presented with a login screen.
3.  Enter your assigned **Username (or Email)** and **Password**.
4.  Click the **Login** button.

Upon successful login, you will be directed to the Admin Dashboard. The features and navigation links you see will depend on your assigned user role.

### 2.3. Logging Out

To log out of the portal:
1.  Locate the **Logout** button in the sidebar menu.
2.  Click the **Logout** button.

You will be redirected to the login screen.

## 3. User Roles and Permissions

The portal has five defined user roles, each with specific permissions:

*   **SuperAdmin:** Has access to all functions, including user management, prize structure management, draw execution, and all reports/audit logs.
*   **Admin:** Has access to all functions *except* draw execution. Can manage prize structures, view reports, and manage users (if granted by SuperAdmin, though typically user management is SuperAdmin only).
*   **SeniorUser:** Can manage some aspects of draws (e.g., view details before execution), manage prize structures, and view all reports.
*   **WinnerReportsUser:** Can only view and search the winners' reports.
*   **AllReportUser:** Can view all reports (including winner reports and audit logs) and potentially manage notifications.

## 4. Portal Features (by Role)

### 4.1. Dashboard

*   **Accessible by:** SuperAdmin, Admin, SeniorUser, WinnerReportsUser, AllReportUser
*   **Description:** Provides an overview or summary of key promotion metrics (specific content to be defined based on available data and reporting needs).

### 4.2. User Management (Primarily SuperAdmin)

*   **Accessible by:** SuperAdmin
*   **Navigation:** `User Management` in the sidebar.
*   **Functionality:**
    *   **View Users:** See a list of all admin users, their usernames, and roles.
    *   **Add New User:**
        1.  Click the "Add New User" button.
        2.  Fill in the user details: Username, Email, Password, First Name, Last Name, and select a Role.
        3.  Click "Save User".
    *   **Edit User:**
        1.  Find the user in the list and click "Edit".
        2.  Modify the user details as needed (role, status, etc.). Password changes might be a separate function.
        3.  Click "Save User".
    *   **Delete User:**
        1.  Find the user in the list and click "Delete".
        2.  Confirm the deletion.
    *   **Update User Status (Activate/Deactivate):** Functionality to change a user's active status.

### 4.3. Prize Structure Management

*   **Accessible by:** SuperAdmin, Admin, SeniorUser
*   **Navigation:** `Prize Structures` in the sidebar.
*   **Functionality:** Allows for the creation and management of different prize structures for draws.
    *   **View Prize Structures:** See a list of existing prize structures, their names, active status, and number of prizes.
    *   **Add New Prize Structure:**
        1.  Click "Add New Prize Structure".
        2.  Enter a name for the structure (e.g., "Weekday Draw Prizes - June Week 1").
        3.  Add individual prizes to the structure:
            *   Prize Name (e.g., "Jackpot", "2nd Prize", "Consolation Prize 1")
            *   Prize Value (e.g., "N1,000,000", "N50,000 Airtime")
            *   Number of Winners (Quantity for this prize tier)
        4.  Ability to add multiple prize tiers, including multiple consolation prizes.
        5.  Save the prize structure.
    *   **Edit Prize Structure:**
        1.  Select a prize structure from the list and click "Edit".
        2.  Modify its name, or add/edit/remove prize tiers within it.
        3.  Save changes.
    *   **Delete Prize Structure:**
        1.  Select a prize structure and click "Delete".
        2.  Confirm deletion.
    *   **Activate/Deactivate Prize Structure:** Set which prize structure is currently active or to be used for upcoming draws (the system might automatically pick based on day/date, or this could be a manual override/setting).

### 4.4. Draw Management & Execution

*   **Accessible by:** SuperAdmin (for execution), Admin & SeniorUser (for viewing details/preparation).
*   **Navigation:** `Draw Management` in the sidebar.
*   **Functionality:**
    *   **Select Draw Date (SuperAdmin, Admin, SeniorUser):**
        1.  Choose a specific date for the draw.
    *   **View Pre-Draw Details (SuperAdmin, Admin, SeniorUser):**
        1.  Once a date is selected, the system will display:
            *   The **Day of the Week** for the selected date.
            *   The **Number of Eligible Participants** (MSISDNs) for that draw (data pulled from PostHog based on the date/day).
            *   The **Total Points** represented by these participants.
            *   The **Prize Structure** that will be used for this draw (determined by the day of the week/date).
    *   **Execute Draw (SuperAdmin ONLY):**
        1.  After reviewing the pre-draw details, the SuperAdmin clicks the "Execute Draw" button.
        2.  A 5-second animation will play, indicating the draw is in progress.
        3.  Upon completion, the draw results will be displayed.
    *   **View Draw Results (SuperAdmin, Admin, SeniorUser, WinnerReportsUser, AllReportUser - typically on a separate Winners Report page):**
        *   Winners and Runner-ups for each prize tier.
        *   MSISDNs will be masked (e.g., first 3 and last 3 digits shown).
        *   Information like Draw Date, Prize Won.

### 4.5. Reports

#### 4.5.1. Winners Report

*   **Accessible by:** SuperAdmin, Admin, SeniorUser, WinnerReportsUser, AllReportUser
*   **Navigation:** Likely a dedicated "Winners Report" or section under "Reports".
*   **Functionality:**
    *   View a list of all winners and runner-ups from past draws.
    *   Filter by draw date, prize, etc.
    *   Search by (masked) MSISDN.
    *   Details displayed: Draw Date, Prize Name, Prize Value, Winner MSISDN (masked), Opt-in Status (if available), Valid Winner Flag (if applicable), Runner-up status.
    *   Ability to invoke a runner-up if a winner is disqualified (SuperAdmin/Admin). This action should trigger notifications and update statuses.

#### 4.5.2. Audit Logs / Data Upload Reports

*   **Accessible by:** SuperAdmin, Admin, AllReportUser
*   **Navigation:** `Audit Logs` or a section under "Reports".
*   **Functionality:**
    *   View a log of system activities, especially data uploads.
    *   Information displayed: User who performed the action, timestamp, action type (e.g., "MSISDN List Uploaded"), number of lines/records affected, status (success/failure), filename (if applicable).
    *   Ability to view details of uploaded data (potentially) or delete erroneous uploads (SuperAdmin).

### 4.6. Notification Management (Conceptual)

*   **Accessible by:** SuperAdmin, Admin, AllReportUser
*   **Functionality:** (Details depend on final implementation)
    *   May involve viewing logs of SMS notifications sent to winners.
    *   Potentially manually triggering resending of notifications if needed.

## 5. Troubleshooting / Support

*   **Login Issues:** Ensure you are using the correct username/email and password. Check for Caps Lock. If issues persist, contact the system administrator.
*   **Incorrect Data Displayed:** If you believe data is incorrect, please report it to the system administrator with details (e.g., which page, what data, expected data).
*   **Feature Not Working:** If a feature is not working as expected, note down the steps you took, any error messages, and report to the system administrator.

For further assistance, please contact your designated support channel or system administrator.

