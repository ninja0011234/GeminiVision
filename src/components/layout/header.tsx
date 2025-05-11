import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 px-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-90 transition-opacity">
          <Sparkles className="h-7 w-7" />
          <span>GeminiVision</span>
        </Link>
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}
