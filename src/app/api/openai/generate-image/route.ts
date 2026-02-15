import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Generate 4 images in parallel
    const imagePromises = Array(4)
      .fill(null)
      .map(() =>
        openai.images.generate({
          model: "dall-e-3",
          prompt,
          size: "1024x1024",
          quality: "hd",
          n: 1,
        })
      );

    const results = await Promise.all(imagePromises);

    // Extract URLs from all results
    const imageUrls = results
      .map((result) => result.data?.[0]?.url)
      .filter((url): url is string => !!url);

    if (imageUrls.length !== 4) {
      return NextResponse.json(
        { error: "Failed to generate all images" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { imageUrls },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate images" },
      { status: 500 }
    );
  }
}
