"use client"; // Required for useEffect

import { ImageGeneratorClient } from '@/components/image-generator-client';
import { Header } from '@/components/layout/header';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto py-8 md:py-12 px-4"> {/* Added px-4 for horizontal padding */}
        <ImageGeneratorClient />
      </main>
      {/* Footer is now part of ImageGeneratorClient's CardFooter for better contextual placement */}
    </>
  );
}
