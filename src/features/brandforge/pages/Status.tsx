import React from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  Zap, 
  Clock, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

const StatusCard: React.FC<{ label: string; value: string; status: 'ok' | 'warning' | 'error'; icon: React.ElementType }> = ({ label, value, status, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div className={cn(
        "w-2.5 h-2.5 rounded-full",
        status === 'ok' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
        status === 'warning' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : 
        "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
      )} />
    </div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <h3 className="text-xl font-bold text-slate-900 mt-1">{value}</h3>
  </div>
);


export const StatusPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Status</h1>
        <p className="text-slate-500 text-sm">Real-time health monitoring of BrandForge infrastructure.</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <StatusCard label="API Gateway" value="Operational" status="ok" icon={Server} />
        <StatusCard label="Firestore" value="Healthy" status="ok" icon={Database} />
        <StatusCard label="Job Queue" value="12 Pending" status="warning" icon={Activity} />
        <StatusCard label="AI Copilot" value="Online" status="ok" icon={Zap} />
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Recent Events</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">View Full Logs</button>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { time: '2 mins ago', event: 'AI Draft Generated', target: 'Inbox #4829', status: 'success' },
              { time: '5 mins ago', event: 'Webhook Ingested', target: 'X (Twitter)', status: 'success' },
              { time: '12 mins ago', event: 'Scheduled Post Published', target: 'LinkedIn', status: 'success' },
              { time: '18 mins ago', event: 'Rate Limit Warning', target: 'Instagram API', status: 'warning' },
              { time: '25 mins ago', event: 'New Brand Identity Created', target: 'Executive Persona', status: 'success' },
            ].map((log, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "p-1.5 rounded-full",
                    log.status === 'success' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{log.event}</p>
                    <p className="text-xs text-slate-500">{log.target}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Queue Depth</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Publishing Queue</span>
                  <span>85%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>AI Processing</span>
                  <span>42%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[42%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Webhook Buffer</span>
                  <span>12%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[12%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Resource Usage</h3>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm font-medium text-slate-600">CPU Load</span>
              <span className="text-sm font-bold text-slate-900">14%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm font-medium text-slate-600">Memory</span>
              <span className="text-sm font-bold text-slate-900">1.2GB / 4GB</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-slate-600">Active Sockets</span>
              <span className="text-sm font-bold text-slate-900">242</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
