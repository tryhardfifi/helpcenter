import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch, getDoc } from "firebase/firestore";
import { mockCompanyData, mockRuns } from "../src/data/mockData.js";
import { computeDailyAnalytics, aggregateAnalyticsForDashboard } from "../src/services/analyticsComputation.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7qt2GvvP65Z7L5xXKoWHvZfFJ9AXQ29Y",
  authDomain: "help-66e2c.firebaseapp.com",
  projectId: "help-66e2c",
  storageBucket: "help-66e2c.firebasestorage.app",
  messagingSenderId: "992898284975",
  appId: "1:992898284975:web:954250ee78e0b218f4c35a",
  measurementId: "G-HTTLDR7J1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFirestore(userEmails = ["fifacioni@gmail.com"], existingCompanyId = null) {
  try {
    // Convert single email to array for backwards compatibility
    if (typeof userEmails === 'string') {
      userEmails = [userEmails];
    }

    console.log(`🌱 Starting Firestore seeding`);
    console.log(`👥 Users: ${userEmails.join(', ')}`);

    let companyId = existingCompanyId;

    // If no existing company ID, check if the first user already has a company
    if (!companyId) {
      const firstUserDoc = await getDoc(doc(db, "users", userEmails[0]));
      if (firstUserDoc.exists() && firstUserDoc.data().companyId) {
        companyId = firstUserDoc.data().companyId;
        console.log(`📋 Found existing company for ${userEmails[0]}: ${companyId}`);
      } else {
        // Generate a new unique company ID
        const timestamp = Date.now();
        const sanitizedEmail = userEmails[0].split('@')[0].replace(/[^a-z0-9]/gi, '-');
        companyId = `company-${sanitizedEmail}-${timestamp}`;
        console.log(`🆕 Creating new company ID: ${companyId}`);
      }
    } else {
      console.log(`📋 Using existing company ID: ${companyId}`);
    }

    console.log(`📦 Company ID: ${companyId}`);

    // 1. Create or update company document (NO analytics, NO competitors)
    console.log("📄 Creating/updating company document...");
    const companyRef = doc(db, "companies", companyId);
    const companyDoc = await getDoc(companyRef);

    // Only store basic company info - NO analytics, NO competitors
    await setDoc(companyRef, {
      id: companyId,
      name: mockCompanyData.company.name,
      logo: mockCompanyData.company.logo,
      website: mockCompanyData.company.website,
      industry: mockCompanyData.company.industry,
      subscription: mockCompanyData.company.subscription,
      members: userEmails,
      createdAt: companyDoc.exists() ? companyDoc.data().createdAt : new Date().toISOString().split('T')[0],
    }, { merge: false }); // Don't merge, replace completely

    if (companyDoc.exists()) {
      console.log("✅ Company document updated (basic info only)");
    } else {
      console.log("✅ Company document created (basic info only)");
    }

    // 1b. Create settings document with competitors configuration
    console.log("⚙️  Creating settings document...");
    const settingsRef = doc(db, "companies", companyId, "settings", "general");
    await setDoc(settingsRef, {
      competitors: mockCompanyData.company.competitors,
      updatedAt: new Date().toISOString()
    });
    console.log("✅ Settings created with competitors configuration");

    // 2. Create user documents with companyId
    console.log("👤 Creating user documents...");
    for (const email of userEmails) {
      const userRef = doc(db, "users", email);
      await setDoc(userRef, {
        email: email,
        companyId: companyId,
        role: email === userEmails[0] ? 'owner' : 'member',
        createdAt: new Date().toISOString(),
      }, { merge: true }); // merge to not overwrite existing data
      console.log(`✅ User ${email} linked to company`);
    }

    // 3. Create prompts subcollection using batched writes (without analytics data)
    console.log("📝 Creating prompts subcollection...");
    const promptsBatch = writeBatch(db);
    mockCompanyData.prompts.forEach((prompt) => {
      const promptRef = doc(collection(companyRef, "prompts"), prompt.id);
      // Remove analytics data so prompts show "-" for mention rate and rank
      const { analytics, ...promptWithoutAnalytics } = prompt;
      promptsBatch.set(promptRef, {
        ...promptWithoutAnalytics,
        companyId: companyId,
        mentionRate: 0,
        totalMentions: 0,
        analytics: {
          mentionsOverTime: [],
          rankingsOverTime: [],
          averagePosition: null,
          coMentions: []
        }
      });
    });
    await promptsBatch.commit();
    console.log(`✅ Created ${mockCompanyData.prompts.length} prompts (no analytics data)`);

    // 4. Create articles subcollection using batched writes
    console.log("📰 Creating articles subcollection...");
    const articlesBatch = writeBatch(db);
    mockCompanyData.articles.forEach((article) => {
      const articleRef = doc(collection(companyRef, "articles"), article.id);
      articlesBatch.set(articleRef, {
        ...article,
        companyId: companyId,
      });
    });
    await articlesBatch.commit();
    console.log(`✅ Created ${mockCompanyData.articles.length} articles`);

    // 5. Skip creating runs - start with empty data for testing
    console.log("🏃 Skipping runs creation (starting with 0 runs for testing)...");
    const totalRuns = 0;
    console.log(`✅ No runs created - ready to test "Run All Prompts" button`);

    // 6. DO NOT create analytics - it should only exist after running prompts
    console.log("📊 Skipping analytics creation (will be created when you run prompts)...");
    console.log(`✅ No analytics created - run "Run All Prompts" to generate analytics`);

    console.log("\n🎉 Firestore seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Company ID: ${companyId}`);
    console.log(`   - Users: ${userEmails.join(', ')}`);
    console.log(`   - Company Name: ${mockCompanyData.company.name}`);
    console.log(`   - Prompts: ${mockCompanyData.prompts.length} (ready to run)`);
    console.log(`   - Runs: ${totalRuns} (empty - test the Run All Prompts button!)`);
    console.log(`   - Articles: ${mockCompanyData.articles.length}`);
    console.log(`   - Competitors: ${mockCompanyData.company.competitors.length}`);
    console.log(`   - Analytics: None (will be created after running prompts)`);

    console.log(`\n💡 Next steps:`);
    console.log(`   1. Log in with: ${userEmails[0]}`);
    console.log(`   2. Switch to "Firestore" mode in the sidebar`);
    console.log(`   3. Go to Dashboard and click "Run All Prompts" to test!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Firestore:", error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

// Usage: node seedFirestore.js [email1] [email2] [email3] ...
// or: node seedFirestore.js --company-id=existing-id email1 email2
let userEmails = [];
let existingCompanyId = null;

args.forEach(arg => {
  if (arg.startsWith('--company-id=')) {
    existingCompanyId = arg.split('=')[1];
  } else if (arg.includes('@')) {
    userEmails.push(arg);
  }
});

// Default to fifacioni@gmail.com if no emails provided
if (userEmails.length === 0) {
  userEmails = ["fifacioni@gmail.com"];
}

seedFirestore(userEmails, existingCompanyId);
