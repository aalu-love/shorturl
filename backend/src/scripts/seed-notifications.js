require("dotenv").config({
  path: process.argv[2] || ".env.local",
});

const { queryWrite, withTransaction } = require("../config/database");
const { connectMongoDB, closeConnection } = require("../config/mongodb");
const { ClickEvent } = require("../config/schemas");

const SEED_CODES = ["seednotify1", "seednotify2", "seednotify3"];
const CLICK_FIXTURES = [
  { code: "seednotify1", count: 12, referer: "https://news.example.com" },
  { code: "seednotify2", count: 5, referer: "https://social.example.com" },
  { code: "seednotify3", count: 0, referer: null },
];

async function seedPostgres() {
  return withTransaction(async (client) => {
    const { rows: users } = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [process.env.SEED_USER_EMAIL || "dev@example.com"],
    );
    if (users.length === 0) {
      throw new Error(
        "Seed user not found. Run postgres/init/02_seed.sql first.",
      );
    }

    const userId = users[0].id;
    const links = [];
    for (const [index, code] of SEED_CODES.entries()) {
      const { rows } = await client.query(
        `INSERT INTO short_urls (
           short_code, original_url, title, user_id, click_count,
           expires_at, tags, note, og_title, health_status,
           milestone_threshold, health_checked_at
         ) VALUES ($1, $2, $3, $4, 0, NULL, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (short_code) DO UPDATE SET
           original_url = EXCLUDED.original_url,
           title = EXCLUDED.title,
           user_id = EXCLUDED.user_id,
           tags = EXCLUDED.tags,
           note = EXCLUDED.note,
           og_title = EXCLUDED.og_title,
           health_status = EXCLUDED.health_status,
           milestone_threshold = EXCLUDED.milestone_threshold,
           is_active = true
         WHERE short_urls.user_id = EXCLUDED.user_id
         RETURNING id, short_code`,
        [
          code,
          `https://example.com/seed-notification-${index + 1}`,
          ["Launch campaign", "Social campaign", "Internal docs"][index],
          userId,
          [["marketing", "launch"], ["social"], ["internal"]][index],
          `Seed link for notification testing ${index + 1}`,
          ["Launch campaign", "Social campaign", "Internal docs"][index],
          ["ok", "warn", "error"][index],
          [1000, 500, 100][index],
        ],
      );
      if (rows.length === 0) {
        throw new Error(`Seed code '${code}' belongs to another user.`);
      }
      links.push(rows[0]);
    }

    await client.query(
      `INSERT INTO notification_preferences
         (user_id, digest_enabled, health_enabled, default_threshold)
       VALUES ($1, true, true, 1000)
       ON CONFLICT (user_id) DO UPDATE SET
         digest_enabled = EXCLUDED.digest_enabled,
         health_enabled = EXCLUDED.health_enabled,
         default_threshold = EXCLUDED.default_threshold,
         updated_at = NOW()`,
      [userId],
    );

    await client.query(
      `DELETE FROM notifications
       WHERE user_id = $1 AND link_short_url IN ($2, $3, $4)`,
      [userId, ...SEED_CODES.map((code) => `http://localhost:3000/${code}`)],
    );

    await client.query(
      `INSERT INTO notifications
         (user_id, type, title, description, link_short_url, read)
       VALUES
         ($1, 'milestone', 'Launch link reached 12 clicks',
          'seednotify1 crossed its test milestone.', $2, false),
         ($1, 'health', 'Destination needs attention',
          'seednotify2 responded slowly during the latest health check.', $3, false),
         ($1, 'digest', 'Weekly link digest is ready',
          'Your seeded links received 17 clicks this week.', NULL, true),
         ($1, 'schedule', 'Scheduled link is active',
          'seednotify3 is ready for its scheduled campaign.', $4, true)`,
      [userId, ...SEED_CODES.map((code) => `http://localhost:3000/${code}`)],
    );

    return { userId: String(userId), links };
  });
}

async function seedMongo(links) {
  await connectMongoDB();
  const urlIds = links.map((link) => String(link.id));
  await ClickEvent.deleteMany({ url_id: { $in: urlIds } });

  const events = [];
  for (const fixture of CLICK_FIXTURES) {
    const link = links.find((item) => item.short_code === fixture.code);
    for (let index = 0; index < fixture.count; index += 1) {
      events.push({
        url_id: String(link.id),
        short_code: fixture.code,
        ip_address: `192.0.2.${index + 1}`,
        user_agent: index % 2 === 0 ? "Mozilla/5.0 (Mobile)" : "Mozilla/5.0",
        referer: fixture.referer,
        country: index % 2 === 0 ? "US" : "IN",
        created_at: new Date(Date.now() - index * 60 * 60 * 1000),
      });
    }
  }
  if (events.length > 0) await ClickEvent.insertMany(events);
  return events.length;
}

async function syncClickCounts(links) {
  for (const fixture of CLICK_FIXTURES) {
    const link = links.find((item) => item.short_code === fixture.code);
    await queryWrite(
      `UPDATE short_urls SET click_count = $1, last_clicked_at = $2 WHERE id = $3`,
      [fixture.count, fixture.count ? new Date() : null, link.id],
    );
  }
}

async function main() {
  const seeded = await seedPostgres();
  const clickCount = await seedMongo(seeded.links);
  await syncClickCounts(seeded.links);
  console.log(
    `Seeded ${seeded.links.length} links, ${clickCount} clicks, and notifications for user ${seeded.userId}.`,
  );
  await closeConnection();
  process.exit(0);
}

main().catch(async (error) => {
  console.error("Notification seed failed:", error.message);
  await closeConnection().catch(() => {});
  process.exitCode = 1;
});
