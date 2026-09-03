require("dotenv").config({
  path: process.argv[2] || ".env.local",
});

const { queryWrite, withTransaction } = require("../config/database");
const { connectMongoDB, closeConnection } = require("../config/mongodb");
const { ClickEvent } = require("../config/schemas");

const SEED_USER_EMAIL = process.env.SEED_USER_EMAIL || "dev@example.com";
const SEED_AGENT = "ShortShout Analytics Seed/1.0";
const LINK_FIXTURES = [
  {
    code: "analyticsdemo1",
    title: "Product launch",
    tags: ["marketing", "launch"],
    url: "https://example.com/product-launch",
  },
  {
    code: "analyticsdemo2",
    title: "Documentation",
    tags: ["docs", "product"],
    url: "https://example.com/docs",
  },
  {
    code: "analyticsdemo3",
    title: "Social campaign",
    tags: ["social"],
    url: "https://example.com/social",
  },
  {
    code: "analyticsdemo4",
    title: "Newsletter",
    tags: ["email"],
    url: "https://example.com/newsletter",
  },
  {
    code: "analyticsdemo5",
    title: "Community invite",
    tags: ["community"],
    url: "https://example.com/community",
  },
];
const REFERRERS = [
  "https://twitter.com",
  "https://www.linkedin.com",
  "https://news.ycombinator.com",
  null,
];
const USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile",
  "Mozilla/5.0 (Linux; Android 14) Mobile",
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) Tablet",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
];

async function seedLinks() {
  return withTransaction(async (client) => {
    const { rows: users } = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [SEED_USER_EMAIL],
    );
    if (users.length === 0) {
      throw new Error(`Seed user '${SEED_USER_EMAIL}' not found.`);
    }

    const links = [];
    for (const fixture of LINK_FIXTURES) {
      const { rows } = await client.query(
        `INSERT INTO short_urls
           (short_code, original_url, title, user_id, click_count, expires_at, tags, is_active)
         VALUES ($1, $2, $3, $4, 0, NULL, $5, true)
         ON CONFLICT (short_code) DO UPDATE SET
           original_url = EXCLUDED.original_url,
           title = EXCLUDED.title,
           user_id = EXCLUDED.user_id,
           tags = EXCLUDED.tags,
           is_active = true
         WHERE short_urls.user_id = EXCLUDED.user_id
         RETURNING id, short_code`,
        [fixture.code, fixture.url, fixture.title, users[0].id, fixture.tags],
      );
      if (rows.length === 0) {
        throw new Error(`Seed code '${fixture.code}' belongs to another user.`);
      }
      links.push(rows[0]);
    }
    return { userId: String(users[0].id), links };
  });
}

function buildEvents(links) {
  const events = [];
  for (let day = 0; day < 7; day += 1) {
    for (let linkIndex = 0; linkIndex < links.length; linkIndex += 1) {
      const count = 8 + ((day * 3 + linkIndex * 5) % 18);
      for (let click = 0; click < count; click += 1) {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - day);
        createdAt.setHours(8 + (click % 12), (click * 7) % 60, 0, 0);
        events.push({
          url_id: String(links[linkIndex].id),
          short_code: links[linkIndex].short_code,
          ip_address: `198.51.100.${((day * 31 + click) % 240) + 1}`,
          user_agent: `${USER_AGENTS[(day + click + linkIndex) % USER_AGENTS.length]} ${SEED_AGENT}`,
          referer: REFERRERS[(day + click + linkIndex) % REFERRERS.length],
          country: ["US", "IN", "GB", "CA"][(day + click) % 4],
          created_at: createdAt,
        });
      }
    }
  }
  return events;
}

async function main() {
  const seeded = await seedLinks();
  await connectMongoDB();
  const urlIds = seeded.links.map((link) => String(link.id));
  await ClickEvent.deleteMany({
    url_id: { $in: urlIds },
    user_agent: { $regex: SEED_AGENT },
  });

  const events = buildEvents(seeded.links);
  await ClickEvent.insertMany(events);
  for (const link of seeded.links) {
    const count = events.filter(
      (event) => event.short_code === link.short_code,
    ).length;
    await queryWrite(
      `UPDATE short_urls
       SET click_count = $1, last_clicked_at = $2
       WHERE id = $3 AND user_id = $4`,
      [count, new Date(), link.id, seeded.userId],
    );
  }

  console.log(
    `Seeded ${events.length} analytics events across ${seeded.links.length} links for ${SEED_USER_EMAIL}.`,
  );
  await closeConnection();
  process.exit(0);
}

main().catch(async (error) => {
  console.error("Analytics seed failed:", error.message);
  await closeConnection().catch(() => {});
  process.exitCode = 1;
});
