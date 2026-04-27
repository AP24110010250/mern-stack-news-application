import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media", { keepArray: true }],
      ["image", "image"],
      ["description", "description"]
    ]
  }
});

const FEEDS = {
  "Top India": "https://www.indiatoday.in/rss/1206584", // Top Stories
  "Politics": "https://www.indiatoday.in/rss/1206514", // Nation
  "World": "https://www.indiatoday.in/rss/1206577",
  "Sports": "https://www.indiatoday.in/rss/1206550",
  "Business": "https://www.indiatoday.in/rss/1206513"
};

/**
 * Fetches and normalizes news from India Today RSS feeds.
 */
export const getIndiaTodayRSSNews = async (category = "Top India") => {
  const url = FEEDS[category] || FEEDS["Top India"];
  
  try {
    const feed = await parser.parseURL(url);
    
    return feed.items.map((item) => {
      // Extract image URL from media:content or description
      let imageUrl = item.image || "";
      if (!imageUrl && item.media && item.media[0]) {
        imageUrl = item.media[0].$.url;
      }
      
      // If still no image, try to parse from description (India Today often puts it there)
      if (!imageUrl && item.description) {
        const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }

      // Clean description from HTML tags
      const excerpt = (item.contentSnippet || item.description || "")
        .replace(/<[^>]*>?/gm, "")
        .slice(0, 200)
        .trim();

      return {
        title: item.title,
        slug: (item.guid || item.link || "").split("/").pop() || Math.random().toString(36).slice(2, 9),
        excerpt: excerpt || "Read more about this story from India Today.",
        content: excerpt, // RSS usually only gives snippets
        author: "India Today Desk",
        category: category === "Top India" ? "Politics" : category,
        imageUrl: imageUrl || "https://www.indiatoday.in/favicon.ico",
        sourceName: "India Today",
        sourceUrl: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        readTime: 2,
        tags: ["India Today", category],
        featured: false
      };
    });
  } catch (error) {
    console.error(`India Today RSS Error (${category}):`, error.message);
    return [];
  }
};
