/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

//Vibe coded by ammaar@google.com

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { Artifact, Session, ComponentVariation, LayoutOption } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import { generateId, computeDiffLines } from './utils';

import DottedGlowBackground from './components/DottedGlowBackground';
import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import { 
    ThinkingIcon, 
    CodeIcon, 
    SparklesIcon, 
    ArrowLeftIcon, 
    ArrowRightIcon, 
    ArrowUpIcon, 
    GridIcon 
} from './components/Icons';

// --- Simple Icons for the Toolbar ---
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>;
const TerminalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>;

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);
  
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<'idle' | 'planning' | 'executing'>('idle');
  
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholders, setPlaceholders] = useState<string[]>(INITIAL_PLACEHOLDERS);
  
  // Workshop State
  const [showPreview, setShowPreview] = useState(true);
  const [showAiBar, setShowAiBar] = useState(true);
  
  // Two types of highlighting:
  // 1. Pending: Lines identified by AI in Phase 1 (Orange/Yellow)
  // 2. Completed: Actual diffs after Phase 2 (Green)
  const [pendingHighlights, setPendingHighlights] = useState<number[]>([]);
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);
  
  const [editorRatio, setEditorRatio] = useState(0.5); 
  const [isResizing, setIsResizing] = useState(false);
  
  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | 'variations' | null;
      title: string;
      data: any; 
  }>({ isOpen: false, mode: null, title: '', data: null });

  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const workshopBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (focusedArtifactIndex === null) {
          inputRef.current?.focus();
      }
  }, [focusedArtifactIndex]);

  // Handle Resize Logic
  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isResizing || !workshopBodyRef.current) return;
          const rect = workshopBodyRef.current.getBoundingClientRect();
          const newRatio = (e.clientX - rect.left) / rect.width;
          setEditorRatio(Math.max(0.2, Math.min(0.8, newRatio)));
      };

      const handleMouseUp = () => {
          setIsResizing(false);
      };

      if (isResizing) {
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isResizing]);

  // Cycle placeholders
  useEffect(() => {
      const interval = setInterval(() => {
          setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
      }, 3000);
      return () => clearInterval(interval);
  }, [placeholders.length]);

  // Dynamic placeholder generation on load
  useEffect(() => {
      const fetchDynamicPlaceholders = async () => {
          try {
              const apiKey = process.env.API_KEY;
              if (!apiKey) return;
              const ai = new GoogleGenAI({ apiKey });
              const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: { 
                      role: 'user', 
                      parts: [{ 
                          text: 'Generate 20 creative, short, diverse UI component prompts. Return ONLY a raw JSON array of strings.' 
                      }] 
                  }
              });
              const text = response.text || '[]';
              const jsonMatch = text.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                  const newPlaceholders = JSON.parse(jsonMatch[0]);
                  if (Array.isArray(newPlaceholders) && newPlaceholders.length > 0) {
                      const shuffled = newPlaceholders.sort(() => 0.5 - Math.random()).slice(0, 10);
                      setPlaceholders(prev => [...prev, ...shuffled]);
                  }
              }
          } catch (e) {
              console.warn("Silently failed to fetch dynamic placeholders", e);
          }
      };
      setTimeout(fetchDynamicPlaceholders, 1000);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCode = e.target.value;
      if (focusedArtifactIndex !== null && currentSessionIndex !== -1) {
          setSessions(prev => prev.map((sess, i) => 
            i === currentSessionIndex ? {
                ...sess,
                artifacts: sess.artifacts.map((art, j) => 
                    j === focusedArtifactIndex ? { ...art, html: newCode } : art
                )
            } : sess
        ));
      }
  };

  const handleEditorScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  };

  const parseJsonStream = async function* (responseStream: AsyncGenerator<{ text: string }>) {
      let buffer = '';
      for await (const chunk of responseStream) {
          const text = chunk.text;
          if (typeof text !== 'string') continue;
          buffer += text;
          let braceCount = 0;
          let start = buffer.indexOf('{');
          while (start !== -1) {
              braceCount = 0;
              let end = -1;
              for (let i = start; i < buffer.length; i++) {
                  if (buffer[i] === '{') braceCount++;
                  else if (buffer[i] === '}') braceCount--;
                  if (braceCount === 0 && i > start) {
                      end = i;
                      break;
                  }
              }
              if (end !== -1) {
                  const jsonString = buffer.substring(start, end + 1);
                  try {
                      yield JSON.parse(jsonString);
                      buffer = buffer.substring(end + 1);
                      start = buffer.indexOf('{');
                  } catch (e) {
                      start = buffer.indexOf('{', start + 1);
                  }
              } else {
                  break; 
              }
          }
      }
  };

  const handleGenerateVariations = useCallback(async () => {
    const currentSession = sessions[currentSessionIndex];
    if (!currentSession || focusedArtifactIndex === null) return;
    const currentArtifact = currentSession.artifacts[focusedArtifactIndex];

    setIsLoading(true);
    setLoadingPhase('executing');
    setComponentVariations([]);
    setDrawerState({ isOpen: true, mode: 'variations', title: 'Variations', data: currentArtifact.id });

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY is not configured.");
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
You are a master UI/UX designer. Generate 3 RADICAL CONCEPTUAL VARIATIONS of: "${currentSession.prompt}".
STRICT IP SAFEGUARD: No names of artists. 
Required JSON Output Format (stream ONE object per line):
\`{ "name": "Persona Name", "html": "..." }\`
        `.trim();

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
             contents: [{ parts: [{ text: prompt }], role: 'user' }],
             config: { temperature: 1.2 }
        });

        for await (const variation of parseJsonStream(responseStream)) {
            if (variation.name && variation.html) {
                setComponentVariations(prev => [...prev, variation]);
            }
        }
    } catch (e: any) {
        console.error("Error generating variations:", e);
    } finally {
        setIsLoading(false);
        setLoadingPhase('idle');
    }
  }, [sessions, currentSessionIndex, focusedArtifactIndex]);

  const applyVariation = (html: string) => {
      if (focusedArtifactIndex === null) return;
      setSessions(prev => prev.map((sess, i) => 
          i === currentSessionIndex ? {
              ...sess,
              artifacts: sess.artifacts.map((art, j) => 
                j === focusedArtifactIndex ? { ...art, html, status: 'complete' } : art
              )
          } : sess
      ));
      setDrawerState(s => ({ ...s, isOpen: false }));
  };

  const handleModifyArtifact = useCallback(async (instruction: string) => {
    const currentSession = sessions[currentSessionIndex];
    if (!currentSession || focusedArtifactIndex === null) return;
    
    const artifactIndex = focusedArtifactIndex;
    const artifact = currentSession.artifacts[artifactIndex];
    const originalHtml = artifact.html;
    
    // Reset visual states
    setPendingHighlights([]); 
    setHighlightedLines([]);
    setIsLoading(true);

    const apiKey = process.env.API_KEY;
    if (!apiKey) return;
    const ai = new GoogleGenAI({ apiKey });

    // --- PHASE 1: PLANNING (Identification) ---
    setLoadingPhase('planning');
    
    try {
        // Add line numbers to code for the LLM to reference
        const numberedLines = originalHtml.split('\n').map((line, idx) => `${idx + 1}: ${line}`).join('\n');

        const planningPrompt = `
You are a Code Analyst.
I will provide an HTML file with line numbers and a modification request.
Identify WHICH lines need to be changed or where new lines need to be inserted.

**CODE:**
${numberedLines}

**REQUEST:**
"${instruction}"

**TASK:**
Return a JSON Object with a single key "lines" containing an array of line numbers (integers) that are targeted for modification.
Example: { "lines": [12, 13, 14, 45] }
        `.trim();

        const planResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: planningPrompt }], role: 'user' }],
            config: { responseMimeType: 'application/json' }
        });

        const planText = planResponse.text || "{}";
        const planJson = JSON.parse(planText);
        
        if (planJson.lines && Array.isArray(planJson.lines)) {
            setPendingHighlights(planJson.lines);
        }

        // Small artificial delay to let the user see the "Planning" highlights (Orange)
        await new Promise(r => setTimeout(r, 800));

        // --- PHASE 2: EXECUTION (Application) ---
        setLoadingPhase('executing');

        const execPrompt = `
You are a SURGICAL CODE EDITOR. 
The user wants to MODIFY a specific part of an existing HTML/CSS component.

**CONTEXT:**
You must preserve the original "spirit", layout, and logic of the code. 
Only change what is strictly necessary to fulfill the modification request.

**ORIGINAL CODE:**
${originalHtml}

**MODIFICATION INSTRUCTION:**
"${instruction}"

**STRICT RULES:**
1. Apply the modification.
2. PRESERVE strictly the existing integrity of the file.
3. Return the FULL, VALID, EXECUTABLE HTML string.
4. Output ONLY raw HTML. No markdown fences.
        `.trim();

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: execPrompt }], role: 'user' }],
            config: { temperature: 0.2 }
        });

        let accumulatedHtml = '';
        for await (const chunk of responseStream) {
            const text = chunk.text;
            if (typeof text === 'string') {
                accumulatedHtml += text;
                setSessions(prev => prev.map((sess, i) => 
                    i === currentSessionIndex ? {
                        ...sess,
                        artifacts: sess.artifacts.map((art, j) => 
                            j === artifactIndex ? { ...art, html: accumulatedHtml, status: 'streaming' } : art
                        )
                    } : sess
                ));
            }
        }

        let finalHtml = accumulatedHtml.trim();
        if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
        if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
        if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

        // Calculate Diff properly
        const diffs = computeDiffLines(originalHtml, finalHtml);
        
        // Transition: Clear pending, show actual diffs (Green)
        setPendingHighlights([]); 
        setHighlightedLines(diffs);

        setSessions(prev => prev.map((sess, i) => 
            i === currentSessionIndex ? {
                ...sess,
                artifacts: sess.artifacts.map((art, j) => 
                    j === artifactIndex ? { ...art, html: finalHtml, status: 'complete' } : art
                )
            } : sess
        ));

    } catch (e: any) {
        console.error("Modification failed", e);
        setSessions(prev => prev.map((sess, i) => 
            i === currentSessionIndex ? {
                ...sess,
                artifacts: sess.artifacts.map((art, j) => 
                    j === artifactIndex ? { ...art, html: originalHtml, status: 'complete' } : art 
                )
            } : sess
        ));
    } finally {
        setIsLoading(false);
        setLoadingPhase('idle');
        if (showAiBar) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }
  }, [sessions, currentSessionIndex, focusedArtifactIndex, showAiBar]);

  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const promptToUse = manualPrompt || inputValue;
    const trimmedInput = promptToUse.trim();
    if (!trimmedInput || isLoading) return;
    
    if (!manualPrompt) setInputValue('');

    if (focusedArtifactIndex !== null) {
        await handleModifyArtifact(trimmedInput);
        return;
    }

    setIsLoading(true);
    setLoadingPhase('executing');
    const baseTime = Date.now();
    const sessionId = generateId();

    const placeholderArtifacts: Artifact[] = Array(3).fill(null).map((_, i) => ({
        id: `${sessionId}_${i}`,
        styleName: 'Designing...',
        html: '',
        status: 'streaming',
    }));

    const newSession: Session = {
        id: sessionId,
        prompt: trimmedInput,
        timestamp: baseTime,
        artifacts: placeholderArtifacts
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionIndex(sessions.length); 
    setFocusedArtifactIndex(null); 

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY is not configured.");
        const ai = new GoogleGenAI({ apiKey });

        const stylePrompt = `
Generate 3 distinct, highly evocative design directions for: "${trimmedInput}".
IP SAFEGUARD: Never use artist or brand names.
GOAL: Return ONLY a raw JSON array of 3 *NEW* creative names.
        `.trim();

        const styleResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { role: 'user', parts: [{ text: stylePrompt }] }
        });

        let generatedStyles: string[] = [];
        const styleText = styleResponse.text || '[]';
        const jsonMatch = styleText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            try { generatedStyles = JSON.parse(jsonMatch[0]); } catch (e) {}
        }
        if (!generatedStyles || generatedStyles.length < 3) {
            generatedStyles = ["Direction 1", "Direction 2", "Direction 3"];
        }
        
        setSessions(prev => prev.map(s => {
            if (s.id !== sessionId) return s;
            return {
                ...s,
                artifacts: s.artifacts.map((art, i) => ({ ...art, styleName: generatedStyles[i] }))
            };
        }));

        const generateArtifact = async (artifact: Artifact, styleInstruction: string) => {
            try {
                const prompt = `
You are Flash UI. Create a stunning, high-fidelity UI component for: "${trimmedInput}".
CONCEPTUAL DIRECTION: ${styleInstruction}
Return ONLY RAW HTML.
          `.trim();
          
                const responseStream = await ai.models.generateContentStream({
                    model: 'gemini-3-flash-preview',
                    contents: [{ parts: [{ text: prompt }], role: "user" }],
                });

                let accumulatedHtml = '';
                for await (const chunk of responseStream) {
                    const text = chunk.text;
                    if (typeof text === 'string') {
                        accumulatedHtml += text;
                        setSessions(prev => prev.map(sess => 
                            sess.id === sessionId ? {
                                ...sess,
                                artifacts: sess.artifacts.map(art => 
                                    art.id === artifact.id ? { ...art, html: accumulatedHtml } : art
                                )
                            } : sess
                        ));
                    }
                }
                
                let finalHtml = accumulatedHtml.trim();
                if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
                if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
                if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

                setSessions(prev => prev.map(sess => 
                    sess.id === sessionId ? {
                        ...sess,
                        artifacts: sess.artifacts.map(art => 
                            art.id === artifact.id ? { ...art, html: finalHtml, status: finalHtml ? 'complete' : 'error' } : art
                        )
                    } : sess
                ));

            } catch (e: any) {
                setSessions(prev => prev.map(sess => 
                    sess.id === sessionId ? {
                        ...sess,
                        artifacts: sess.artifacts.map(art => 
                            art.id === artifact.id ? { ...art, html: `Error: ${e.message}`, status: 'error' } : art
                        )
                    } : sess
                ));
            }
        };

        await Promise.all(placeholderArtifacts.map((art, i) => generateArtifact(art, generatedStyles[i])));

    } catch (e) {
        console.error("Fatal error", e);
    } finally {
        setIsLoading(false);
        setLoadingPhase('idle');
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputValue, isLoading, sessions.length, focusedArtifactIndex, handleModifyArtifact]);

  const handleSurpriseMe = () => {
      const currentPrompt = placeholders[placeholderIndex];
      setInputValue(currentPrompt);
      handleSendMessage(currentPrompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Tab' && !inputValue && !isLoading) {
        event.preventDefault();
        setInputValue(placeholders[placeholderIndex]);
    }
  };

  const hasStarted = sessions.length > 0 || isLoading;
  const currentSession = sessions[currentSessionIndex];
  const isEditing = focusedArtifactIndex !== null;
  const activeArtifact = isEditing && currentSession ? currentSession.artifacts[focusedArtifactIndex] : null;

  const renderWorkshop = () => {
      if (!activeArtifact) return null;
      
      const lines = activeArtifact.html.split('\n');

      return (
          <div className="workshop-container">
              <div className="workshop-toolbar">
                  <div className="toolbar-left">
                     <button className="back-btn" onClick={() => setFocusedArtifactIndex(null)}>
                         <ArrowLeftIcon /> Back to Grid
                     </button>
                     <span className="file-name">{activeArtifact.styleName}.html</span>
                  </div>
                  <div className="toolbar-right">
                      <label className="toggle-label">
                          <input type="checkbox" checked={showAiBar} onChange={e => setShowAiBar(e.target.checked)} />
                          <span className="toggle-custom">{showAiBar ? <TerminalIcon /> : <TerminalIcon />} AI Console</span>
                      </label>
                      <label className="toggle-label">
                          <input type="checkbox" checked={showPreview} onChange={e => setShowPreview(e.target.checked)} />
                          <span className="toggle-custom">{showPreview ? <EyeIcon /> : <EyeOffIcon />} Preview</span>
                      </label>
                      <button className="toolbar-btn" onClick={handleGenerateVariations} disabled={isLoading}>
                          <SparklesIcon /> Variations
                      </button>
                  </div>
              </div>

              <div className="workshop-body" ref={workshopBodyRef}>
                  <div className="editor-pane" style={{ width: showPreview ? `${editorRatio * 100}%` : '100%' }}>
                      <div className="editor-gutter" ref={gutterRef}>
                          {lines.map((_, i) => (
                              <div key={i} className={`line-number 
                                  ${highlightedLines.includes(i + 1) ? 'highlight-num' : ''}
                                  ${pendingHighlights.includes(i + 1) ? 'pending-num' : ''}
                              `}>
                                  {i + 1}
                              </div>
                          ))}
                      </div>
                      
                      {/* Unified Scroll Container */}
                      <div className="editor-content-wrapper" onScroll={handleEditorScroll}>
                         <div className="code-layer-container">
                            {/* Highlights Layer */}
                            <div className="code-highlights" aria-hidden="true">
                                {lines.map((line, i) => (
                                    <div key={i} className={`code-line 
                                        ${highlightedLines.includes(i + 1) ? 'highlighted' : ''}
                                        ${pendingHighlights.includes(i + 1) ? 'pending' : ''}
                                    `}>
                                        {line || ' '}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Input Layer */}
                            <textarea
                                className="code-textarea"
                                value={activeArtifact.html}
                                onChange={handleCodeChange}
                                spellCheck={false}
                            />
                         </div>
                      </div>
                  </div>

                  {showPreview && (
                    <>
                      <div className="resizer" onMouseDown={handleMouseDown} />
                      <div className="preview-pane" style={{ flex: 1 }}>
                          <iframe 
                            srcDoc={activeArtifact.html} 
                            title="preview"
                            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
                          />
                      </div>
                    </>
                  )}
              </div>
          </div>
      );
  };

  const getStatusLabel = () => {
      if (!isLoading) return currentSession?.prompt;
      if (loadingPhase === 'planning') return "Analyzing code structure...";
      if (loadingPhase === 'executing') return "Applying surgical changes...";
      return "Processing...";
  };

  return (
    <>
        <SideDrawer 
            isOpen={drawerState.isOpen} 
            onClose={() => setDrawerState(s => ({...s, isOpen: false}))} 
            title={drawerState.title}
        >
             {drawerState.mode === 'variations' && (
                <div className="sexy-grid">
                    {componentVariations.length === 0 && isLoading ? (
                        <div style={{padding: 20, textAlign: 'center', color: '#666'}}>Generating variations...</div>
                    ) : (
                        componentVariations.map((v, i) => (
                             <div key={i} className="sexy-card" onClick={() => applyVariation(v.html)}>
                                 <div className="sexy-preview">
                                     <iframe srcDoc={v.html} title={v.name} sandbox="allow-scripts allow-same-origin" />
                                 </div>
                                 <div className="sexy-label">{v.name}</div>
                             </div>
                        ))
                    )}
                </div>
            )}
            {drawerState.mode === 'code' && (
                 <pre className="code-block"><code>{drawerState.data}</code></pre>
            )}
        </SideDrawer>

        {isEditing ? renderWorkshop() : (
            <div className="immersive-app">
                <a href="https://x.com/ammaar" target="_blank" rel="noreferrer" className={`creator-credit ${hasStarted ? 'hide-on-mobile' : ''}`}>
                    created by @ammaar
                </a>
                
                <DottedGlowBackground 
                    gap={24} radius={1.5} color="rgba(255, 255, 255, 0.02)" glowColor="rgba(255, 255, 255, 0.15)" speedScale={0.5} 
                />

                <div className="stage-container">
                    <div className={`empty-state ${hasStarted ? 'fade-out' : ''}`}>
                        <div className="empty-content">
                            <h1>Flash UI</h1>
                            <p>Creative UI generation in a flash</p>
                            <button className="surprise-button" onClick={handleSurpriseMe} disabled={isLoading}>
                                <SparklesIcon /> Surprise Me
                            </button>
                        </div>
                    </div>

                    {sessions.map((session, sIndex) => {
                        let positionClass = 'hidden';
                        if (sIndex === currentSessionIndex) positionClass = 'active-session';
                        else if (sIndex < currentSessionIndex) positionClass = 'past-session';
                        else if (sIndex > currentSessionIndex) positionClass = 'future-session';
                        
                        return (
                            <div key={session.id} className={`session-group ${positionClass}`}>
                                <div className="artifact-grid" ref={sIndex === currentSessionIndex ? gridScrollRef : null}>
                                    {session.artifacts.map((artifact, aIndex) => (
                                        <ArtifactCard 
                                            key={artifact.id}
                                            artifact={artifact}
                                            isFocused={false} // Always grid view card here
                                            onClick={() => setFocusedArtifactIndex(aIndex)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {(!isEditing || showAiBar) && (
            <div className={`floating-input-container ${isEditing ? 'workshop-mode' : ''}`}>
                <div className={`input-wrapper ${isLoading ? 'loading' : ''}`}>
                    {(!inputValue && !isLoading) && (
                        <div className="animated-placeholder" key={isEditing ? 'edit' : placeholderIndex}>
                             <span className="placeholder-text">
                                {isEditing ? "Modify code (e.g. 'change bg to red')..." : placeholders[placeholderIndex]}
                            </span>
                            {!isEditing && <span className="tab-hint">Tab</span>}
                        </div>
                    )}
                    {!isLoading ? (
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={inputValue} 
                            onChange={handleInputChange} 
                            onKeyDown={handleKeyDown} 
                            disabled={isLoading} 
                        />
                    ) : (
                        <div className="input-generating-label">
                            <span className="generating-prompt-text">
                                {getStatusLabel()}
                            </span>
                            <ThinkingIcon />
                        </div>
                    )}
                    <button className="send-button" onClick={() => handleSendMessage()} disabled={isLoading || !inputValue.trim()}>
                        <ArrowUpIcon />
                    </button>
                </div>
            </div>
        )}
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}