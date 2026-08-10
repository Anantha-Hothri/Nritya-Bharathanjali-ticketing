Yes — this changes the **core ticket allocation logic**. The customer should **not choose auditorium rows themselves**. The admin first configures which rows are available/assigned to each MSN batch or external category, and bookings consume tickets from that allocated inventory.

Here is the corrected version in the same **6-section format**:

---

### [1. SITE / PROJECT]:

**Nritya Bharathanjali Ticketing Application – Skanda Production 2026**

Build a premium, responsive e-ticketing platform for **M.S. Natyakshetra’s “Nritya Bharathanjali 2026 – Skanda” production**, happening on **September 26, 2026**.

The website should use the **same visual theme, design language, typography, colors, devotional/classical aesthetic and overall feel as the existing M.S. Natyakshetra portfolio website**.

This is a single-event ticketing platform with two customer categories:

1. **MSN Students / Parents**
2. **External Attendees**

The important difference is that **auditorium row/ticket allocation is controlled by the Admin Panel, not selected freely by customers**.

The Admin Panel should allow organizers to:

* Create MSN batches
* Assign auditorium rows/ticket inventory to each batch
* Generate/configure the booking code for that batch
* Tell the batch their assigned code and rows
* Configure which rows/ticket inventory are available for external attendees
* Monitor bookings and payments against those allocations
* Track total and batch-wise collections
* Export booking data to Excel

Customers simply enter their applicable code/details and book from the ticket inventory that has already been allocated to them.

---

### [2. THE TASK]:

Build the complete responsive ticket-booking platform with the following flow.

#### A. Public Event Website

Create an elegant event landing page for:

**Nritya Bharathanjali 2026 – Skanda**

Include:

* Event branding
* Event poster
* September 26, 2026
* Event description/details
* Book Tickets CTA
* Relevant event information
* Premium classical/devotional visual treatment

Use the existing M.S. Natyakshetra portfolio website as the primary design reference.

---

#### B. Login / Account Creation

Users should create an account or log in before completing their booking.

Collect:

* Full name
* Mobile number
* Email
* Authentication details

Ask:

**“Is this the same number you use for WhatsApp?”**

If **Yes**, use the same number.

If **No**, collect a separate WhatsApp number.

These details should be saved against the booking for future reference and e-ticket delivery.

---

#### C. Buyer Type

At the beginning of booking, clearly provide:

**MS Natyakshetra Student / Parent**

or

**External Attendee**

The selected type determines the booking flow and available ticket inventory.

---

## D. ADMIN-FIRST TICKET ALLOCATION SYSTEM

This is a key requirement.

Before customers start booking, the **Admin creates and configures the ticket allocation**.

### For MSN:

Admin should be able to create a batch allocation such as:

**Batch Name:** [Batch Name]

**Batch Code:** [Unique Code]

**Allocated Rows:** [Row A, Row B, Row C]

**Available Tickets:** Automatically calculated from the selected rows / configured capacity.

The Admin then gives the **Batch Code and assigned row information to that batch** through their class.

The student/parent enters the code while booking.

The system identifies:

**Code → Batch → Allocated Rows → Available Tickets**

The customer should only be able to book tickets from the inventory allocated to that batch.

They should **not be able to select arbitrary auditorium rows outside their allocation**.

---

### E. MSN Booking Flow

Student/parent:

**Select MSN Student/Parent → Enter Batch Code → Code validated → Batch identified → Enter student details → Select number of tickets → Payment**

Collect:

* Student/child full name
* Batch
* Parent/customer name
* Mobile
* WhatsApp number
* Email
* Number of tickets
* Batch/class code

**Minimum = 3 tickets.**

The system must prevent booking fewer than 3 tickets.

The available ticket quantity should come from the rows/inventory assigned to that batch by Admin.

The booking record must contain:

* Batch name
* Batch code
* Assigned row
* Ticket quantity
* Customer details
* Payment information

---

### F. External Booking Flow

External attendees should **not have unrestricted access to the entire auditorium inventory**.

The Admin will configure the rows/ticket inventory available for external bookings beforehand.

For example:

**External Allocation**

* Row A → [X] tickets
* Row B → [X] tickets
* Row C → [X] tickets

The external customer simply books from the available external inventory.

They should not need an MSN batch code.

Minimum external booking:

**1 ticket**

The system should automatically allocate available tickets from the rows/inventory configured by Admin.

The customer does **not manually choose arbitrary rows**.

---

### G. Ticket Allocation

The system should maintain real-time inventory.

For example:

Admin assigns:

**Batch A → Rows A–C → 60 tickets**

If Batch A sells 3 tickets:

**60 → 57 available**

The next Batch A booking can only consume from those remaining tickets.

The same principle applies to external inventory.

Prevent:

* Overselling
* Negative inventory
* Two customers receiving the same ticket
* Booking tickets from another batch's allocation

Ticket allocation should be handled securely on the backend.

---

### H. Payment

Integrate **Razorpay**.

Flow:

**Booking → Ticket Inventory Check → Order Creation → Razorpay → Payment → Server-side Verification → Ticket Allocation Confirmation → E-ticket Generation**

Only after successful verified payment should tickets be permanently allocated and issued.

Do not issue tickets for failed/unverified payments.

Use secure server-side payment verification and webhooks where appropriate.

---

### I. E-Ticket

After verified payment, generate the customer's e-ticket.

The e-ticket should contain:

* Event name
* Event date
* Customer name
* Student name where applicable
* Batch name where applicable
* Ticket quantity
* **Allocated auditorium row**
* Unique ticket/booking ID
* QR code
* Payment status
* Event branding

The ticket should clearly tell the attendee where they are seated/allocated.

---

### J. WhatsApp + Email

After successful payment:

Send the e-ticket to:

* Customer's email
* Customer's WhatsApp

Use the WhatsApp number selected during booking.

If the customer selected that their login number is also their WhatsApp number, use that number automatically.

---

## K. ADMIN PANEL

Create a completely separate secure Admin Panel.

Example:

`/admin`

Admin should have a dashboard with multiple tabs.

### TAB 1 — Dashboard / Collections

Show:

**Total Collections**

**Total Tickets Sold**

**Total Bookings**

**MSN Collections**

**External Collections**

Then provide a **batch-wise collection breakdown**.

For example:

| Batch   | Tickets | Collection |
| ------- | ------: | ---------: |
| Batch A |      45 |    ₹XX,XXX |
| Batch B |      32 |    ₹XX,XXX |
| Batch C |      51 |    ₹XX,XXX |

Admin should also be able to filter by:

* Date
* Batch
* Code
* MSN / External
* Payment status

---

### TAB 2 — MSN Batch Management

Admin can:

**Create Batch**

Enter:

* Batch name
* Batch code
* Assigned auditorium rows
* Ticket capacity/inventory

Example:

**Batch:** Bharatanatyam Grade 4
**Code:** SKANDA-G4
**Rows:** A, B, C

Once created, the Admin can tell that batch:

> “Use this code for booking. Your allocated rows are A, B and C.”

The system automatically connects every booking using that code to the corresponding batch and row allocation.

Admin should be able to see:

* Total allocated tickets
* Tickets booked
* Tickets remaining
* Total amount collected
* Individual bookings

---

### TAB 3 — External Ticket Allocation

Admin should configure beforehand what ticket inventory is available for external attendees.

For example:

**External Tickets**

* Row D → 30
* Row E → 30
* Row F → 40

External users then book from this configured inventory.

The system automatically allocates available tickets and generates the corresponding e-ticket.

---

### TAB 4 — Live Bookings

Show live booking/payment data.

Columns:

* Booking ID
* Customer name
* Student name
* Buyer type
* Batch name
* Batch code
* Phone
* WhatsApp
* Email
* Number of tickets
* Allocated row
* Amount
* Payment status
* Payment ID
* Booking date/time
* Ticket status

Admin should be able to search and filter.

---

### TAB 5 — Collections

Provide a dedicated collection view.

Show:

**Overall Collection**

**MSN Collection**

**External Collection**

**Batch-wise Collection**

**Code-wise Collection**

**Tickets Sold**

**Tickets Remaining**

This should update based on successfully verified payments.

---

### TAB 6 — Excel Export

Admin should have an **Export to Excel** button.

Export should contain all relevant booking information, including:

* Customer
* Phone
* WhatsApp
* Email
* Buyer type
* Batch
* Code
* Number of tickets
* Row
* Amount
* Payment status
* Payment ID
* Booking ID
* Date/time

---

### [3. KNOWN CONSTRAINTS]:

* Event: **Nritya Bharathanjali 2026 – Skanda**
* Date: **September 26, 2026**
* Use existing M.S. Natyakshetra website as the visual reference.
* Fully responsive across mobile, tablet and desktop.
* Mobile-first booking experience.
* Two customer types:

  * MSN Student/Parent
  * External
* MSN minimum: **3 tickets**
* External minimum: **1 ticket**
* **Customers do not freely choose auditorium rows.**
* Admin controls ticket/row allocation.
* Admin creates MSN batches.
* Admin assigns rows/ticket inventory to each batch.
* Admin creates/configures the batch code.
* Batch code identifies the corresponding batch and ticket allocation.
* Admin configures external ticket inventory beforehand.
* Real-time inventory must prevent overselling.
* Every successful booking must be associated with its correct batch/code/row allocation.
* Razorpay payment integration.
* Server-side payment verification.
* E-ticket only after verified payment.
* E-ticket delivered through WhatsApp and email.
* Separate secure Admin Panel.
* Admin dashboard must show live booking information.
* Admin must see total collections.
* Admin must see batch-wise collections.
* Admin must see external collections.
* Admin must be able to filter by batch/code.
* Admin must be able to export data to Excel.
* Use placeholders for missing ticket prices, row capacities, batch names, codes, Razorpay credentials, WhatsApp API and email credentials.
* Never invent missing business information.
* Protect customer/payment data.
* Do not expose admin/customer data publicly.

---

### [4. WHAT'S OUT OF SCOPE]:

Do not build unnecessary generic ticketing functionality.

Not required:

* Customer-controlled seat maps
* Customer-controlled row selection
* Multiple events
* Coupon system
* Loyalty system
* Membership system
* Ticket resale
* Ticket transfer
* Subscription system
* Generic ticket marketplace
* Complex CRM
* Public customer directory
* Refund management unless specifically requested later

**Important:** Seat/row allocation is an **Admin-controlled inventory system**, not a customer seat-selection system.

The Admin Panel **is absolutely in scope**.

The Admin Panel must include:

* Batch creation
* Batch code creation
* Row/inventory allocation
* External inventory configuration
* Live bookings
* Payment information
* Collections
* Batch-wise collections
* Code filtering
* Inventory remaining
* Excel export

---

### [5. SUCCESS LOOKS LIKE]:

The complete flow should work like this:

**ADMIN SIDE**

Admin logs in → Creates Batch → Gives Batch Name → Assigns Auditorium Rows/Ticket Inventory → Creates Batch Code → Tells the batch their Code + allocated rows.

For external attendees:

Admin → Configures which rows/ticket inventory are available for External → Publishes booking.

---

**MSN CUSTOMER SIDE**

Student/Parent → Login → Select MSN → Enter Batch Code → System identifies Batch + allocated inventory → Enter Child Name + Batch Details → Select minimum 3 tickets → See available tickets → Pay through Razorpay → Payment verified → Tickets allocated → E-ticket generated → E-ticket sent to WhatsApp + Email.

---

**EXTERNAL CUSTOMER SIDE**

External → Login → Select External → Enter details → Select tickets → System allocates from Admin-configured external inventory → Pay → Payment verified → E-ticket generated → E-ticket sent to WhatsApp + Email.

---

**ADMIN AFTER BOOKINGS**

Admin → Dashboard → See live bookings → See payments → See ticket inventory → See total collections → See batch-wise collections → Filter by batch/code → See exactly who has paid → See tickets allocated → Export Excel.

The most important relationship in the system should be:

**ADMIN ALLOCATION → BATCH/CODE → BOOKING → PAYMENT → TICKET → COLLECTION**

Everything should remain connected.

---

### [6. ANYTHING ELSE UNIQUE]:

The **Admin Panel is effectively the control center of the entire ticketing system**.

The organizer should be able to decide **before booking starts**:

> “Batch A gets these rows.”

> “Batch B gets these rows.”

> “External attendees get these rows.”

Then the public website should enforce those decisions automatically.

The customer should never have to understand the underlying ticket inventory. They simply book the tickets available to their category/batch.

For MSN:

**Batch Code → Automatically identifies Batch → Automatically identifies allocated rows → Booking consumes available tickets from that allocation.**

For External:

**Admin-configured External Inventory → Customer books → System allocates from available inventory.**

The Admin Panel should make it extremely easy to understand **how many tickets have been allocated, booked and remaining for every batch and category**, as well as **how much money has been collected**.

The final product should feel like a **beautiful M.S. Natyakshetra event website on the customer side and a practical ticket/inventory/collections management system on the Admin side**, rather than a generic ticket-booking website.

All missing values such as ticket price, exact auditorium rows/capacities, batch names, batch codes, payment credentials and messaging credentials must remain configurable placeholders until the organizers provide them.
