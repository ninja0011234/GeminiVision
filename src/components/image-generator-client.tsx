"use client";

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download, AlertCircle, ImageIcon, Sparkles, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sanitizePrompt } from '@/ai/flows/sanitize-prompt';
import { generateImage } from '@/ai/flows/generate-image';

const ImagePlaceholder = () => (
  <div 
    className="aspect-video w-full max-w-2xl rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center p-8 text-center shadow-inner"
    data-ai-hint="abstract placeholder"
  >
    <ImageIcon className="h-20 w-20 text-muted-foreground/50 mb-6" strokeWidth={1.5} />
    <p className="text-xl font-semibold text-foreground mb-2">Your Vision Awaits</p>
    <p className="text-sm text-muted-foreground">
      Enter a prompt and adjust settings, then let our AI bring your ideas to life.
    </p>
  </div>
);

export function ImageGeneratorClient() {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('square');
  const [stylePreset, setStylePreset] = useState<string>('none');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate an image.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const { sanitizedPrompt } = await sanitizePrompt({ prompt });
      if (prompt !== sanitizedPrompt) {
        toast({
          title: 'Prompt Sanitized',
          description: `Your prompt was adjusted for safety. Original: "${prompt}", Used: "${sanitizedPrompt}"`,
        });
      }
      
      const { imageUrl: newImageUrl } = await generateImage({ 
        prompt: sanitizedPrompt,
        aspectRatio,
        stylePreset,
      });
      setImageUrl(newImageUrl);
    } catch (err) {
      console.error('Image generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image: ${errorMessage}`);
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    const mimeType = imageUrl.match(/data:image\/([^;]+);/);
    const extension = mimeType ? mimeType[1] : 'png';
    link.download = `gemini-vision-image.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Image Downloaded',
      description: `Image saved as gemini-vision-image.${extension}`,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-background">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Create Your Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="prompt" className="text-lg font-medium mb-2 block">
                Image Prompt
              </Label>
              <Input
                id="prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A futuristic cityscape at sunset, cyberpunk style"
                disabled={isLoading}
                className="text-base py-3 px-4 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aspectRatio" className="text-base font-medium mb-1.5 block">
                  Aspect Ratio
                </Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isLoading}>
                  <SelectTrigger id="aspectRatio" className="w-full text-base py-3 px-4 rounded-md shadow-sm">
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square (1:1)</SelectItem>
                    <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                    <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stylePreset" className="text-base font-medium mb-1.5 block">
                  Style Preset
                </Label>
                <Select value={stylePreset} onValueChange={setStylePreset} disabled={isLoading}>
                  <SelectTrigger id="stylePreset" className="w-full text-base py-3 px-4 rounded-md shadow-sm">
                    <SelectValue placeholder="Select style preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default Style</SelectItem>
                    <SelectItem value="photorealistic">Photorealistic</SelectItem>
                    <SelectItem value="digital art">Digital Art</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="impressionistic">Impressionistic</SelectItem>
                    <SelectItem value="fantasy">Fantasy Art</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full text-lg py-3 rounded-md transition-all duration-150 ease-in-out transform active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-8 flex justify-center items-center">
            {isLoading && !imageUrl && (
               <div className="text-center p-8 space-y-4">
                 <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                 <p className="text-lg font-medium text-muted-foreground">Crafting your masterpiece...</p>
                 <p className="text-sm text-muted-foreground">This might take a moment.</p>
               </div>
            )}
            {!isLoading && imageUrl && (
              <Card className="w-full max-w-2xl shadow-lg rounded-xl overflow-hidden group">
                <CardContent className="p-0">
                  <Image
                    src={imageUrl}
                    alt={prompt || 'Generated AI image'}
                    width={1024} 
                    height={1024}
                    className="w-full h-auto object-contain rounded-t-xl transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="generated art"
                    priority={true} // Add priority for faster LCP
                  />
                </CardContent>
                <CardFooter className="p-4 bg-muted/50 border-t">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full gap-2 hover:bg-primary/10 hover:text-primary"
                    disabled={!imageUrl}
                  >
                    <Download className="h-5 w-5" />
                    Download Image
                  </Button>
                </CardFooter>
              </Card>
            )}
            {!isLoading && !imageUrl && !error && <ImagePlaceholder />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
