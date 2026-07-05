import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  MousePointer2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  CalendarDays,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';

type Period = '7d' | '30d' | '90d';

const radarData = [
  { subject: 'Reach', A: 120, B: 110, fullMark: 150 },
  { subject: 'Engagement', A: 98, B: 130, fullMark: 150 },
  { subject: 'Frequency', A: 86, B: 130, fullMark: 150 },
  { subject: 'Sentiment', A: 99, B: 100, fullMark: 150 },
  { subject: 'Growth', A: 85, B: 90, fullMark: 150 },
  { subject: 'Conversion', A: 65, B: 85, fullMark: 150 },
];

const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const heatmapHours = Array.from({length: 24}, (_, i) => `${i}h`);
const heatmapData = heatmapDays.map(day => 
  heatmapHours.map(() => Math.floor(Math.random() * 10))
);

const analyticsData = {
  '7d': {
    stats: {
      impressions: { value: '1.2M', delta: 12.5 },
      followers: { value: '+4,280', delta: 8.2 },
      engagement: { value: '4.8%', delta: -2.4 },
      clicks: { value: '12.4K', delta: 24.1 }
    },
    chartData: [
      { name: 'Mon', impressions: 4000, engagement: 2400 },
      { name: 'Tue', impressions: 3000, engagement: 1398 },
      { name: 'Wed', impressions: 2000, engagement: 9800 },
      { name: 'Thu', impressions: 2780, engagement: 3908 },
      { name: 'Fri', impressions: 1890, engagement: 4800 },
      { name: 'Sat', impressions: 2390, engagement: 3800 },
      { name: 'Sun', impressions: 3490, engagement: 4300 }
    ]
  },
  '30d': {
    stats: {
      impressions: { value: '5.4M', delta: 18.2 },
      followers: { value: '+18,920', delta: 12.4 },
      engagement: { value: '5.1%', delta: 4.1 },
      clicks: { value: '54.2K', delta: 19.8 }
    },
    chartData: [
      { name: 'Week 1', impressions: 16000, engagement: 11200 },
      { name: 'Week 2', impressions: 18400, engagement: 13800 },
      { name: 'Week 3', impressions: 15200, engagement: 14900 },
      { name: 'Week 4', impressions: 21000, engagement: 18500 }
    ]
  },
  '90d': {
    stats: {
      impressions: { value: '16.8M', delta: 22.4 },
      followers: { value: '+56,410', delta: 15.6 },
      engagement: { value: '5.3%', delta: 6.8 },
      clicks: { value: '162.5K', delta: 31.2 }
    },
    chartData: [
      { name: 'Month 1', impressions: 68000, engagement: 42000 },
      { name: 'Month 2', impressions: 72000, engagement: 49000 },
      { name: 'Month 3', impressions: 84000, engagement: 56000 }
    ]
  }
};

const StatCard: React.FC<{ label: string; value: string; delta: number; icon: React.ElementType }> = ({ label, value, delta, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div className={cn(
        "flex items-center text-xs font-bold px-2 py-1 rounded-full",
        delta > 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
      )}>
        {delta > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {Math.abs(delta)}%
      </div>
    </div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
  </div>
);

export const AnalyticsPage: React.FC = () => {
  const { addToast } = useApp();
  const [timePeriod, setTimePeriod] = useState<Period>('7d');

  const currentData = analyticsData[timePeriod];

  const handleExportReport = () => {
    addToast(`Preparing metrics download for Last ${timePeriod === '7d' ? '7 Days' : timePeriod === '30d' ? '30 Days' : '90 Days'}...`, 'info');
    
    // Construct a beautiful summary report text
    let reportContent = `========================================\n`;
    reportContent += `BrandForge - PERFORMANCE METRICS REPORT\n`;
    reportContent += `Report Interval: Last ${timePeriod === '7d' ? '7 Days' : timePeriod === '30d' ? '30 Days' : '90 Days'}\n`;
    reportContent += `Generated At: ${new Date().toLocaleString()}\n`;
    reportContent += `========================================\n\n`;
    
    reportContent += `SUMMARY METRICS:\n`;
    reportContent += `----------------------------------------\n`;
    reportContent += `- Total Impressions: ${currentData.stats.impressions.value} (${currentData.stats.impressions.delta > 0 ? '+' : ''}${currentData.stats.impressions.delta}%)\n`;
    reportContent += `- Follower Growth: ${currentData.stats.followers.value} (${currentData.stats.followers.delta > 0 ? '+' : ''}${currentData.stats.followers.delta}%)\n`;
    reportContent += `- Avg. Engagement Rate: ${currentData.stats.engagement.value} (${currentData.stats.engagement.delta > 0 ? '+' : ''}${currentData.stats.engagement.delta}%)\n`;
    reportContent += `- Link Clicks: ${currentData.stats.clicks.value} (${currentData.stats.clicks.delta > 0 ? '+' : ''}${currentData.stats.clicks.delta}%)\n\n`;
    
    reportContent += `DETAILED TIMELINE DATA:\n`;
    reportContent += `----------------------------------------\n`;
    reportContent += `Timeline Node\tImpressions\tEngagement Score\n`;
    currentData.chartData.forEach(node => {
      reportContent += `${node.name}\t${node.impressions}\t${node.engagement}\n`;
    });
    reportContent += `\n========================================\n`;
    reportContent += `End of Report\n`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brandforge_performance_report_${timePeriod}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addToast('Report downloaded successfully!', 'success');
  };

  return (
    <div className="h-full flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>
          <p className="text-slate-500 text-sm">Track growth and engagement across all brand identities.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Timeline filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <CalendarDays className="w-4 h-4 ml-2 text-slate-400" />
            <select 
              value={timePeriod}
              onChange={(e) => {
                const p = e.target.value as Period;
                setTimePeriod(p);
                addToast(`Timeline updated to Last ${p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}`, 'success');
              }}
              className="text-xs bg-transparent border-none py-1.5 pl-2 pr-8 font-bold text-slate-600 focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <button 
            onClick={handleExportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-transparent rounded-lg text-sm font-bold text-white transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard label="Total Impressions" value={currentData.stats.impressions.value} delta={currentData.stats.impressions.delta} icon={TrendingUp} />
        <StatCard label="Follower Growth" value={currentData.stats.followers.value} delta={currentData.stats.followers.delta} icon={Users} />
        <StatCard label="Avg. Engagement" value={currentData.stats.engagement.value} delta={currentData.stats.engagement.delta} icon={MessageCircle} />
        <StatCard label="Link Clicks" value={currentData.stats.clicks.value} delta={currentData.stats.clicks.delta} icon={MousePointer2} />
      </div>

      {/* Fatigue Monitor & Radar Row */}
      <div className="grid grid-cols-3 gap-8">
        {/* Fatigue Monitor */}
        <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                Fatigue Monitor (Hill Function)
              </h3>
              <p className="text-sm text-slate-500 mt-1">Predicting diminishing returns based on posting frequency.</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50">Twitter</button>
              <button className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold">LinkedIn</button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50">Instagram</button>
            </div>
          </div>
          
          <div className="w-full h-4 bg-slate-100 rounded-full my-6 overflow-hidden flex">
            <div className="h-full bg-red-500 w-full rounded-full"></div>
          </div>
          
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium leading-relaxed">
              High fatigue detected for LinkedIn. Posting more than 2 times per day reduces marginal engagement by 31%.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Daily Post Count</p>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-slate-900">3</span>
                <div className="flex items-center space-x-1">
                  <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold">-</button>
                  <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold">+</button>
                </div>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Marginal Gain</p>
              <span className="text-3xl font-bold text-slate-900">0%</span>
            </div>
          </div>
        </div>

        {/* Competitor Radar */}
        <div className="col-span-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans">Competitor Radar</h3>
            <p className="text-sm text-slate-500 mt-1">Comparison against industry benchmarks.</p>
          </div>
          <div className="flex-1 min-h-[250px] -mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Competitors" dataKey="B" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.5} />
                <Radar name="Your Brand" dataKey="A" stroke="#0f172a" fill="#334155" fillOpacity={0.8} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
              <span className="text-xs font-bold text-slate-600">Competitors</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
              <span className="text-xs font-bold text-slate-600">Your Brand</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 font-sans mb-1">Engagement Density Heatmap</h3>
        <p className="text-sm text-slate-500 mb-8">Historical engagement density by hour and day.</p>
        
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            <div className="flex ml-12 mb-2">
              {heatmapHours.map(hour => (
                <div key={hour} className="flex-1 text-center text-[10px] font-bold text-slate-400">{hour}</div>
              ))}
            </div>
            <div className="space-y-1">
              {heatmapDays.map((day, dIdx) => (
                <div key={day} className="flex items-center">
                  <div className="w-12 text-xs font-bold text-slate-500">{day}</div>
                  <div className="flex flex-1 space-x-1">
                    {heatmapData[dIdx].map((val, hIdx) => (
                      <div 
                        key={hIdx} 
                        className="flex-1 h-8 rounded-sm"
                        style={{
                          backgroundColor: `rgba(15, 23, 42, ${val === 0 ? 0.05 : val / 10})`
                        }}
                        title={`${day} ${heatmapHours[hIdx]}: Intensity ${val}`}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end mt-4 space-x-2 mr-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Low</span>
            <div className="flex space-x-1">
              {[0.1, 0.4, 0.7, 1].map((opacity, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-slate-900" style={{opacity}}></div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">High</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-8">
        {/* Engagement Overview Area Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 font-sans">Engagement Overview</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-tight">
              {timePeriod === '7d' ? 'Daily' : timePeriod === '30d' ? 'Weekly' : 'Monthly'} Rate
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.chartData}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution Bar Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 font-sans">Performance Comparison</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Impressions</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Engagement</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="impressions" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="engagement" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
