import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X, Check } from "lucide-react";

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const MODES = [
    { id: "warp", label: "WARP" },
    { id: "doh", label: "DNS over HTTPS" },
    { id: "warp+doh", label: "WARP + DoH" },
    { id: "dot", label: "DNS over TLS" },
    { id: "warp+dot", label: "WARP + DoT" },
    { id: "proxy", label: "Proxy" },
];

export default function SettingsPanel({ isOpen, onClose }: SettingsProps) {
    const [settingsOutput, setSettingsOutput] = useState("");
    const [settingsData, setSettingsData] = useState<Record<string, string>>({});
    const [showRaw, setShowRaw] = useState(false);
    const [currentMode, setCurrentMode] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    async function fetchSettings() {
        try {
            const res: string = await invoke("get_settings");
            setSettingsOutput(res);

            const data: Record<string, string> = {};
            const lines = res.split("\n");
            lines.forEach(line => {
                const parts = line.split(":");
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join(":").trim();
                    data[key] = value;
                }
            });
            setSettingsData(data);

            if (data["Mode"]) {
                const modeVal = data["Mode"].toLowerCase();
                if (modeVal.includes("https")) setCurrentMode("doh");
                else if (modeVal.includes("tls")) setCurrentMode("dot");
                else if (modeVal.includes("warp+doh")) setCurrentMode("warp+doh");
                else if (modeVal.includes("warp+dot")) setCurrentMode("warp+dot");
                else if (modeVal.includes("proxy")) setCurrentMode("proxy");
                else if (modeVal.includes("warp")) setCurrentMode("warp");
                else setCurrentMode(modeVal);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function handleSetMode(mode: String) {
        setLoading(true);
        try {
            await invoke("set_mode", { mode });
            await fetchSettings();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 bg-gray-900 p-6 flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Settings</h2>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Configuration & Info</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors group">
                    <X size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                {/* Mode Selection */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Operation Mode</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {MODES.map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => handleSetMode(mode.id)}
                                disabled={loading}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${currentMode === mode.id || (currentMode.includes(mode.id) && mode.id !== 'warp')
                                    ? "bg-blue-500/10 border-blue-500 text-blue-400"
                                    : "bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600"
                                    }`}
                            >
                                <span className="text-[11px] font-bold uppercase">{mode.label}</span>
                                {currentMode === mode.id && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Structured Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Client Info</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { label: "Device ID", key: "Expected Device ID" },
                            { label: "Protocol", key: "Protocol" },
                            { label: "Family Mode", key: "Family Mode" },
                            { label: "Gateway ID", key: "Gateway ID" }
                        ].map(item => settingsData[item.key] && (
                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{item.label}</span>
                                <span className="text-[10px] font-mono text-gray-300 truncate max-w-[180px] text-right">{settingsData[item.key]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Raw Output Section */}
                <div className="pt-4 border-t border-gray-800">
                    <button
                        onClick={() => setShowRaw(!showRaw)}
                        className="text-[10px] font-bold text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors mb-2"
                    >
                        {showRaw ? "Collapse Raw Output" : "View Raw Settings Output"}
                    </button>
                    {showRaw && (
                        <div className="bg-black/40 p-4 rounded-xl border border-gray-800 animate-in fade-in slide-in-from-top-1">
                            <pre className="text-[9px] font-mono text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {settingsOutput}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.2em]">Application version 0.1.0</p>
            </div>
        </div>
    );
}
