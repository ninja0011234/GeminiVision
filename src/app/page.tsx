import { ImageGeneratorClient } from '@/components/image-generator-client';
import { Header } from '@/components/layout/header';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto py-8 md:py-12">
        <ImageGeneratorClient />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} GeminiVision. Powered by AI.</p>
      </footer>
    </>
  );
}
