# Niondra Ledger

Niondra Ledger is a modern web application designed to help users track and manage the cultural tradition of Niondra, the exchange of gifts at significant life events like weddings, births, and housewarmings. It provides a secure, private, and easy-to-use platform to ensure you never lose track of gifts given and received.

## Core Features

- **Secure User Authentication**: Private accounts to keep your ledger data safe and accessible only to you.
- **Comprehensive Ledger History**: A central timeline view of all your Niondra transactions, chronologically ordered.
- **Detailed People & Balance Tracking**: Manage a list of your contacts and automatically see the net monetary balance for each person.
- **Full CRUD Functionality**: Easily **C**reate, **R**ead, **U**pdate, and **D**elete entries and contacts.
- **Advanced Filtering & Search**: Quickly find specific entries by filtering by person, occasion, direction (given/received), or by searching for keywords.
- **Bilingual Interface**: Full support for both **English** and **Urdu**, allowing you to switch languages seamlessly.

---

## Functionality Breakdown

### 1. Authentication
- **Sign Up**: New users can create a secure account using their name, email, and a password.
- **Log In**: Existing users can log in to access their personal ledger.
- **Protected Routes**: All data pages (Ledger, People) are protected and require a user to be logged in. The application will automatically redirect logged-out users to the login page.

### 2. Main Ledger View (`/`)
This is the homepage for authenticated users.
- **Timeline View**: Displays all Niondra entries in a reverse chronological list.
- **Add New Entry**: A prominent "Add Entry" button opens a side sheet to record a new transaction.
- **Entry Details Card**: Each card in the timeline clearly shows:
    - Direction (Given/Received)
    - Person's Name
    - Date and Occasion (with a representative icon)
    - Gift Description (e.g., amount of money, or item description)
    - Optional notes.
- **Edit/Delete Entries**: Each entry card has options to edit or delete the transaction.
- **Filtering and Search**: A powerful set of controls allows you to:
    - **Search** by text within gift descriptions or person's name.
    - **Filter** by a specific person from your contacts list.
    - **Filter** by occasion type (Wedding, Birth, etc.).
    - **Filter** by direction (Given, Received, or both).

### 3. People & Balances (`/people`)
This page serves as your contact book for Niondra.
- **Contact List**: Displays a card for every person you've added.
- **Add/Edit/Delete People**: You can add new people (with their name and relation) and edit or delete existing ones.
- **Net Balance Calculation**: For each person, the application automatically calculates the net balance of all monetary gifts exchanged.
    - If you have given more money than you've received, it shows "You will give".
    - If you have received more than you've given, it shows "You will receive".
    - If the balance is zero, it shows "All square".
- **View History**: A button on each person's card navigates to a detailed page showing only the transactions with that individual.

### 4. Person Detail View (`/people/[personId]`)
This page provides a focused view of your history with a single person.
- **Person Information**: Displays the person's name and relation.
- **Balance Summary**: Shows a clear summary of total money given, total money received, and the final net balance.
- **Transaction History**: A complete timeline of every Niondra entry associated with that person.

### 5. Language Support
- The application is fully internationalized with support for English and Urdu.
- Users can switch the language at any time using the language selector in the user profile dropdown menu.
- The entire UI, including labels, buttons, and static text, updates instantly.

---

## Tech Stack

- **Framework**: Next.js (with App Router)
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Database & Authentication**: Firebase (Firestore & Firebase Auth)
- **Form Management**: React Hook Form with Zod for validation
- **Deployment**: Firebase App Hosting
