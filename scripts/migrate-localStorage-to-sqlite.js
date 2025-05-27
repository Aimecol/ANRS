/**
 * Migration Script: localStorage to MySQL
 * This script helps migrate data from localStorage to MySQL database (XAMPP)
 */

const fs = require("fs");
const path = require("path");
const database = require("../backend/config/mysql-database");

class LocalStorageMigrator {
  constructor() {
    this.migrationLog = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    this.migrationLog.push(logMessage);
  }

  // Parse localStorage data from exported JSON
  parseLocalStorageData(localStorageJson) {
    try {
      const data = JSON.parse(localStorageJson);
      return data;
    } catch (error) {
      throw new Error(`Failed to parse localStorage data: ${error.message}`);
    }
  }

  // Extract users from localStorage
  extractUsers(localStorageData) {
    const users = [];

    if (localStorageData.users) {
      const usersData = JSON.parse(localStorageData.users);
      users.push(...usersData);
    }

    if (localStorageData.currentUser) {
      const currentUser = JSON.parse(localStorageData.currentUser);
      if (!users.find((u) => u.id === currentUser.id)) {
        users.push(currentUser);
      }
    }

    return users;
  }

  // Extract saved meals for all users
  extractSavedMeals(localStorageData) {
    const savedMeals = [];

    Object.keys(localStorageData).forEach((key) => {
      if (key.startsWith("savedMeals_")) {
        const userId = key.replace("savedMeals_", "");
        try {
          const meals = JSON.parse(localStorageData[key]);
          meals.forEach((meal) => {
            savedMeals.push({
              ...meal,
              user_id: userId,
            });
          });
        } catch (error) {
          this.log(
            `Error parsing saved meals for user ${userId}: ${error.message}`
          );
        }
      }
    });

    return savedMeals;
  }

  // Extract budget history for all users
  extractBudgetHistory(localStorageData) {
    const budgetHistory = [];

    Object.keys(localStorageData).forEach((key) => {
      if (key.startsWith("budgetHistory_")) {
        const userId = key.replace("budgetHistory_", "");
        try {
          const history = JSON.parse(localStorageData[key]);
          history.forEach((entry) => {
            budgetHistory.push({
              ...entry,
              user_id: userId,
            });
          });
        } catch (error) {
          this.log(
            `Error parsing budget history for user ${userId}: ${error.message}`
          );
        }
      }
    });

    return budgetHistory;
  }

  // Extract grocery history for all users
  extractGroceryHistory(localStorageData) {
    const groceryHistory = [];

    Object.keys(localStorageData).forEach((key) => {
      if (key.startsWith("groceryHistory_")) {
        const userId = key.replace("groceryHistory_", "");
        try {
          const history = JSON.parse(localStorageData[key]);
          history.forEach((entry) => {
            groceryHistory.push({
              ...entry,
              user_id: userId,
            });
          });
        } catch (error) {
          this.log(
            `Error parsing grocery history for user ${userId}: ${error.message}`
          );
        }
      }
    });

    return groceryHistory;
  }

  // Extract children recommendations for all users
  extractChildrenRecommendations(localStorageData) {
    const recommendations = [];

    Object.keys(localStorageData).forEach((key) => {
      if (key.startsWith("childrenRecommendations_")) {
        const userId = key.replace("childrenRecommendations_", "");
        try {
          const recs = JSON.parse(localStorageData[key]);
          recs.forEach((rec) => {
            recommendations.push({
              ...rec,
              user_id: userId,
            });
          });
        } catch (error) {
          this.log(
            `Error parsing children recommendations for user ${userId}: ${error.message}`
          );
        }
      }
    });

    return recommendations;
  }

  // Extract activity data for all users
  extractActivityData(localStorageData) {
    const activities = [];

    Object.keys(localStorageData).forEach((key) => {
      if (key.startsWith("activityData_")) {
        const userId = key.replace("activityData_", "");
        try {
          const activityData = JSON.parse(localStorageData[key]);
          activityData.forEach((activity) => {
            activities.push({
              ...activity,
              user_id: userId,
            });
          });
        } catch (error) {
          this.log(
            `Error parsing activity data for user ${userId}: ${error.message}`
          );
        }
      }
    });

    return activities;
  }

  // Migrate users to database
  async migrateUsers(users) {
    this.log(`Migrating ${users.length} users...`);
    let migrated = 0;

    for (const user of users) {
      try {
        // Check if user already exists
        const existingUser = await database.get(
          "SELECT id FROM users WHERE email = ?",
          [user.email]
        );

        if (existingUser) {
          this.log(`User ${user.email} already exists, skipping...`);
          continue;
        }

        // Insert user
        await database.run(
          "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
          [
            user.name,
            user.email,
            user.password,
            user.createdAt || new Date().toISOString(),
          ]
        );

        migrated++;
        this.log(`Migrated user: ${user.email}`);
      } catch (error) {
        this.log(`Error migrating user ${user.email}: ${error.message}`);
      }
    }

    this.log(`Successfully migrated ${migrated} users`);
    return migrated;
  }

  // Migrate saved meals to database
  async migrateSavedMeals(savedMeals) {
    this.log(`Migrating ${savedMeals.length} saved meals...`);
    let migrated = 0;

    for (const meal of savedMeals) {
      try {
        // Get user ID from database
        const user = await database.get(
          "SELECT id FROM users WHERE id = ? OR email = ?",
          [meal.user_id, meal.user_id]
        );

        if (!user) {
          this.log(`User not found for meal ${meal.id}, skipping...`);
          continue;
        }

        await database.run(
          "INSERT INTO saved_meals (user_id, name, total_cost, foods_data, saved_at) VALUES (?, ?, ?, ?, ?)",
          [
            user.id,
            meal.name,
            meal.totalCost || meal.total_cost,
            JSON.stringify(meal.foods || []),
            meal.savedAt || meal.saved_at || new Date().toISOString(),
          ]
        );

        migrated++;
        this.log(`Migrated saved meal: ${meal.name}`);
      } catch (error) {
        this.log(`Error migrating saved meal ${meal.id}: ${error.message}`);
      }
    }

    this.log(`Successfully migrated ${migrated} saved meals`);
    return migrated;
  }

  // Main migration function
  async migrate(localStorageFilePath) {
    try {
      this.log("Starting localStorage to SQLite migration...");

      // Read localStorage data
      if (!fs.existsSync(localStorageFilePath)) {
        throw new Error(`localStorage file not found: ${localStorageFilePath}`);
      }

      const localStorageJson = fs.readFileSync(localStorageFilePath, "utf8");
      const localStorageData = this.parseLocalStorageData(localStorageJson);

      // Connect to database
      await database.connect();

      // Extract data
      const users = this.extractUsers(localStorageData);
      const savedMeals = this.extractSavedMeals(localStorageData);
      const budgetHistory = this.extractBudgetHistory(localStorageData);
      const groceryHistory = this.extractGroceryHistory(localStorageData);
      const childrenRecommendations =
        this.extractChildrenRecommendations(localStorageData);
      const activities = this.extractActivityData(localStorageData);

      this.log(`Extracted data summary:`);
      this.log(`- Users: ${users.length}`);
      this.log(`- Saved Meals: ${savedMeals.length}`);
      this.log(`- Budget History: ${budgetHistory.length}`);
      this.log(`- Grocery History: ${groceryHistory.length}`);
      this.log(`- Children Recommendations: ${childrenRecommendations.length}`);
      this.log(`- Activities: ${activities.length}`);

      // Migrate data
      const migratedUsers = await this.migrateUsers(users);
      const migratedMeals = await this.migrateSavedMeals(savedMeals);

      // TODO: Implement migration for other data types

      this.log("Migration completed successfully!");
      this.log(
        `Summary: ${migratedUsers} users, ${migratedMeals} meals migrated`
      );

      // Save migration log
      const logPath = path.join(__dirname, `migration-log-${Date.now()}.txt`);
      fs.writeFileSync(logPath, this.migrationLog.join("\n"));
      this.log(`Migration log saved to: ${logPath}`);
    } catch (error) {
      this.log(`Migration failed: ${error.message}`);
      throw error;
    } finally {
      await database.close();
    }
  }
}

// CLI usage
if (require.main === module) {
  const migrator = new LocalStorageMigrator();
  const localStorageFile = process.argv[2];

  if (!localStorageFile) {
    console.log(
      "Usage: node migrate-localStorage-to-sqlite.js <localStorage-export.json>"
    );
    console.log("");
    console.log("To export localStorage data, run this in browser console:");
    console.log("JSON.stringify(localStorage)");
    process.exit(1);
  }

  migrator
    .migrate(localStorageFile)
    .then(() => {
      console.log("Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = LocalStorageMigrator;
