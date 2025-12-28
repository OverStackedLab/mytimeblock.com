/**
 * Firebase to Supabase Migration Script
 *
 * This script migrates data from Firebase (Firestore) to Supabase (PostgreSQL).
 *
 * Prerequisites:
 * 1. Install dependencies: npm install firebase-admin @supabase/supabase-js dotenv
 * 2. Download Firebase service account JSON from Firebase Console
 * 3. Set environment variables:
 *    - FIREBASE_SERVICE_ACCOUNT_PATH: Path to Firebase service account JSON
 *    - SUPABASE_URL: Your Supabase project URL
 *    - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (NOT the anon key)
 *
 * Usage:
 *   npx ts-node scripts/migrate-to-supabase.ts
 *
 * IMPORTANT:
 * - This script requires the Supabase service role key (not anon key) to bypass RLS
 * - Run the database schema SQL in Supabase before running this script
 * - Firebase users need to be migrated separately (see instructions below)
 */

import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

// Configuration
const FIREBASE_SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
  );
  process.exit(1);
}

// Initialize Firebase Admin
let firebaseApp;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const serviceAccount = require(FIREBASE_SERVICE_ACCOUNT_PATH) as ServiceAccount;
  firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  });
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
  console.log("\nTo get your Firebase service account:");
  console.log("1. Go to Firebase Console > Project Settings > Service Accounts");
  console.log("2. Click 'Generate new private key'");
  console.log("3. Save the JSON file and set FIREBASE_SERVICE_ACCOUNT_PATH");
  process.exit(1);
}

const firestore = getFirestore(firebaseApp);

// Initialize Supabase with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface FirebaseEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  extendedProps?: {
    description?: string;
  };
}

interface FirebasePreferences {
  eventSwatches?: string[];
}

async function migrateEvents() {
  console.log("\n--- Migrating Events ---");

  try {
    const eventsCollection = await firestore.collection("events").get();
    let totalEvents = 0;
    let migratedEvents = 0;

    for (const doc of eventsCollection.docs) {
      const userId = doc.id;
      const data = doc.data();
      const events: FirebaseEvent[] = data.events || [];

      console.log(`Processing user ${userId}: ${events.length} events`);

      for (const event of events) {
        const { error } = await supabase.from("events").insert({
          id: event.id,
          user_id: userId,
          title: event.title || "Untitled",
          start_time: event.start,
          end_time: event.end || event.start,
          all_day: event.allDay || false,
          background_color: event.backgroundColor || "#f57c00",
          description: event.extendedProps?.description || "",
        });

        if (error) {
          console.error(`  Failed to migrate event ${event.id}:`, error.message);
        } else {
          migratedEvents++;
        }
        totalEvents++;
      }
    }

    console.log(`Events migration complete: ${migratedEvents}/${totalEvents} migrated`);
  } catch (error) {
    console.error("Error migrating events:", error);
  }
}

async function migratePreferences() {
  console.log("\n--- Migrating Preferences ---");

  try {
    const prefsCollection = await firestore.collection("preferences").get();
    let totalPrefs = 0;
    let migratedPrefs = 0;

    for (const doc of prefsCollection.docs) {
      const userId = doc.id;
      const data = doc.data() as FirebasePreferences;

      console.log(`Processing preferences for user ${userId}`);

      const { error } = await supabase.from("preferences").upsert({
        user_id: userId,
        event_swatches: data.eventSwatches || [],
      });

      if (error) {
        console.error(`  Failed to migrate preferences for ${userId}:`, error.message);
      } else {
        migratedPrefs++;
      }
      totalPrefs++;
    }

    console.log(`Preferences migration complete: ${migratedPrefs}/${totalPrefs} migrated`);
  } catch (error) {
    console.error("Error migrating preferences:", error);
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("Firebase to Supabase Migration");
  console.log("=".repeat(50));

  console.log("\n--- User Migration Instructions ---");
  console.log("Firebase Auth users need to be migrated separately:");
  console.log("1. Export users from Firebase Console:");
  console.log("   Firebase Console > Authentication > Users > Export users");
  console.log("2. Import users to Supabase:");
  console.log("   - Use Supabase Dashboard to create users manually, OR");
  console.log("   - Use Supabase Admin API to bulk import users");
  console.log("   - Note: Passwords cannot be migrated - users will need to reset");
  console.log("");
  console.log("IMPORTANT: User IDs in Supabase must match Firebase UIDs");
  console.log("for the event/preference migration to work correctly.");
  console.log("");

  // Migrate data
  await migrateEvents();
  await migratePreferences();

  console.log("\n--- Setting Admin Users ---");
  console.log("Run the following SQL in Supabase to set admin users:");
  console.log("");
  console.log("UPDATE public.profiles SET is_admin = TRUE");
  console.log("WHERE email IN ('your-admin@email.com');");
  console.log("");

  console.log("=".repeat(50));
  console.log("Migration complete!");
  console.log("=".repeat(50));
}

main().catch(console.error);
