
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; // Added Textarea
import { Loader2, Download, AlertCircle, ImageIcon, Sparkles, Settings2, Wand2, Palette, Crop, ShieldOff, Camera, CheckCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sanitizePrompt } from '@/ai/flows/sanitize-prompt';
import { generateImage } from '@/ai/flows/generate-image';

const ImagePlaceholder = () => (
  <div 
    className="aspect-video w-full max-w-2xl rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex flex-col items-center justify-center p-8 text-center shadow-inner"
    data-ai-hint="abstract geometric placeholder"
  >
    <ImageIcon className="h-20 w-20 text-muted-foreground/50 mb-6" strokeWidth={1.2} />
    <p className="text-xl font-semibold text-foreground mb-2">Your Vision Awaits Creation</p>
    <p className="text-sm text-muted-foreground">
      Craft your prompt, select your style, and let the AI weave its magic.
    </p>
  </div>
);

export function ImageGeneratorClient() {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('square');
  const [stylePreset, setStylePreset] = useState<string>('none');
  const [quality, setQuality] = useState<string>('standard');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [seed, setSeed] = useState<string>('');
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);


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
      if (prompt !== sanitizedPrompt && sanitizedPrompt.trim() !== "") {
        toast({
          title: 'Prompt Adjusted',
          description: `Your prompt was slightly modified for safety and clarity. Original: "${prompt}", Used: "${sanitizedPrompt}"`,
          duration: 7000, // Longer duration for this important toast
        });
      }
      
      const effectivePrompt = sanitizedPrompt.trim() === "" ? prompt : sanitizedPrompt; // Use original if sanitized is empty

      const seedNumber = seed.trim() ? parseInt(seed, 10) : undefined;
      if (seed.trim() && (isNaN(seedNumber!) || seedNumber! <= 0)) {
        toast({
          title: 'Invalid Seed',
          description: 'Seed must be a positive whole number.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const { imageUrl: newImageUrl } = await generateImage({ 
        prompt: effectivePrompt,
        aspectRatio,
        stylePreset,
        quality,
        negativePrompt,
        seed: seedNumber,
      });
      setImageUrl(newImageUrl);
      toast({
        title: 'Image Generated!',
        description: 'Your masterpiece is ready.',
        variant: 'default',
        className: 'bg-green-500 border-green-600 text-white', // Custom success toast
      });
    } catch (err) {
      console.error('Image generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image generation.';
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
    link.download = `gemini-vision-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Image Downloaded',
      description: `Image saved as ${link.download}`,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <Card className="shadow-2xl overflow-hidden border-primary/20">
        <CardHeader className="bg-gradient-to-br from-primary/10 via-background to-background p-6">
          <CardTitle className="text-3xl font-bold flex items-center gap-3 text-primary">
            <Wand2 className="h-8 w-8" />
            AI Image Studio
          </CardTitle>
          <p className="text-muted-foreground text-sm">Transform your ideas into stunning visuals with the power of AI.</p>
        </CardHeader>
        <CardContent className="pt-8 space-y-8 px-6 pb-8"> {/* Increased padding and spacing */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="prompt" className="text-lg font-semibold mb-2 block flex items-center text-foreground">
                <Sparkles className="h-5 w-5 mr-2 text-amber-400" />
                Describe Your Vision
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A serene zen garden with a koi pond under a cherry blossom tree, cinematic lighting, hyperrealistic"
                disabled={isLoading}
                className="text-base py-3 px-4 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px] border-input hover:border-primary/50 transition-colors"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="aspectRatio" className="text-base font-medium mb-1.5 block flex items-center">
                  <Crop className="h-5 w-5 mr-2 text-blue-500" />
                  Aspect Ratio
                </Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isLoading}>
                  <SelectTrigger id="aspectRatio" className="w-full text-base py-3 px-4 rounded-lg shadow-sm border-input hover:border-primary/50 transition-colors">
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
                <Label htmlFor="stylePreset" className="text-base font-medium mb-1.5 block flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-purple-500" />
                  Artistic Style
                </Label>
                <Select value={stylePreset} onValueChange={setStylePreset} disabled={isLoading}>
                  <SelectTrigger id="stylePreset" className="w-full text-base py-3 px-4 rounded-lg shadow-sm border-input hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Select style preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default</SelectItem>
                    <SelectItem value="photorealistic">Photorealistic</SelectItem>
                    <SelectItem value="digital art">Digital Art</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="impressionistic">Impressionistic</SelectItem>
                    <SelectItem value="fantasy">Fantasy Art</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="isometric">Isometric</SelectItem>
                    <SelectItem value="pixelart">Pixel Art</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="surreal">Surreal</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="steampunk">Steampunk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quality" className="text-base font-medium mb-1.5 block flex items-center">
                   <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Image Quality
                </Label>
                <Select value={quality} onValueChange={setQuality} disabled={isLoading}>
                  <SelectTrigger id="quality" className="w-full text-base py-3 px-4 rounded-lg shadow-sm border-input hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Select image quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="ultra">Ultra High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-6">
                <div>
                    <Label htmlFor="negativePrompt" className="text-base font-medium mb-1.5 block flex items-center">
                    <ShieldOff className="h-5 w-5 mr-2 text-red-500" />
                    Exclude (Negative Prompt)
                    </Label>
                    <Input
                    id="negativePrompt"
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="e.g., blurry, ugly, watermark, text, extra limbs"
                    disabled={isLoading}
                    className="text-base py-3 px-4 rounded-lg shadow-sm border-input hover:border-primary/50 transition-colors"
                    />
                </div>

                <div>
                    <Label htmlFor="seed" className="text-base font-medium mb-1.5 block flex items-center">
                        <Camera className="h-5 w-5 mr-2 text-teal-500" />
                        Seed (Optional &amp; Experimental)
                    </Label>
                    <Input
                        id="seed"
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value.replace(/[^0-9]/g, ''))} // Allow only numbers
                        placeholder="e.g., 12345 (positive number)"
                        min="1"
                        disabled={isLoading}
                        className="text-base py-3 px-4 rounded-lg shadow-sm border-input hover:border-primary/50 transition-colors"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                        Using a seed can help reproduce images. Leave empty for random.
                    </p>
                </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full text-lg py-3.5 rounded-lg transition-all duration-150 ease-in-out transform active:scale-[0.98] shadow-lg hover:shadow-primary/30 focus:ring-2 focus:ring-primary focus:ring-offset-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Magic...
                </>
              ) : (
                 <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Image
                </>
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-6 shadow-md">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Generation Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-10 flex justify-center items-center">
            {isLoading && !imageUrl && (
               <div className="text-center p-10 space-y-4 bg-muted/20 rounded-lg shadow-inner w-full max-w-md">
                 <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                 <p className="text-lg font-semibold text-foreground">The AI is painting your vision...</p>
                 <p className="text-sm text-muted-foreground">This creative process might take a few moments.</p>
               </div>
            )}
            {!isLoading && imageUrl && (
              <Card className="w-full max-w-2xl shadow-xl rounded-xl overflow-hidden group bg-card border-primary/20">
                <CardContent className="p-0 relative">
                  <Image
                    src={imageUrl}
                    alt={prompt || 'Generated AI image'}
                    width={1024} 
                    height={1024} 
                    className="w-full h-auto object-contain rounded-t-xl transition-transform duration-300 ease-out group-hover:scale-105"
                    data-ai-hint="generated art masterpiece digital"
                    priority={true}
                    unoptimized={imageUrl.startsWith('data:image/')} // For base64 images
                  />
                </CardContent>
                <CardFooter className="p-4 bg-muted/30 border-t border-primary/10 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
                    <p className="text-xs text-muted-foreground truncate max-w-xs hidden sm:block" title={prompt}>
                        <span className="font-medium text-foreground">Prompt:</span> {prompt.length > 40 ? `${prompt.substring(0, 40)}...` : prompt}
                    </p>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full sm:w-auto gap-2 hover:bg-primary hover:text-primary-foreground border-primary/50 text-primary transition-colors"
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
         <CardFooter className="py-4 text-center text-xs text-muted-foreground border-t border-primary/10">
            {currentYear !== null ? <p>&copy; {currentYear} GeminiVision Studio. All rights reserved.</p> : <p>Loading copyright year...</p>}
        </CardFooter>
      </Card>
    </div>
  );
}
