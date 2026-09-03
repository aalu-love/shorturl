require("dotenv").config({
  path: process.argv[2] || ".env.local",
});

const { queryWrite, withTransaction } = require("../config/database");

const SEED_USER_EMAIL = process.env.SEED_USER_EMAIL || "dev@example.com";
const DOMAIN_FIXTURES = [
  { domain: "sh.rt", status: "active", sslEnabled: true },
  { domain: "acme.co", status: "active", sslEnabled: true },
  { domain: "promo.link", status: "pending", sslEnabled: false },
  { domain: "my-brand.com", status: "error", sslEnabled: true },
];
const LINK_DOMAINS = [
  ["analyticsdemo1", "sh.rt"],
  ["analyticsdemo2", "sh.rt"],
  ["analyticsdemo3", "acme.co"],
  ["analyticsdemo4", "promo.link"],
];

async function seed() {
  return withTransaction(async (client) => {
    const { rows: users } = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [SEED_USER_EMAIL],
    );
    if (users.length === 0) {
      throw new Error(`Seed user '${SEED_USER_EMAIL}' not found.`);
    }

    const userId = users[0].id;
    for (const fixture of DOMAIN_FIXTURES) {
      const { rows } = await client.query(
        `INSERT INTO custom_domains (user_id, domain, status, ssl_enabled)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (domain) DO UPDATE SET
           status = EXCLUDED.status,
           ssl_enabled = EXCLUDED.ssl_enabled
         WHERE custom_domains.user_id = EXCLUDED.user_id
         RETURNING id, domain`,
        [userId, fixture.domain, fixture.status, fixture.sslEnabled],
      );
      if (rows.length === 0) {
        throw new Error(`Domain '${fixture.domain}' belongs to another user.`);
      }
    }

    for (const [shortCode, domain] of LINK_DOMAINS) {
      await client.query(
        `UPDATE short_urls
         SET domain = $1
         WHERE short_code = $2 AND user_id = $3 AND is_active = true`,
        [domain, shortCode, userId],
      );
    }

    return { userId: String(userId), domains: DOMAIN_FIXTURES.length };
  });
}

seed()
  .then(async (result) => {
    console.log(
      `Seeded ${result.domains} domains for ${SEED_USER_EMAIL} and assigned demo links to custom domains.`,
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("Domain seed failed:", error.message);
    process.exitCode = 1;
  });
