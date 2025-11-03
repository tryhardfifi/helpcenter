# Firestore Seeding Script

This script populates your Firestore database with demo data based on the mock data structure.

## Setup (IMPORTANT - First Time Only)

Before running the seed script, you must enable Firestore in your Firebase project:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: "help-66e2c"
3. **Navigate to Firestore Database**:
   - Click on "Firestore Database" in the left sidebar (under "Build")
4. **Create Database**:
   - Click "Create database"
   - Choose "Start in **production mode**" (or test mode for development)
   - Select a location (e.g., us-central1)
   - Click "Enable"
5. **Wait for setup to complete** (takes about 30 seconds)

### Firestore Security Rules (Optional)

If you want to set up basic security rules, go to the "Rules" tab in Firestore and use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This allows authenticated users to read/write data.

## Usage

The seed script creates:
1. A unique company with all demo data (prompts, articles, analytics)
2. User documents linked to that company
3. Supports multiple users per company

### Basic Usage

```bash
# Seed with default email (fifacioni@gmail.com)
npm run seed

# Seed with a single custom email
npm run seed your-email@example.com

# Seed with multiple users (they'll share the same company)
npm run seed user1@example.com user2@example.com user3@example.com
```

### Advanced Usage

```bash
# Add more users to an existing company
npm run seed --company-id=company-fifacioni-1234567890 newuser@example.com

# Direct node command examples:
node scripts/seedFirestore.js                                    # Default user
node scripts/seedFirestore.js alice@example.com bob@example.com  # Multiple users
node scripts/seedFirestore.js --company-id=existing-id user@example.com  # Add to existing
```

### How It Works

1. **New Company**: If no company ID is specified and the first user doesn't exist, creates a new company with a unique ID like `company-fifacioni-1730659200000`
2. **Existing User**: If the first user already exists in Firestore, reuses their company
3. **Multiple Users**: All provided email addresses get linked to the same company
4. **User Roles**: The first user is set as "owner", others as "member"

## What gets created

The script creates the following structure in Firestore:

```
users/
  ├── fifacioni@gmail.com
  │   ├── email: "fifacioni@gmail.com"
  │   ├── companyId: "company-fifacioni-1730659200000"
  │   ├── role: "owner"
  │   └── createdAt: "2024-11-03T19:00:00.000Z"
  │
  └── user2@example.com
      ├── email: "user2@example.com"
      ├── companyId: "company-fifacioni-1730659200000"  # Same company!
      ├── role: "member"
      └── createdAt: "2024-11-03T19:00:00.000Z"

companies/
  └── company-fifacioni-1730659200000/
      ├── (company document)
      │   ├── id
      │   ├── name: "Acme Inc."
      │   ├── members: ["fifacioni@gmail.com", "user2@example.com"]
      │   ├── website
      │   ├── industry
      │   ├── subscription
      │   ├── competitors
      │   └── analytics
      │
      ├── prompts/ (subcollection)
      │   ├── prompt-1
      │   ├── prompt-2
      │   ├── prompt-3
      │   ├── prompt-4
      │   └── prompt-5
      │
      └── articles/ (subcollection)
          ├── article-1
          ├── article-2
          ├── article-3
          └── article-4
```

## Data included

- **Company**: Full company profile with subscription, competitors, and analytics
- **5 Prompts**: Tracked prompts with mention rates, sentiment, and trend data
- **4 Articles**: Published articles with mentions, impact scores, and analytics

## Toggle between Mock and Firestore Data

After seeding, you can toggle between mock data and Firestore data using the toggle in the sidebar (bottom left of the app interface).

- **Mock Data** (default): Uses local mock data from `src/data/mockData.js`
- **Firestore**: Uses real data from Firebase Firestore

The toggle will reload the page to fetch data from the selected source.

### Firestore Data Not Found

If you switch to Firestore mode without seeding data first, you'll see a helpful orange notification card on each page that tells you:

- That you're in Firestore mode but no data exists
- The exact command to run to seed the data: `npm run seed`
- Instructions for seeding with a custom email

This makes it easy to understand what's happening and how to fix it!

## Troubleshooting

### Error: "5 NOT_FOUND" or "Firestore has not been enabled"

This means Firestore hasn't been set up in your Firebase project yet. Follow the **Setup** section above to enable Firestore.

### Error: "Permission denied"

This means your Firestore security rules are blocking writes. Either:
- Update your rules to allow writes (see Security Rules section above)
- Or start in "test mode" when creating the database

### Data not showing in the app

1. Make sure you've run the seed script successfully
2. Switch to "Firestore" mode using the toggle in the sidebar
3. Refresh the page

## Notes

- **Company IDs** are unique and generated based on the first user's email + timestamp
- **User documents** store the `companyId`, linking users to their company
- **Multiple users** can share the same company by providing multiple emails
- **The app** automatically fetches the logged-in user's `companyId` from Firestore
- All data is based on the mock data in `src/data/mockData.js`
- The script uses batched writes for efficiency when creating subcollections

## How the App Uses This Data

When you log in:
1. The app fetches your user document from `users/{your-email}`
2. Reads your `companyId` from that document
3. Uses that `companyId` to fetch all company data, prompts, and articles
4. Multiple users with the same `companyId` see the same data
