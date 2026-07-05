import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Target, 
  Map, 
  Calendar as CalendarIcon, 
  Search, 
  Send, 
  Wand2, 
  CheckCircle2, 
  ChevronRight,
  Lightbulb,
  Rocket,
  Zap,
  Crosshair,
  Upload
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from '../motion-shim';

export const StrategyPage: React.FC = () => {
  const { addToast, currentIdentity } = useApp();
  
  // View states
  const [activeTab, setActiveTab] = useState('onboarding');
  const [artifactTab, setArtifactTab] = useState('strategy');

  // Intelligent Onboarding
  const [dnaForm, setDnaForm] = useState({ brandName: '', industry: '', mission: '', audience: '', goals: '' });
  const [documentFile, setDocumentFile] = useState<{name: string, base64: string, mimeType: string} | null>(null);
  const [dnaGenerated, setDnaGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Strategy Engine
  const [metrics, setMetrics] = useState({ clarity: 0, visibility: 0, authority: 0, consistency: 0 });
  const [positioningMoat, setPositioningMoat] = useState('');
  const [narrativeSynthesis, setNarrativeSynthesis] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [authorityStrengths, setAuthorityStrengths] = useState<string[]>([]);
  const [visibilityGaps, setVisibilityGaps] = useState<string[]>([]);

  // Growth Roadmap
  const [roadmap, setRoadmap] = useState({ days30: '', days60: '', days90: '' });
  
  // Content Calendar
  const [calendar, setCalendar] = useState<any[]>([]);

  // Ecosystem Scanner
  const [opportunities, setOpportunities] = useState([
    { id: '1', type: 'Podcast', name: 'Tech Innovators Podcast', status: 'new' },
    { id: '2', type: 'Speaking', name: 'Global Tech Summit 2027', status: 'new' }
  ]);
  const [pitchDraft, setPitchDraft] = useState('');
  const [activePitchId, setActivePitchId] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  const togglePost = (id: string) => {
    setExpandedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64 = result.split(',')[1];
      setDocumentFile({ name: file.name, base64, mimeType: file.type });
      addToast(`Attached ${file.name}`, 'success');
    };
    reader.readAsDataURL(file);
  };
  
  const handleGenerateStrategy = async () => {
    if (!dnaForm.brandName && !documentFile) {
      addToast('Please provide at least a Brand Name or upload a document.', 'info');
      return;
    }
    
    setIsGenerating(true);
    addToast('Analyzing Brand DNA and compiling strategy...', 'info');
    
    try {
      const payload = {
        ...dnaForm,
        documentBase64: documentFile?.base64,
        documentMimeType: documentFile?.mimeType
      };
      
      const response = await fetch('/api/ai/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMetrics(data.metrics || { clarity: 60, visibility: 45, authority: 55, consistency: 70 });
      setPositioningMoat(data.positioningMoat || '');
      setNarrativeSynthesis(data.narrativeSynthesis || '');
      setFocusAreas(data.focusAreas || []);
      setAuthorityStrengths(data.authorityStrengths || []);
      setVisibilityGaps(data.visibilityGaps || []);
      setRoadmap(data.roadmap || { days30: '', days60: '', days90: '' });
      setCalendar(data.calendar || []);
      if (data.opportunities && Array.isArray(data.opportunities)) {
        setOpportunities(data.opportunities);
      }
      
      setDnaGenerated(true);
      addToast('Brand Strategy Protocol generated successfully!', 'success');
    } catch (error) {
      console.error(error);
      addToast('Failed to generate strategy.', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecutePitch = (id: string) => {
    setActivePitchId(id);
    addToast('AI drafting tailored pitch...', 'info');
    setTimeout(() => {
      setPitchDraft(`Hi there,\n\nI've been following your platform and love the recent discussions. Given my background in ${dnaForm.industry || 'this industry'} and our mission to ${dnaForm.mission || 'make an impact'}, I believe I could bring a unique perspective to your audience.\n\nWould love to connect!\n\nBest,\n${currentIdentity?.displayName || 'Me'}`);
      addToast('Pitch draft ready!', 'success');
    }, 1000);
  };

  // Generated Strategy UI (BrandForge Light Theme)
  if (dnaGenerated) {
    return (
      <div className="h-full flex flex-col space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 bg-blue-600 rounded-sm mr-2"></span>
              BRAND STRATEGY PROFILE
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{dnaForm.brandName || documentFile?.name.split('.')[0] || 'STRATEGY'}</h1>
            <p className="text-xs text-slate-500 mt-2 tracking-widest uppercase">
              INITIALIZED: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => addToast('Strategy saved to secure Vault.', 'success')}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg flex items-center hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Map className="w-4 h-4 mr-2" />
              Vault
            </button>
            <button 
              onClick={() => addToast('Power Move Sequence Initiated!', 'success')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Zap className="w-4 h-4 mr-2 fill-current" />
              Execute Power Move
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'CLARITY', value: metrics.clarity },
            { label: 'VISIBILITY', value: metrics.visibility },
            { label: 'AUTHORITY', value: metrics.authority },
            { label: 'CONSISTENCY', value: metrics.consistency }
          ].map(m => (
            <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
              <div className="text-xs font-bold text-slate-500 tracking-wider mb-2">{m.label}</div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{m.value}%</div>
              <div className="absolute bottom-0 left-0 h-1 bg-blue-600" style={{ width: `${m.value}%` }}></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-slate-200 px-4">
          {['STRATEGY', '30-DAY CALENDAR', '90-DAY ROADMAP', 'OPPORTUNITIES'].map(tab => (
            <button
              key={tab}
              onClick={() => setArtifactTab(tab.toLowerCase().replace(' ', '-'))}
              className={cn(
                "pb-4 text-sm font-bold transition-colors relative",
                artifactTab === tab.toLowerCase().replace(' ', '-') ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab}
              {artifactTab === tab.toLowerCase().replace(' ', '-') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 pb-16 overflow-y-auto">
          {artifactTab === 'strategy' && (
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column (2/3) */}
              <div className="col-span-2 space-y-6">
                {/* Positioning Moat */}
                <div className="bg-white border border-slate-200 rounded-xl p-8 relative shadow-sm">
                  <div className="flex items-center text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                    <Target className="w-4 h-4 mr-2" />
                    POSITIONING MOAT
                  </div>
                  <p className="text-xl font-medium text-slate-900 italic leading-relaxed">
                    {positioningMoat}
                  </p>
                </div>

                {/* Narrative Synthesis */}
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                  <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">
                    <Wand2 className="w-4 h-4 mr-2" />
                    NARRATIVE SYNTHESIS
                  </div>
                  <p className="text-sm text-slate-600 leading-loose">
                    {narrativeSynthesis}
                  </p>
                </div>

                {/* Split Strengths / Gaps */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm">
                    <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-4">
                      AUTHORITY STRENGTHS
                    </div>
                    <ul className="space-y-3">
                      {authorityStrengths.map((str, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-700 font-medium leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 mr-3 mt-0.5 text-green-500 shrink-0" />
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
                    <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4">
                      VISIBILITY GAPS
                    </div>
                    <ul className="space-y-3">
                      {visibilityGaps.map((gap, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-700 font-medium leading-relaxed">
                          <Crosshair className="w-4 h-4 mr-3 mt-0.5 text-red-500 shrink-0" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column (1/3) */}
              <div className="col-span-1 space-y-6">
                {/* Execution Queue */}
                <div className="bg-white border border-blue-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      EXECUTION QUEUE
                    </div>
                    <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
                  </div>
                  <div className="text-center space-y-4">
                    <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">NO ACTIVE MOVES IN THE QUEUE.</p>
                    <button 
                      onClick={() => addToast('First Move generated and queued in Composer.', 'success')}
                      className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase rounded-lg hover:bg-blue-100 w-full transition-colors border border-blue-200"
                    >
                      GENERATE FIRST MOVE
                    </button>
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                    STRATEGY FOCUS AREAS
                  </div>
                  <div className="space-y-2">
                    {focusAreas.map((area, i) => (
                      <div key={i} className="p-3 border border-slate-100 bg-slate-50 rounded-lg text-xs font-bold text-slate-700 tracking-wide uppercase leading-relaxed hover:border-slate-200 cursor-pointer transition-colors">
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {artifactTab === '30-day-calendar' && (
            <div className="grid grid-cols-2 gap-6">
              {calendar.length > 0 ? calendar.map((w: any, index: number) => (
                <div key={index} className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center tracking-wide">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-3">{w.week || index + 1}</span>
                    Week {w.week || index + 1}: {w.theme}
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-bold text-blue-600 text-xs uppercase tracking-wider">{w.post1?.platform}</span>
                          <p className="text-xs text-slate-500 mt-1">{w.post1?.format}</p>
                        </div>
                        <button 
                          onClick={() => togglePost(`w${index}p1`)} 
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded"
                        >
                          {expandedPosts[`w${index}p1`] ? 'COLLAPSE' : 'EXPAND'}
                        </button>
                      </div>
                      
                      {!expandedPosts[`w${index}p1`] ? (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-900"><span className="text-slate-500 font-normal">Hook:</span> {w.post1?.hook}</p>
                          <p className="text-sm text-slate-700 truncate"><span className="text-slate-500 font-normal">Body:</span> {w.post1?.body}</p>
                          <p className="text-sm font-semibold text-blue-600"><span className="text-slate-500 font-normal">CTA:</span> {w.post1?.cta}</p>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Full Draft</p>
                          <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {w.post1?.fullDraft || 'Drafting in progress...'}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-bold text-blue-600 text-xs uppercase tracking-wider">{w.post2?.platform}</span>
                          <p className="text-xs text-slate-500 mt-1">{w.post2?.format}</p>
                        </div>
                        <button 
                          onClick={() => togglePost(`w${index}p2`)} 
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded"
                        >
                          {expandedPosts[`w${index}p2`] ? 'COLLAPSE' : 'EXPAND'}
                        </button>
                      </div>

                      {!expandedPosts[`w${index}p2`] ? (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-900"><span className="text-slate-500 font-normal">Hook:</span> {w.post2?.hook}</p>
                          <p className="text-sm text-slate-700 truncate"><span className="text-slate-500 font-normal">Body:</span> {w.post2?.body}</p>
                          <p className="text-sm font-semibold text-blue-600"><span className="text-slate-500 font-normal">CTA:</span> {w.post2?.cta}</p>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Full Draft</p>
                          <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {w.post2?.fullDraft || 'Drafting in progress...'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  No calendar generated.
                </div>
              )}
            </div>
          )}

          {artifactTab === '90-day-roadmap' && (
             <div className="max-w-3xl space-y-8 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
               <div className="space-y-6">
                 <div className="flex space-x-6 relative">
                   <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center shrink-0 z-10">
                     <span className="font-bold text-blue-600 text-sm">30</span>
                   </div>
                   <div className="flex-1 pt-3 pb-8 border-b border-slate-100">
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">First 30 Days</h3>
                     <p className="text-sm text-slate-600">{roadmap.days30}</p>
                   </div>
                   <div className="absolute left-6 top-12 bottom-0 w-px bg-slate-200"></div>
                 </div>
                 <div className="flex space-x-6 relative">
                   <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center shrink-0 z-10">
                     <span className="font-bold text-blue-600 text-sm">60</span>
                   </div>
                   <div className="flex-1 pt-3 pb-8 border-b border-slate-100">
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Next 60 Days</h3>
                     <p className="text-sm text-slate-600">{roadmap.days60}</p>
                   </div>
                   <div className="absolute left-6 top-12 bottom-0 w-px bg-slate-200"></div>
                 </div>
                 <div className="flex space-x-6 relative">
                   <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center shrink-0 z-10">
                     <span className="font-bold text-blue-600 text-sm">90</span>
                   </div>
                   <div className="flex-1 pt-3">
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">90 Days & Beyond</h3>
                     <p className="text-sm text-slate-600">{roadmap.days90}</p>
                   </div>
                 </div>
               </div>
             </div>
          )}

          {artifactTab === 'opportunities' && (
            <div className="max-w-4xl space-y-4">
              {opportunities.map(opp => (
                <div key={opp.id} className="p-6 bg-white border border-slate-200 rounded-2xl flex items-start justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{opp.type}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{opp.name}</h3>
                  </div>
                  <button 
                    onClick={() => handleExecutePitch(opp.id)}
                    className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                  >
                    <Zap className="w-3.5 h-3.5 mr-2" />
                    EXECUTE PITCH
                  </button>
                </div>
              ))}
              
              {/* ONE-CLICK PITCHING DRAFT */}
              <AnimatePresence>
                {pitchDraft && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-white border border-blue-200 rounded-2xl relative shadow-md"
                  >
                    <div className="absolute top-4 right-4">
                      <button onClick={() => setPitchDraft('')} className="text-slate-400 hover:text-slate-600">
                        ×
                      </button>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center uppercase tracking-wider">
                      <Wand2 className="w-4 h-4 mr-2 text-blue-600" /> 
                      Generated Pitch
                    </h3>
                    <textarea 
                      className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      defaultValue={pitchDraft}
                    />
                    <div className="mt-4 flex justify-end">
                      <button className="px-6 py-2 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                        Send Pitch
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal Light UI (Onboarding)
  return (
    <div className="h-full flex flex-col space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">BrandForge Rebrand Tool</h1>
          <p className="text-slate-500 text-sm">Fill out the questionnaire or upload a profile to generate a system artifact.</p>
        </div>
      </div>

      <div className="flex-1 flex space-x-8 min-h-0">
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Intelligent Onboarding</h2>
                <p className="text-sm text-slate-500">Provide details manually or upload a Resume/LinkedIn profile (PDF/Text) to build your personalized Brand Protocol.</p>
              </div>

              {/* File Upload Section */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors relative bg-slate-50 group">
                <input 
                  type="file" 
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Upload Profile or Resume</h3>
                <p className="text-xs text-slate-500 mt-1">PDF, DOC, or TXT up to 5MB</p>
                {documentFile && (
                  <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    <CheckCircle2 className="w-3 h-3 mr-2" />
                    {documentFile.name} attached
                  </div>
                )}
              </div>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">OR ENTER MANUALLY</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brand / Person Name</label>
                    <input 
                      type="text"
                      placeholder="e.g., Jane Smith"
                      value={dnaForm.brandName}
                      onChange={e => setDnaForm({...dnaForm, brandName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Industry / Niche</label>
                    <input 
                      type="text"
                      placeholder="e.g., Federal IT Consulting"
                      value={dnaForm.industry}
                      onChange={e => setDnaForm({...dnaForm, industry: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Mission</label>
                  <textarea 
                    placeholder="What is the ultimate goal of your brand?"
                    value={dnaForm.mission}
                    onChange={e => setDnaForm({...dnaForm, mission: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-24"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Audience</label>
                    <input 
                      type="text"
                      placeholder="Who are you trying to reach?"
                      value={dnaForm.audience}
                      onChange={e => setDnaForm({...dnaForm, audience: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Goals</label>
                    <input 
                      type="text"
                      placeholder="e.g., Lead generation, Thought leadership"
                      value={dnaForm.goals}
                      onChange={e => setDnaForm({...dnaForm, goals: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 pb-16">
                <button 
                  onClick={handleGenerateStrategy}
                  disabled={isGenerating}
                  className={cn(
                    "px-8 py-4 bg-slate-900 text-white font-bold text-sm rounded-xl transition-all flex items-center shadow-lg hover:shadow-xl",
                    isGenerating ? "opacity-75 cursor-not-allowed" : "hover:bg-slate-800 hover:-translate-y-0.5"
                  )}
                >
                  <Rocket className={cn("w-5 h-5 mr-3", isGenerating && "animate-spin")} />
                  {isGenerating ? 'INITIALIZING PROTOCOL...' : 'GENERATE SYSTEM ARTIFACT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
