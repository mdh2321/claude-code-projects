import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractRecipeFromText } from './claude.service';

export async function scrapeRecipeFromUrl(url: string) {
  try {
    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, nav, footer, header, .advertisement, .ad, .comments').remove();

    // Try to find structured data first (schema.org Recipe)
    const structuredData = $('script[type="application/ld+json"]');
    let recipeText = '';

    structuredData.each((_, element) => {
      try {
        const data = JSON.parse($(element).html() || '');
        if (data['@type'] === 'Recipe' || data['@type']?.includes('Recipe')) {
          recipeText = JSON.stringify(data, null, 2);
          return false; // break the loop
        }
      } catch (e) {
        // Continue to next structured data
      }
    });

    // If no structured data found, extract main content
    if (!recipeText) {
      // Try to find recipe-specific containers
      const recipeContainers = [
        'article',
        '[class*="recipe"]',
        '[id*="recipe"]',
        'main',
        '.entry-content',
        '.post-content',
      ];

      let $recipeContent = $('body');
      for (const selector of recipeContainers) {
        const $container = $(selector);
        if ($container.length > 0) {
          $recipeContent = $container.first();
          break;
        }
      }

      // Extract text content
      recipeText = $recipeContent.text();
    }

    // Clean up the text
    recipeText = recipeText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    if (!recipeText || recipeText.length < 50) {
      throw new Error('Could not extract recipe content from URL');
    }

    // Use Claude to extract structured recipe from the text
    const recipe = await extractRecipeFromText(recipeText);

    return {
      ...recipe,
      sourceUrl: url,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
    throw error;
  }
}
