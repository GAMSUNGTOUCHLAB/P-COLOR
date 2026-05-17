import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Camera, Sparkles, RefreshCw, CheckCircle2, AlertCircle, ChevronRight, Info, Palette } from 'lucide-react';

interface AnalysisResult {
  disclaimer: string;
  summary: string;
  tone_direction: 'warm' | 'cool' | 'neutral';
  season_type: string;
  sub_type: string;
  confidence: number;
  analysis: {
    skin_tone: string;
    brightness: string;
    saturation: string;
    contrast: string;
    overall_impression: string;
  };
  recommended_colors: Array<{ name: string; hex: string; reason: string }>;
  avoid_colors: Array<{ name: string; hex: string; reason: string }>;
  makeup_recommendations: {
    lip: string[];
    blush: string[];
    eyeshadow: string[];
  };
  hair_recommendations: string[];
  fashion_recommendations: string[];
  style_tip: string;
  photo_quality_note: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeColor = async () => {
    if (!image) return;

    setAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: image }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-neutral-100 h-16 flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white">
            <Palette size={20} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Color Palette AI</span>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!result && !analyzing ? (
            <motion.section
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center gap-8 py-12"
            >
              <div className="max-w-2xl flex flex-col gap-4">
                <h1 className="font-display text-5xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
                  Discover your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Perfect Palette</span>
                </h1>
                <p className="text-neutral-500 text-lg md:text-xl font-light">
                  Upload a photo to see which colors make you shine. Our AI analyzes your skin tone, features, and contrast to find your personal color.
                </p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative w-full max-w-xl aspect-square md:aspect-[16/9] rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
                  ${image ? 'border-indigo-500 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300 bg-white shadow-sm hover:shadow-md'}
                `}
              >
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400">
                      <Camera size={32} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-700">Click or drag photo here</span>
                      <span className="text-neutral-400 text-sm">Best with natural lighting, no makeup</span>
                    </div>
                  </div>
                )}
              </div>

              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="flex gap-4">
                <button
                  disabled={!image}
                  onClick={analyzeColor}
                  className={`
                    px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 transition-all
                    ${image 
                      ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg hover:shadow-indigo-500/20 active:scale-95' 
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}
                  `}
                >
                  <Sparkles size={20} />
                  Start Analysis
                </button>
                {image && (
                  <button
                    onClick={() => setImage(null)}
                    className="px-8 py-4 rounded-2xl font-bold text-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  >
                    Change Photo
                  </button>
                )}
              </div>
            </motion.section>
          ) : analyzing ? (
            <motion.section
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-12 py-32"
            >
              <div className="relative">
                <motion.div 
                  className="w-32 h-32 rounded-full border-4 border-indigo-100 border-t-indigo-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center text-indigo-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles size={40} />
                </motion.div>
              </div>
              <div className="text-center flex flex-col gap-2">
                <h2 className="font-display text-3xl font-bold">Analyzing your features...</h2>
                <p className="text-neutral-500">Checking skin undertones and contrast levels</p>
              </div>
            </motion.section>
          ) : result && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row gap-6 h-full min-h-[700px]"
            >
              {/* Left Column: Image & Analysis Details */}
              <div className="flex flex-col lg:w-[38%] gap-4">
                {/* Profile Container */}
                <div className="bg-white border border-[#E5E1DA] rounded-2xl overflow-hidden flex-1 relative shadow-sm min-h-[300px] lg:min-h-0">
                  <div className="absolute inset-0 bg-[#E8E8E8] flex items-center justify-center overflow-hidden">
                    {image ? (
                      <img src={image} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={48} className="text-[#C4C1BC]" />
                    )}
                    {/* Visual Overlays for AI feel */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-[35%] left-[45%] w-3 h-3 bg-white/80 border border-white rounded-full ring-4 ring-blue-400/30"></div>
                      <div className="absolute top-[55%] left-[55%] w-3 h-3 bg-white/80 border border-white rounded-full ring-4 ring-pink-400/30"></div>
                      <div className="absolute top-[48%] left-[40%] w-3 h-3 bg-white/80 border border-white rounded-full ring-4 ring-yellow-400/30"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">Analysis Subject</p>
                    <p className="text-lg font-medium">Capture Session</p>
                  </div>
                </div>

                {/* Metrics Panel */}
                <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#8A8681]">Tone Analysis</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-neutral-500">Skin Brightness</span>
                        <span className="font-semibold text-neutral-800">{result.analysis.brightness.split(' ')[0]}</span>
                      </div>
                      <div className="h-1.5 bg-[#F0EFEC] rounded-full overflow-hidden">
                        <div className="h-full bg-[#E5D1B8] w-[75%] rounded-full"></div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-neutral-500">Hue Index</span>
                        <span className="font-semibold text-neutral-800 uppercase text-[10px]">{result.tone_direction}</span>
                      </div>
                      <div className="h-1.5 bg-[#F0EFEC] rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-orange-200 via-gray-200 to-blue-200 w-[50%] transition-all duration-1000 ${result.tone_direction === 'warm' ? 'ml-0' : result.tone_direction === 'cool' ? 'ml-[50%]' : 'ml-[25%]'}`}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-neutral-500">Contrast Ratio</span>
                        <span className="font-semibold text-neutral-800">{result.analysis.contrast.split(' ')[0]}</span>
                      </div>
                      <div className="h-1.5 bg-[#F0EFEC] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A8A4A0] w-[45%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={reset}
                  className="w-full py-4 bg-white border border-[#E5E1DA] text-neutral-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-neutral-50 active:scale-95 shadow-sm mt-auto"
                >
                  <RefreshCw size={16} />
                  New Analysis
                </button>
              </div>

              {/* Right Column: Results & Recommendations */}
              <div className="flex flex-col lg:w-[62%] gap-4">
                {/* Header / Main Result */}
                <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] text-[10px] font-bold rounded-full uppercase tracking-tighter">Personal Diagnosis</span>
                      <h1 className="text-4xl font-serif mt-3 italic text-[#2D2D2D]">{result.season_type}</h1>
                      <p className="text-neutral-600 font-medium text-sm mt-1">{result.sub_type}</p>
                      <p className="text-[#717171] mt-3 text-sm italic max-w-lg leading-relaxed">
                        "{result.summary}"
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#A8A4A0] uppercase tracking-widest font-semibold">Confidence</p>
                      <p className="text-3xl font-light text-[#2D2D2D]">{result.confidence || '88'}%</p>
                    </div>
                  </div>
                </div>

                {/* Color Palettes & Kit Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  {/* Best Colors Selection */}
                  <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 shadow-sm flex flex-col h-full">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Best Selection
                    </h3>
                    <div className="grid grid-cols-4 gap-2.5">
                      {result.recommended_colors.slice(0, 8).map((color, idx) => (
                        <div key={idx} className="space-y-1.5 flex flex-col items-center">
                          <div 
                            className="w-full aspect-square rounded-lg shadow-inner ring-1 ring-black/5"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-[9px] text-neutral-400 font-medium line-clamp-1">{color.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-neutral-50">
                      <p className="text-[11px] leading-relaxed text-[#666] font-light">
                        {result.analysis.overall_impression.split('.')[0]}. These tones harmonize with your natural contrast, creating a balanced and radiant appearance.
                      </p>
                    </div>
                  </div>

                  {/* Styling Kit */}
                  <div className="bg-[#f8f9fb] border border-[#E5E1DA] rounded-2xl p-5 flex flex-col gap-5">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Styling Kit</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-500 shrink-0">
                          <Palette size={14} />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Lip & Blush</p>
                          <p className="text-xs text-neutral-700 font-medium">
                            {result.makeup_recommendations.lip.slice(0, 1).join(', ')}, {result.makeup_recommendations.blush.slice(0, 1).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-500 shrink-0">
                          <Camera size={14} />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Hair Color</p>
                          <p className="text-xs text-neutral-700 font-medium">
                            {result.hair_recommendations.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-50 border-2 border-white shadow-sm flex items-center justify-center text-teal-600 shrink-0">
                          <Info size={14} />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Fashion Tip</p>
                          <p className="text-xs text-neutral-700 font-medium">{result.style_tip.split('.')[0]}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">Avoid Colors</h4>
                      <div className="flex gap-2">
                        {result.avoid_colors.slice(0, 5).map((color, idx) => (
                          <div 
                            key={idx}
                            title={color.name}
                            className="w-6 h-6 rounded bg-neutral-200 ring-1 ring-black/5 hover:ring-red-400 transition-all cursor-help"
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclaimer Footer */}
                <div className="mt-auto pt-4 border-t border-[#E5E1DA] flex flex-col md:flex-row justify-between items-center gap-2">
                  <p className="text-[10px] text-[#A8A4A0] font-medium tracking-tight">© 2026 COLOR PALETTE AI ENGINE</p>
                  <p className="text-[10px] text-[#A8A4A0] md:text-right italic md:max-w-xs leading-tight">
                    * {result.disclaimer}
                  </p>
                </div>
              </div>
            </motion.section>
          )
}
        </AnimatePresence>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 border-solid rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">Dismiss</button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-neutral-100 border-solid">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-neutral-400 text-sm">
          <p>© 2026 Color Palette AI. Powered by Gemini.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-neutral-600">Methodology</a>
            <a href="#" className="hover:text-neutral-600">Privacy</a>
            <a href="#" className="hover:text-neutral-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
