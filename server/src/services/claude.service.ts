import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ExtractedRecipe {
  title: string;
  description?: string;
  ingredients: Array<{
    quantity?: string;
    unit?: string;
    item: string;
    text: string;
  }>;
  directions: Array<{
    stepNumber: number;
    text: string;
  }>;
  tips?: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

export async function extractRecipeFromText(text: string): Promise<ExtractedRecipe> {
  const prompt = `You are a recipe extraction assistant. Extract the recipe information from the following text and return it in a clean, structured JSON format.

The recipe might contain unnecessary fluff, ads, life stories, etc. Your job is to extract ONLY the essential recipe information.

Return a JSON object with this structure:
{
  "title": "Recipe title",
  "description": "Brief description (optional)",
  "ingredients": [
    {
      "quantity": "2",
      "unit": "cups",
      "item": "flour",
      "text": "2 cups flour"
    }
  ],
  "directions": [
    {
      "stepNumber": 1,
      "text": "First step..."
    }
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4
}

Important guidelines:
- Be concise and clear
- Remove any fluff or unnecessary narrative
- Extract cooking tips if mentioned
- Parse ingredients into quantity, unit, and item when possible
- Number all direction steps sequentially
- Times should be in minutes
- If information is not available, omit the field

Here's the text to process:

${text}

Return ONLY the JSON object, no additional text.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Extract JSON from the response (it might be wrapped in markdown code blocks)
  let jsonText = content.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
  }

  const recipe = JSON.parse(jsonText);
  return recipe;
}

export async function extractRecipeFromImage(imageBase64: string, mimeType: string): Promise<ExtractedRecipe> {
  const prompt = `You are a recipe extraction assistant. This image contains a recipe (possibly from a cookbook or a handwritten recipe card).

Extract all the recipe information you can see and return it in a clean, structured JSON format.

Return a JSON object with this structure:
{
  "title": "Recipe title",
  "description": "Brief description (optional)",
  "ingredients": [
    {
      "quantity": "2",
      "unit": "cups",
      "item": "flour",
      "text": "2 cups flour"
    }
  ],
  "directions": [
    {
      "stepNumber": 1,
      "text": "First step..."
    }
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4
}

Important guidelines:
- Extract all visible text accurately
- Parse ingredients into quantity, unit, and item when possible
- Number all direction steps sequentially
- Times should be in minutes
- If information is not available, omit the field

Return ONLY the JSON object, no additional text.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Extract JSON from the response
  let jsonText = content.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
  }

  const recipe = JSON.parse(jsonText);
  return recipe;
}
