const { ClickEvent } = require("../config/schemas");

const AnalyticsModel = {
  /**
   * Record a single click event in MongoDB.
   * Called asynchronously on every redirect — never blocks the response.
   */
  async recordClick({
    urlId,
    shortCode,
    ipAddress,
    userAgent,
    referer,
    country,
  }) {
    try {
      await ClickEvent.create({
        url_id: String(urlId),
        short_code: shortCode,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        referer: referer || null,
        country: country || null,
      });
    } catch (err) {
      // Log but don't throw — analytics failures should not block redirects
      console.error("Analytics recording failed:", err.message);
    }
  },

  /**
   * Aggregate click stats for a single URL using MongoDB aggregation pipeline.
   * Optimized for analytics queries.
   */
  async getUrlStats(shortCode, { days = 30 } = {}) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalsResult, dailyResult, topReferersResult, topCountriesResult] =
      await Promise.all([
        // Total + unique clicks
        ClickEvent.aggregate([
          { $match: { short_code: shortCode, created_at: { $gte: since } } },
          {
            $group: {
              _id: null,
              total_clicks: { $sum: 1 },
              unique_clicks: {
                $addToSet: "$ip_address",
              },
            },
          },
          {
            $project: {
              _id: 0,
              total_clicks: 1,
              unique_clicks: { $size: "$unique_clicks" },
            },
          },
        ]),

        // Daily breakdown
        ClickEvent.aggregate([
          { $match: { short_code: shortCode, created_at: { $gte: since } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
              },
              clicks: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id",
              clicks: 1,
            },
          },
        ]),

        // Top 10 referrers
        ClickEvent.aggregate([
          {
            $match: {
              short_code: shortCode,
              created_at: { $gte: since },
              referer: { $ne: null },
            },
          },
          { $group: { _id: "$referer", clicks: { $sum: 1 } } },
          { $sort: { clicks: -1 } },
          { $limit: 10 },
          {
            $project: {
              _id: 0,
              referer: "$_id",
              clicks: 1,
            },
          },
        ]),

        // Top 10 countries
        ClickEvent.aggregate([
          {
            $match: {
              short_code: shortCode,
              created_at: { $gte: since },
              country: { $ne: null },
            },
          },
          { $group: { _id: "$country", clicks: { $sum: 1 } } },
          { $sort: { clicks: -1 } },
          { $limit: 10 },
          {
            $project: {
              _id: 0,
              country: "$_id",
              clicks: 1,
            },
          },
        ]),
      ]);

    return {
      total_clicks: totalsResult[0]?.total_clicks || 0,
      unique_clicks: totalsResult[0]?.unique_clicks || 0,
      daily: dailyResult || [],
      top_referers: topReferersResult || [],
      top_countries: topCountriesResult || [],
    };
  },

  /**
   * Get aggregated dashboard stats for a user.
   * Aggregates click counts across all URLs for the last 30 days.
   */
  async getDashboardStats(urlIds, totalUrls) {
    const periodDays = 30;
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    if (urlIds.length === 0) {
      return {
        total_urls: totalUrls,
        total_clicks: 0,
        top_url_clicks: 0,
        avg_daily_clicks: 0,
      };
    }

    const result = await ClickEvent.aggregate([
      {
        $match: { url_id: { $in: urlIds }, created_at: { $gte: since } },
      },
      {
        $group: {
          _id: "$url_id",
          clicks: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          total_clicks: { $sum: "$clicks" },
          top_url_clicks: { $max: "$clicks" },
        },
      },
      {
        $project: {
          _id: 0,
          total_clicks: 1,
          top_url_clicks: 1,
          avg_daily_clicks: {
            $round: [{ $divide: ["$total_clicks", periodDays] }, 2],
          },
        },
      },
    ]);

    return {
      total_urls: totalUrls,
      ...(result[0] || {
        total_clicks: 0,
        top_url_clicks: 0,
        avg_daily_clicks: 0,
      }),
    };
  },

  async getOverview(urls, { days = 30 } = {}) {
    if (urls.length === 0) {
      return {
        total_clicks: 0,
        unique_visitors: 0,
        over_time: [],
        referrers: [],
        devices: [],
        top_links: [],
      };
    }

    const shortCodes = urls.map((url) => url.short_code);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const previousSince = new Date(
      since.getTime() - days * 24 * 60 * 60 * 1000,
    );
    const match = {
      short_code: { $in: shortCodes },
      created_at: { $gte: since },
    };

    const [totals, overTime, referrers, previousReferrers, devices, topLinks] =
      await Promise.all([
        ClickEvent.aggregate([
          { $match: match },
          {
            $group: {
              _id: null,
              clicks: { $sum: 1 },
              visitors: { $addToSet: "$ip_address" },
            },
          },
          { $project: { _id: 0, clicks: 1, visitors: { $size: "$visitors" } } },
        ]),
        ClickEvent.aggregate([
          { $match: match },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
              },
              clicks: { $sum: 1 },
              visitors: { $addToSet: "$ip_address" },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id",
              clicks: 1,
              unique_visitors: { $size: "$visitors" },
            },
          },
        ]),
        ClickEvent.aggregate([
          { $match: match },
          { $project: { source: { $ifNull: ["$referer", "Direct"] } } },
          { $group: { _id: "$source", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        ClickEvent.aggregate([
          {
            $match: {
              short_code: { $in: shortCodes },
              created_at: { $gte: previousSince, $lt: since },
            },
          },
          { $project: { source: { $ifNull: ["$referer", "Direct"] } } },
          { $group: { _id: "$source", count: { $sum: 1 } } },
        ]),
        ClickEvent.aggregate([
          { $match: match },
          {
            $project: {
              device: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $regexMatch: {
                          input: { $ifNull: ["$user_agent", ""] },
                          regex: "tablet|ipad",
                          options: "i",
                        },
                      },
                      then: "Tablet",
                    },
                    {
                      case: {
                        $regexMatch: {
                          input: { $ifNull: ["$user_agent", ""] },
                          regex: "mobile|android|iphone",
                          options: "i",
                        },
                      },
                      then: "Mobile",
                    },
                  ],
                  default: "Desktop",
                },
              },
            },
          },
          { $group: { _id: "$device", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        ClickEvent.aggregate([
          { $match: match },
          { $group: { _id: "$short_code", clicks: { $sum: 1 } } },
          { $sort: { clicks: -1 } },
          { $limit: 10 },
        ]),
      ]);

    const totalClicks = totals[0]?.clicks || 0;
    const previousCounts = new Map(
      previousReferrers.map((item) => [item._id, item.count]),
    );
    const percentage = (count, total) =>
      total ? Math.round((count / total) * 100) : 0;
    const trend = (current, previous) =>
      previous
        ? Math.round(((current - previous) / previous) * 100)
        : current
          ? 100
          : 0;
    const urlByCode = new Map(urls.map((url) => [url.short_code, url]));

    return {
      total_clicks: totalClicks,
      unique_visitors: totals[0]?.visitors || 0,
      over_time: overTime,
      referrers: referrers.map((item) => ({
        name: item._id,
        count: item.count,
        percentage: percentage(item.count, totalClicks),
        trend: trend(item.count, previousCounts.get(item._id) || 0),
      })),
      devices: devices.map((item) => ({
        name: item._id,
        count: item.count,
        percentage: percentage(item.count, totalClicks),
      })),
      top_links: topLinks.map((item) => ({
        ...urlByCode.get(item._id),
        id: String(urlByCode.get(item._id).id),
        short_code: item._id,
        clicks: item.clicks,
      })),
    };
  },

  async getRecentClicks(urlIds, limit = 5) {
    if (urlIds.length === 0) return [];

    const events = await ClickEvent.find({ url_id: { $in: urlIds } })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();

    return events.map((event) => ({
      id: String(event._id),
      short_code: event.short_code,
      referer: event.referer,
      country: event.country,
      user_agent: event.user_agent,
      created_at: event.created_at,
    }));
  },
};

module.exports = AnalyticsModel;
