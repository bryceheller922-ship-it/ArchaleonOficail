export interface WebResult {
  url: string;
  title: string;
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Fetch a real web page via CORS proxy and extract text content.
 */
export async function fetchWebPage(url: string): Promise<WebResult> {
  try {
    // Normalize URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`;

    const res = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        url: normalizedUrl,
        title: "Error",
        content: "",
        success: false,
        error: `Failed to fetch: ${res.status}`,
      };
    }

    const data = await res.json();
    const html: string = data.contents || "";

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
    const title = titleMatch
      ? decodeHtmlEntities(titleMatch[1].trim())
      : new URL(normalizedUrl).hostname;

    // Extract meaningful text content
    const content = extractTextContent(html);

    return {
      url: normalizedUrl,
      title,
      content: content.slice(0, 3000), // Limit for AI context
      success: true,
    };
  } catch (err: any) {
    return {
      url,
      title: "Error",
      content: "",
      success: false,
      error: err.message || "Failed to fetch page",
    };
  }
}

/**
 * Search the web using Google (via CORS proxy) and extract results.
 */
export async function searchWeb(query: string): Promise<WebResult> {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=5`;
  const result = await fetchWebPage(searchUrl);

  if (result.success) {
    // Try to extract search result snippets
    const snippets = extractSearchResults(result.content);
    result.content = snippets || result.content;
    result.title = `Search: ${query}`;
  }

  return result;
}

function extractTextContent(html: string): string {
  // Remove scripts, styles, and HTML tags
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  // Remove very short lines that are likely navigation
  const lines = text
    .split(/[.!?]\s+/)
    .filter((line) => line.trim().length > 20);
  return lines.join(". ").trim();
}

function extractSearchResults(text: string): string {
  // Just return cleaned text for search results
  const lines = text.split(/\s{2,}/).filter((l) => l.length > 30);
  return lines.slice(0, 10).join("\n\n");
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
