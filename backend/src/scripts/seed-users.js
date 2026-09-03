require("dotenv").config({
  path: process.argv[2] || ".env.local",
});

const { withTransaction } = require("../config/database");

const PASSWORD_HASH =
  "$2a$12$9/.qRgyovavxZNQ.5O9Axev7HBUKSawki7NU8WbSCvGbkqnZ9NFvy";
const USER_FIXTURES = [
  {
    name: "Alice Johnson",
    email: "alice@acme.co",
    plan: "Business",
    status: "active",
    apiKey: "sk_seed_alice000000000000000000000000",
  },
  {
    name: "Bob Smith",
    email: "bob@acme.co",
    plan: "Business",
    status: "active",
    apiKey: "sk_seed_bob00000000000000000000000000",
  },
  {
    name: "Charlie Davis",
    email: "charlie@acme.co",
    plan: "Pro",
    status: "active",
    apiKey: "sk_seed_charlie000000000000000000000",
  },
  {
    name: "Diana Prince",
    email: "diana@acme.co",
    plan: "Free",
    status: "invited",
    apiKey: "sk_seed_diana00000000000000000000000",
  },
  {
    name: "Suspended User",
    email: "suspended@acme.co",
    plan: "Free",
    status: "suspended",
    apiKey: "sk_seed_suspended000000000000000000",
  },
];

async function seedUsers() {
  return withTransaction(async (client) => {
    const { rows: roles } = await client.query(
      "SELECT id FROM roles WHERE name = 'user'",
    );
    if (roles.length === 0) {
      throw new Error(
        "User role not found. Run postgres/init/02_seed.sql first.",
      );
    }

    for (const fixture of USER_FIXTURES) {
      await client.query(
        `INSERT INTO users
           (email, password_hash, name, api_key, role_id, plan, status, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (email) DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           api_key = EXCLUDED.api_key,
           role_id = EXCLUDED.role_id,
           plan = EXCLUDED.plan,
           status = EXCLUDED.status,
           is_active = EXCLUDED.is_active`,
        [
          fixture.email,
          PASSWORD_HASH,
          fixture.name,
          fixture.apiKey,
          roles[0].id,
          fixture.plan,
          fixture.status,
          fixture.status !== "suspended",
        ],
      );
    }

    return USER_FIXTURES.length;
  });
}

seedUsers()
  .then((count) => {
    console.log(`Seeded ${count} test users. Password: password123`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("User seed failed:", error.message);
    process.exitCode = 1;
  });
