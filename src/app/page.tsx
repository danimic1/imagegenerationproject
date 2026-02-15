"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [showImages, setShowImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setError(null);
    setLoading(true);
    setShowImages(true);
    setImageUrls([]);

    try {
      const res = await fetch("/api/openai/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate images");
      }

      const data = await res.json();
      setImageUrls(data.imageUrls);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-lg font-medium">Home</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the image you want to generate"
            className="w-full px-6 py-4 rounded-full border-2 border-pink-300 bg-pink-50 text-gray-700 placeholder-pink-400 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {showImages && (
          <div className="grid grid-cols-2 gap-6 animate-fade-in">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-sm relative overflow-hidden"
              >
                {loading && !imageUrls[index] && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" 
                    style={{
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                )}
                {imageUrls[index] && (
                  <Image
                    src={imageUrls[index]}
                    alt={`Generated image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
