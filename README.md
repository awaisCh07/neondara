# Neondara Ledger: Functionality Document

## 1. Project Vision

Neondara Ledger is a modern web application designed to help users track and manage the cultural tradition of Neondara—the exchange of gifts at significant life events like weddings, births, and housewarmings. It provides a secure, private, and easy-to-use platform to ensure you never lose track of gifts given and received, as well as manage shared expenses with friends and family.

## 2. Core Features

- **Secure User Authentication**: Private, email-based accounts to keep your ledger data safe and accessible only to you.
- **Comprehensive Ledger History**: A central timeline view of all your Neondara transactions, chronologically ordered.
- **Detailed People & Balance Tracking**: Manage a list of your contacts and automatically see the net monetary balance for each person.
- **Full CRUD Functionality**: Easily **C**reate, **R**ead, **U**pdate, and **D**elete entries, contacts, and shared bills.
- **Advanced Filtering & Search**: Quickly find specific entries by filtering by person, occasion, direction (given/received), or by searching for keywords with matches highlighted.
- **Shared Bill Splitting**: Easily create and manage shared bills, track who has paid their share, and see which bills are settled.
- **Bilingual Interface**: Full support for both **English** and **Urdu**, allowing you to switch languages seamlessly.
- **Data Export**: Download your entire transaction history, or just the history for a specific person, as a formatted CSV file.
- **Rich Gift Tracking**: Record gifts as money, sweets (with quantity in kg), or upload an image for physical gifts.

---

## 3. Detailed Functionality Breakdown

### 3.1. Authentication

The application uses Firebase Authentication for a secure, email-based user system.

- **Sign Up**: New users can create a secure account using their full name, email address, and a password (minimum 6 characters). The system ensures that each email can only be registered once.
- **Log In**: Existing users can log in with their email and password to access their personal ledger. The system provides clear error messages for invalid credentials.
- **Password Reset**: On the login page, a "Forgot Password?" link allows users to enter their email address to receive a password reset link from Firebase.
- **Protected Routes**: All data pages (Ledger, People, etc.) are protected. If a logged-out user tries to access them, they are automatically and seamlessly redirected to the login page.
- **Language Selection**: Users can switch between English and Urdu directly on the login and sign-up screens.

### 3.2. Main Ledger View (`/`)

This is the homepage for authenticated users, providing a comprehensive overview of all Neondara exchanges.

- **Timeline View**: Displays all Neondara entries in a reverse chronological list.
- **Add New Entry**: A prominent "Add Entry" button opens a side sheet to record a new transaction.
- **Entry Details Card**: Each card in the timeline clearly shows:
    - **Direction**: "Given" (with an upward arrow) or "Received" (with a downward arrow).
    - **Person's Name**: The name of the person the transaction was with.
    - **Date and Occasion**: The date of the event and its type (Wedding, Birth, etc.), represented by a unique icon.
    - **Gift Details**:
        - **Money**: Formatted monetary amount (e.g., Rs 1,000).
        - **Sweets**: Quantity in kg and a description (e.g., 2kg Box of mixed sweets).
        - **Gift**: An uploaded image of the gift item, which can be clicked to view a larger version in a dialog. If no image is provided, a text description is shown.
    - **Notes**: Any additional notes are displayed in an italicized blockquote.
- **Edit/Delete Entries**: Each entry card has a "more options" menu (`...`) with "Edit" and "Delete" actions. Deleting an entry requires a confirmation to prevent accidental data loss.
- **Filtering and Search**: A powerful set of controls at the top allows users to refine the timeline:
    - **Search**: A single search bar lets users find entries by matching text in the **person's name**, **gift description**, or **notes**. Matched text is automatically highlighted in the results.
    - **Filter by Person**: A dropdown to show entries for a specific person only.
    - **Filter by Occasion**: A dropdown to filter by Wedding, Birth, Housewarming, or Other.
    - **Filter by Direction**: A dropdown to show only "Given", "Received", or both.
- **Export All Data**: A user menu option to download a CSV of all entries currently displayed (respects applied filters).

### 3.3. People & Balances Page (`/people`)

This page serves as your contact book for Neondara and provides financial summaries.

- **Contact List**: Displays a card for every person you've added, sorted alphabetically.
- **Add/Edit/Delete People**:
    - Users can add new people with their name and an optional relation (e.g., Friend, Aunt, Uncle).
    - Each person card has a menu to "Edit" their details or "Delete" them. Deleting a person also deletes all associated transaction history and requires confirmation.
- **Net Balance Calculation**: For each person, the application automatically calculates and displays the net balance of all monetary gifts exchanged. The text and color change based on the balance:
    - **I have given more**: Green text.
    - **I have received more**: Red text.
    - **All square**: Neutral color.
- **View History**: A button on each person's card navigates to a detailed page showing only the transactions with that individual.

### 3.4. Person Detail View (`/people/[personId]`)

This page provides a focused view of your history with a single person.

- **Person Information**: Displays the person's name and relation.
- **Balance Summary**: Shows a clear summary of total money given, total money received, and the final net balance, along with summaries for sweets and gift counts.
- **Transaction History**: A complete timeline of every Neondara entry associated with that person.
- **Search History**: A search bar is located next to the "Transaction History" title, allowing users to search within that person's specific history by gift or notes. Matches are highlighted.
- **Export Person History**: A button to download a CSV containing only the transactions for this specific person.

### 3.5. Shared Bills Page (`/shared-bills`)

This page allows users to track shared expenses and manage who has paid their portion.

- **Bill List**: Displays all shared bills in a reverse chronological list.
- **Add/Edit/Delete Bills**: A prominent "Add Bill" button opens a side sheet to create a new shared bill. Existing bills can be edited or deleted from a menu on their card.
- **Bill Card Details**: Each card clearly shows:
    - **Description**, **Date**, and **Total Amount**.
    - **Payer**: The name of the person who paid the bill (which can be you or a contact).
    - **Participants**: A detailed list of everyone involved in the bill.
    - **Share Tracking**: For each participant, their individual share amount is displayed alongside a checkbox. Users can toggle this checkbox to mark a person's share as "Paid" or "Unpaid".
- **Settlement Status**: A badge at the bottom of the card indicates if the bill is **"Settled"** (everyone has paid) or **"Unsettled"**, providing a quick and easy way to see what's outstanding.
- **User Inclusion**: The user can include themselves as the payer and/or as a participant in any bill.

---

## 4. Tech Stack

- **Framework**: Next.js (with App Router)
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Database & Authentication**: Firebase (Firestore & Firebase Auth)
- **Form Management**: React Hook Form with Zod for validation
- **Deployment**: Firebase Hosting
