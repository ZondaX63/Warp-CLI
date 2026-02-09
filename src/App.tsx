import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Shield, ShieldAlert, Settings, Activity, Power, RefreshCw } from "lucide-react";
import SettingsPanel from "./components/SettingsPanel";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Checking...");
  const [mode, setMode] = useState("Unknown");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  // Poll status every 2 seconds
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAll() {
    await Promise.all([fetchStatus(), fetchMode()]);
  }

  async function fetchStatus() {
    try {
      const res: string = await invoke("get_status");
      const lines = res.split('\n');
      const statusLine = lines.find(l => l.includes("Status update:"));
      if (statusLine) {
        setStatus(statusLine.replace("Status update:", "").trim());
      } else if (res.toLowerCase().includes("connected")) {
        setStatus("Connected");
      } else if (res.toLowerCase().includes("disconnected")) {
        setStatus("Disconnected");
      } else {
        setStatus(res.trim() || "Unknown");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchMode() {
    try {
      const res: string = await invoke("get_settings");
      // warp-cli settings output format: "Mode: DnsOverHttps"
      const match = res.match(/Mode:\s+([a-zA-Z+]+)/i);
      if (match) {
        let modeVal = match[1];
        // Clean up display name
        if (modeVal.toLowerCase() === "dnsoverhttps") modeVal = "DoH";
        if (modeVal.toLowerCase() === "dnsovertls") modeVal = "DoT";
        setMode(modeVal);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleConnection() {
    if (loading) return;
    setLoading(true);
    try {
      const isCurrentlyConnected = status.toLowerCase() === "connected" || (status.toLowerCase().includes("connected") && !status.toLowerCase().includes("disconnected"));
      if (isCurrentlyConnected) {
        await invoke("disconnect");
      } else {
        await invoke("connect");
      }
      // Wait a bit for status to update
      await new Promise(r => setTimeout(r, 1000));
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const isConnected = status.toLowerCase() === "connected" || (status.toLowerCase().includes("connected") && !status.toLowerCase().includes("disconnected"));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6 select-none overflow-hidden relative">
      {/* Background decoration */}
      <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${isConnected ? 'bg-gradient-to-br from-blue-900 to-gray-900' : 'bg-gradient-to-br from-red-900 to-gray-900'}`}></div>

      <div className="relative z-10 w-[400px] h-[600px] bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-8 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 text-gray-400 text-sm font-black tracking-widest uppercase italic">
          <Activity size={16} className="text-blue-500" />
          <span>WarpPulse</span>
        </div>

        {/* Status Indicator */}
        <div className="relative group">
          <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-colors duration-500 ${isConnected ? 'bg-blue-500' : 'bg-red-500'}`}></div>
          <div className={`relative w-40 h-40 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isConnected ? 'border-blue-500/50 bg-gray-900/50 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'border-red-500/50 bg-gray-900/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]'}`}>
            {isConnected ? (
              <Shield size={64} className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
            ) : (
              <ShieldAlert size={64} className="text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]" />
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            {isConnected ? "Protected" : "Unprotected"}
          </h1>
          <div className="flex flex-col gap-1 items-center justify-center">
            <p className={`text-xl font-bold transition-colors ${isConnected ? 'text-blue-400' : 'text-red-400'}`}>
              {status}
            </p>
            <div className="px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center gap-2 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest leading-none">
                Active Mode: <span className="text-white">{mode}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={toggleConnection}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${isConnected
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin" /> Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Power /> {isConnected ? "Disconnect" : "Connect"}
            </span>
          )}
        </button>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        {/* Settings Panel */}
        <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </div>

      <div className="mt-8 text-xs text-gray-600">
        Powered by Cloudflare Warp
      </div>
    </div>
  );
}

export default App;
