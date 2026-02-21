// OpenAI DALL-E Image Generation Utility with Caching
// To use this, replace 'YOUR_OPENAI_API_KEY' with your actual OpenAI API key

import { imageCacheService } from './imageCache';

interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

// Mock images for demonstration (replace with actual API call results)
const mockImages: Record<string, string> = {
  "민주항쟁": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
  "세종대왕": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
  "독립운동": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
  "고려시대": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  "조선시대": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "한글": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  "default": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80"
};

export async function generateQuestionImage(questionText: string): Promise<string> {
  const apiKey = "YOUR_OPENAI_API_KEY"; // Replace with your actual API key
  
  // If API key is not set, return mock image
  if (apiKey === "YOUR_OPENAI_API_KEY") {
    console.log("🎨 Using mock image. Set your OpenAI API key to generate real images.");
    
    // Return mock image based on question keywords
    for (const [keyword, imageUrl] of Object.entries(mockImages)) {
      if (questionText.includes(keyword)) {
        return imageUrl;
      }
    }
    return mockImages.default;
  }

  try {
    // Create a simplified prompt for the image
    const prompt = `Educational illustration for Korean history question: ${questionText}. 
      Style: Simple, educational, colorful, suitable for elementary students. 
      No text in the image.`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3", // or "dall-e-2" for faster/cheaper generation
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard", // "standard" or "hd"
        style: "vivid" // "vivid" or "natural"
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ImageGenerationResponse = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    // Fallback to mock image on error
    return mockImages.default;
  }
}

// Alternative: Generate image with more control
export async function generateImageWithPrompt(
  customPrompt: string,
  options?: {
    size?: "1024x1024" | "1792x1024" | "1024x1792";
    quality?: "standard" | "hd";
    style?: "vivid" | "natural";
  }
): Promise<string> {
  const apiKey = "YOUR_OPENAI_API_KEY"; // Replace with your actual API key

  if (apiKey === "YOUR_OPENAI_API_KEY") {
    console.log("🎨 Using mock image. Set your OpenAI API key to generate real images.");
    return mockImages.default;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: customPrompt,
        n: 1,
        size: options?.size || "1024x1024",
        quality: options?.quality || "standard",
        style: options?.style || "vivid"
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ImageGenerationResponse = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    return mockImages.default;
  }
}
