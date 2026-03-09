/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Search, 
  LayoutDashboard,
  ArrowLeft,
  Star,
  Zap,
  Target,
  Quote,
  X,
  CheckCircle2,
  Download,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeResume, ResumeAnalysis } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import * as pdfjsLib from 'pdfjs-dist';

// Import worker using Vite's ?url suffix for correct asset resolution
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [jd, setJd] = useState('');
  const [resumes, setResumes] = useState<{ name: string; text: string; buffer?: ArrayBuffer }[]>([]);
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysis | null>(null);
  const [view, setView] = useState<'input' | 'results'>('input');

  const extractTextFromPDF = async (data: ArrayBuffer): Promise<string> => {
    // Use a slice to avoid detaching the original buffer
    const loadingTask = pdfjsLib.getDocument({ 
      data: data.slice(0),
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
    });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      
      if (file.type === 'application/pdf') {
        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          try {
            const text = await extractTextFromPDF(arrayBuffer);
            setResumes(prev => [...prev, { name: file.name, text, buffer: arrayBuffer }]);
          } catch (err) {
            console.error("Error parsing PDF:", err);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setResumes(prev => [...prev, { name: file.name, text }]);
        };
        reader.readAsText(file);
      }
    });
  };

  const startAnalysis = async () => {
    if (!jd || resumes.length === 0) return;
    setIsAnalyzing(true);
    setView('results');
    
    try {
      const results = await Promise.all(
        resumes.map(async (r) => {
          const analysis = await analyzeResume(jd, r.text, r.name);
          return { ...analysis, pdfBuffer: r.buffer };
        })
      );
      setAnalyses(results.sort((a, b) => b.score - a.score));
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const PDFPage = ({ pdf, pageNum, highlights }: { pdf: any; pageNum: number; highlights: ResumeAnalysis['highlights'] }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const textLayerRef = React.useRef<HTMLDivElement>(null);

    const [isRendering, setIsRendering] = useState(true);

    React.useEffect(() => {
      let renderTask: any = null;
      let isCancelled = false;

      const renderPage = async () => {
        if (!canvasRef.current || !textLayerRef.current) return;
        setIsRendering(true);

        try {
          const page = await pdf.getPage(pageNum);
          if (isCancelled) return;

          const viewport = page.getViewport({ scale: 1.5 }); // Reduced scale slightly for better performance/fit
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');

          if (!context) return;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          renderTask = page.render(renderContext);
          await renderTask.promise;
          
          if (isCancelled) return;

          // Render text layer
          const textContent = await page.getTextContent();
          if (isCancelled) return;

          textLayerRef.current.innerHTML = '';
          textLayerRef.current.style.height = `${viewport.height}px`;
          textLayerRef.current.style.width = `${viewport.width}px`;

          // In PDF.js v5+, use TextLayer class
          // @ts-ignore
          const textLayer = new pdfjsLib.TextLayer({
            textContentSource: textContent,
            container: textLayerRef.current,
            viewport: viewport,
          });
          
          await textLayer.render();
          if (isCancelled) return;

          // Apply highlights to the text layer using a more robust multi-span matching logic
          const textSpans = Array.from(textLayerRef.current.querySelectorAll('span'));
          const fullPageText = textSpans.map(s => s.textContent || '').join(' '); 
          const fullPageTextLower = fullPageText.toLowerCase();

          highlights.forEach(h => {
            const searchText = h.text.toLowerCase().trim();
            if (!searchText || searchText.length < 3) return;

            let startIndex = fullPageTextLower.indexOf(searchText);
            
            if (startIndex !== -1) {
              const endIndex = startIndex + searchText.length;
              let currentPos = 0;

              textSpans.forEach(span => {
                const spanText = (span.textContent || '') + ' '; 
                const spanStart = currentPos;
                const spanEnd = currentPos + spanText.length;

                if (spanStart < endIndex && spanEnd > startIndex) {
                  const typeClass = h.type === 'positive' ? 'bg-emerald-400/40' : h.type === 'negative' ? 'bg-rose-400/40' : 'bg-amber-400/40';
                  span.classList.add(typeClass, 'rounded-sm', 'cursor-help', 'group/highlight');
                  
                  if (!span.querySelector('.highlight-tooltip')) {
                    const tooltip = document.createElement('span');
                    tooltip.className = "highlight-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-zinc-900/95 text-white text-[12px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover/highlight:opacity-100 pointer-events-none transition-all duration-300 z-[100] leading-relaxed font-sans normal-case border border-white/10 backdrop-blur-2xl ring-1 ring-white/10";
                    tooltip.innerHTML = `
                      <div class="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                        <div class="w-2.5 h-2.5 rounded-full ${h.type === 'positive' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : h.type === 'negative' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}"></div>
                        <span class="font-black uppercase tracking-[0.2em] text-[10px] text-zinc-400">${h.type === 'positive' ? 'Strength' : h.type === 'negative' ? 'Gap' : 'Note'}</span>
                      </div>
                      <div class="text-zinc-200 font-medium">${h.reason}</div>
                      <div class="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900/95 rotate-45 border-r border-b border-white/10"></div>
                    `;
                    span.appendChild(tooltip);
                  }
                }
                currentPos = spanEnd;
              });
            }
          });
          setIsRendering(false);
        } catch (err: any) {
          if (err.name === 'RenderingCancelledException') {
            // Ignore cancellation errors
          } else {
            console.error('Error rendering page:', err);
          }
        }
      };

      renderPage();

      return () => {
        isCancelled = true;
        if (renderTask) {
          renderTask.cancel();
        }
      };
    }, [pdf, pageNum, highlights]);

    return (
      <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-white overflow-hidden rounded-sm ring-1 ring-white/5 mx-auto">
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/10 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3 px-4 py-2 bg-black/50 rounded-full border border-white/10">
              <div className="w-3 h-3 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Rendering Page...</span>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="block select-none" />
        <div 
          ref={textLayerRef} 
          className="absolute top-0 left-0 textLayer"
          style={{ 
            lineHeight: 1,
            opacity: 1,
          }} 
        />
      </div>
    );
  };

  const PDFDocument = ({ buffer, highlights }: { buffer: ArrayBuffer; highlights: ResumeAnalysis['highlights'] }) => {
    const [pdf, setPdf] = useState<any>(null);

    React.useEffect(() => {
      const loadPdf = async () => {
        // Use a slice to avoid detaching the original buffer
        const loadingTask = pdfjsLib.getDocument({ 
          data: buffer.slice(0),
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
        });
        const loadedPdf = await loadingTask.promise;
        setPdf(loadedPdf);
      };
      loadPdf();
    }, [buffer]);

    if (!pdf) return <div className="p-12 text-center text-zinc-500">Loading PDF...</div>;

    return (
      <div className="bg-zinc-900/50 p-12 overflow-auto max-h-[850px] rounded-3xl border border-white/5 shadow-inner custom-scrollbar">
        <div className="flex flex-col items-center gap-12 min-w-max">
          {Array.from({ length: pdf.numPages }, (_, i) => (
            <div key={i + 1} className="relative group/page">
              <div className="absolute -left-8 top-0 text-[10px] font-mono opacity-20 group-hover/page:opacity-100 transition-opacity">
                PAGE {i + 1}
              </div>
              <PDFPage pdf={pdf} pageNum={i + 1} highlights={highlights} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const HighlightedText = ({ analysis }: { analysis: ResumeAnalysis }) => {
    if (analysis.pdfBuffer) {
      return <PDFDocument buffer={analysis.pdfBuffer} highlights={analysis.highlights} />;
    }

    return (
      <div className="prose prose-sm max-w-none font-mono text-sm leading-relaxed whitespace-pre-wrap p-10 bg-white text-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 min-h-[800px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500/20" />
        {renderWithHighlights(analysis.fullText, analysis.highlights)}
      </div>
    );
  };

  const renderWithHighlights = (text: string, highlights: ResumeAnalysis['highlights']) => {
    if (!highlights.length) return text;

    const segments: { text: string; highlight?: ResumeAnalysis['highlights'][0] }[] = [];
    let lastIndex = 0;

    const sorted = [...highlights]
      .map(h => ({ ...h, index: text.indexOf(h.text) }))
      .filter(h => h.index !== -1)
      .sort((a, b) => a.index - b.index);

    sorted.forEach(h => {
      if (h.index > lastIndex) {
        segments.push({ text: text.substring(lastIndex, h.index) });
      }
      segments.push({ text: h.text, highlight: h });
      lastIndex = h.index + h.text.length;
    });

    if (lastIndex < text.length) {
      segments.push({ text: text.substring(lastIndex) });
    }

    return segments.map((s, i) => (
      <span 
        key={i} 
        className={cn(
          "relative group/highlight",
          s.highlight?.type === 'positive' && "bg-emerald-100 text-emerald-900 border-b-2 border-emerald-400 px-0.5 rounded-sm cursor-help",
          s.highlight?.type === 'negative' && "bg-rose-100 text-rose-900 border-b-2 border-rose-400 px-0.5 rounded-sm cursor-help",
          s.highlight?.type === 'neutral' && "bg-amber-100 text-amber-900 border-b-2 border-amber-400 px-0.5 rounded-sm cursor-help",
        )}
      >
        {s.text}
        {s.highlight && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/highlight:opacity-100 pointer-events-none transition-opacity z-50 leading-tight">
            <span className="font-bold block mb-1 uppercase tracking-tighter opacity-50">
              {s.highlight.type === 'positive' ? 'Strength' : s.highlight.type === 'negative' ? 'Gap' : 'Note'}
            </span>
            {s.highlight.reason}
          </span>
        )}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 text-black fill-black" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter">RESUME SCREENER <span className="text-emerald-500">PRO</span></h1>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">Enterprise AI Recruitment</div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-500">AI Engine Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {view === 'input' ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              {/* Left Column: Job Description */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <div className="w-4 h-[1px] bg-emerald-500" />
                    Step 01
                  </div>
                  <h2 className="text-4xl font-black tracking-tight">Job Description</h2>
                  <p className="text-zinc-500 text-sm leading-relaxed">Paste the target role requirements here for the AI to benchmark against.</p>
                </div>
                
                <div className="relative group">
                  <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="PASTE JOB DESCRIPTION HERE...

We are looking for a Senior AI Engineer to join our team. The ideal candidate has:
• 5+ years of experience in LLMs and RAG
• Proficiency in Python, PyTorch, and LangChain
• Strong background in Vector Databases (Pinecone, Weaviate)
• Experience deploying production-grade AI applications..."
                    className="w-full h-[450px] bg-zinc-900/30 border border-white/5 rounded-3xl p-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none font-mono text-sm leading-relaxed backdrop-blur-sm"
                  />
                  <div className="absolute top-4 right-4 p-2 bg-zinc-800/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Target className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>
              </div>

              {/* Right Column: Resume Upload */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <div className="w-4 h-[1px] bg-emerald-500" />
                    Step 02
                  </div>
                  <h2 className="text-4xl font-black tracking-tight">Resumes</h2>
                  <p className="text-zinc-500 text-sm leading-relaxed">Upload candidate resumes (PDF or TXT) to begin ranking.</p>
                </div>

                <label className="block">
                  <div className="border-2 border-dashed border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center gap-6 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-20 h-20 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
                      <Upload className="w-10 h-10 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="text-center relative z-10">
                      <p className="font-bold text-lg mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">PDF or TXT files only</p>
                    </div>
                    <input type="file" multiple accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" />
                  </div>
                </label>

                {resumes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Queue ({resumes.length})</h3>
                      <button 
                        onClick={() => setResumes([])}
                        className="text-[10px] font-black text-zinc-600 hover:text-rose-500 uppercase tracking-widest transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {resumes.map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-zinc-900/30 border border-white/5 rounded-2xl group hover:bg-zinc-900/50 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                              <FileText className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-sm font-bold truncate max-w-[200px]">{r.name}</span>
                          </div>
                          <button 
                            onClick={() => setResumes(prev => prev.filter((_, idx) => idx !== i))}
                            className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={startAnalysis}
                      disabled={!jd || resumes.length === 0}
                      className="w-full mt-8 py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-900 disabled:text-zinc-700 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 group uppercase tracking-widest text-sm"
                    >
                      <Zap className="w-5 h-5 fill-black group-hover:scale-125 transition-transform" />
                      Rank Candidates
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('input')}
                  className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">Back to Input</span>
                </button>
                <div className="text-sm text-zinc-500">
                  {isAnalyzing ? "Analyzing candidates..." : `Ranked ${analyses.length} candidates`}
                </div>
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-32 gap-8">
                  <div className="relative">
                    <div className="w-32 h-32 border-[6px] border-emerald-500/10 rounded-full" />
                    <div className="w-32 h-32 border-[6px] border-t-emerald-500 rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-10 h-10 text-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-black tracking-tight">AI is Screening...</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">Our neural engine is matching skills, experience, and potential against your requirements.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Results List */}
                  <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[850px] pr-2 custom-scrollbar">
                    {analyses.map((analysis, i) => (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedAnalysis(analysis)}
                        className={cn(
                          "p-6 rounded-2xl border cursor-pointer transition-all group relative overflow-hidden",
                          selectedAnalysis?.id === analysis.id 
                            ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20" 
                            : "bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-black/20"
                        )}
                      >
                        {selectedAnalysis?.id === analysis.id && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                        )}
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg group-hover:text-emerald-400 transition-colors truncate max-w-[140px]">{analysis.name}</h3>
                            <div className="flex items-center gap-2">
                              {analysis.score >= 80 ? (
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase tracking-wider rounded-md">Top Match</span>
                              ) : analysis.score >= 60 ? (
                                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[9px] font-bold uppercase tracking-wider rounded-md">Potential</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-[9px] font-bold uppercase tracking-wider rounded-md">Low Match</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-emerald-500 tracking-tighter">{analysis.score}%</div>
                            <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Score</div>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2 italic">"{analysis.summary}"</p>
                        
                        {selectedAnalysis?.id === analysis.id && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Detail View */}
                  <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                      {selectedAnalysis ? (
                        <motion.div
                          key={selectedAnalysis.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden"
                        >
                          {/* Detail Header */}
                          <div className="p-10 border-b border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                            <div className="flex items-start justify-between mb-8">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <h2 className="text-4xl font-black tracking-tight">{selectedAnalysis.name}</h2>
                                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Verified Match</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-2 text-emerald-500">
                                    <div className="p-1 bg-emerald-500/10 rounded-md">
                                      <Star className="w-4 h-4 fill-emerald-500" />
                                    </div>
                                    <span className="text-lg font-black tracking-tighter">{selectedAnalysis.score}<span className="text-xs opacity-50 ml-0.5">/100</span></span>
                                  </div>
                                  <div className="h-4 w-px bg-white/10" />
                                  <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                    AI Analysis Complete
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-white/5">
                                  <Download className="w-3.5 h-3.5" />
                                  DOWNLOAD PDF
                                </button>
                                <button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  SHORTLIST
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-6 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl space-y-3 group/card hover:bg-emerald-500/[0.05] transition-all duration-300">
                                <div className="flex items-center justify-between">
                                  <div className="text-[10px] text-emerald-500 uppercase font-black tracking-[0.2em]">Strengths</div>
                                  <div className="p-2 bg-emerald-500/10 rounded-xl group-hover/card:scale-110 transition-transform">
                                    <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                                  </div>
                                </div>
                                <div className="text-4xl font-black tracking-tighter text-emerald-500">
                                  {selectedAnalysis.highlights.filter(h => h.type === 'positive').length}
                                </div>
                              </div>
                              <div className="p-6 bg-rose-500/[0.02] border border-rose-500/10 rounded-3xl space-y-3 group/card hover:bg-rose-500/[0.05] transition-all duration-300">
                                <div className="flex items-center justify-between">
                                  <div className="text-[10px] text-rose-500 uppercase font-black tracking-[0.2em]">Gaps</div>
                                  <div className="p-2 bg-rose-500/10 rounded-xl group-hover/card:scale-110 transition-transform">
                                    <AlertCircle className="w-4 h-4 text-rose-500 fill-rose-500" />
                                  </div>
                                </div>
                                <div className="text-4xl font-black tracking-tighter text-rose-500">
                                  {selectedAnalysis.highlights.filter(h => h.type === 'negative').length}
                                </div>
                              </div>
                              <div className="p-6 bg-amber-500/[0.02] border border-amber-500/10 rounded-3xl space-y-3 group/card hover:bg-amber-500/[0.05] transition-all duration-300">
                                <div className="flex items-center justify-between">
                                  <div className="text-[10px] text-amber-500 uppercase font-black tracking-[0.2em]">Neutral</div>
                                  <div className="p-2 bg-amber-500/10 rounded-xl group-hover/card:scale-110 transition-transform">
                                    <Info className="w-4 h-4 text-amber-500 fill-amber-500" />
                                  </div>
                                </div>
                                <div className="text-4xl font-black tracking-tighter text-amber-500">
                                  {selectedAnalysis.highlights.filter(h => h.type === 'neutral').length}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Resume Content with Highlights */}
                          <div className="p-8">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                  <FileText className="w-4 h-4 text-emerald-500" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Enhanced CV View</h3>
                              </div>
                              <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                  Match
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                  Gap
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                  Note
                                </div>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <HighlightedText analysis={selectedAnalysis} />
                            </div>
                          </div>

                          {/* Summary Section */}
                          <div className="p-10 bg-white/[0.03] border-t border-white/5">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-zinc-800 rounded-lg">
                                <Search className="w-4 h-4 text-zinc-400" />
                              </div>
                              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">AI Executive Summary</h3>
                            </div>
                            <div className="relative">
                              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-emerald-500/10" />
                              <p className="text-zinc-300 leading-relaxed italic text-lg pl-6 border-l-2 border-emerald-500/20">
                                "{selectedAnalysis.summary}"
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-20 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01] group">
                          <div className="w-24 h-24 bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/5">
                            <Search className="w-10 h-10 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                          </div>
                          <h3 className="text-2xl font-black text-zinc-400 tracking-tight mb-4">Select a Candidate</h3>
                          <p className="text-zinc-600 max-w-xs mx-auto leading-relaxed text-sm">
                            Click on any ranked candidate on the left to see their detailed match report and highlighted resume.
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
