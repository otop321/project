"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, Activity, Thermometer, Droplets, Zap, Shield, Sun, Wind, Flame, BarChart3 } from "lucide-react";
import Link from "next/link";
import SensorChart from "@/components/SensorChart";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blynkData, setBlynkData] = useState<Record<string, string | null> | null>(null);
  const [loading, setLoading] = useState(true);
  const [relayOn, setRelayOn] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [historyData, setHistoryData] = useState<{
    timestamp: string;
    temp: number;
    humidity: number;
    pm25: number;
    light: number;
    gas: number;
  }[]>([]);

  const updatePin = async (pin: string, value: number) => {
    if (!session?.user?.blynkToken) return;
    try {
      if (pin === "v7") setRelayOn(value === 1); // optimistic UI update
      await axios.post("/api/blynk", { token: session.user.blynkToken, pin, value });
    } catch (error) {
      if (pin === "v7") setRelayOn(value !== 1); // revert on error
      console.error("Failed to update pin:", error);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchBlynkData = async () => {
      if (session?.user?.blynkToken) {
        try {
          const res = await axios.get(`/api/blynk?token=${session.user.blynkToken}`);
          setBlynkData(res.data);
          // Sync relay state only on first load to prevent polling from 
          // overwriting user interaction (optimistic UI)
          if (res.data?.v7 !== undefined && !initialized) {
            setRelayOn(res.data.v7 === "1");
            setInitialized(true);
          }
        } catch (error) {
          console.error("Error fetching Blynk data:", error);
          setBlynkData({ v0: "24.5", v1: "60", v2: "1" });
        }
      } else {
         setBlynkData({ v0: "26.8", v1: "55", v2: "0" });
      }
      setLoading(false);
    };

    if (session) {
      fetchBlynkData();
      const interval = setInterval(fetchBlynkData, 5000);
      return () => clearInterval(interval);
    }
  }, [session, initialized]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/api/sensors/history");
        setHistoryData(res.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    if (status === "authenticated") {
      fetchHistory();
      const interval = setInterval(fetchHistory, 30000);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-teal-400">
        <Activity className="animate-spin w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-[#111827] to-gray-800 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-teal-500/5 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>

      <header className="relative z-10 bg-gray-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-teal-500/20 rounded-lg flex items-center justify-center border border-teal-500/30 mr-3 shadow-[0_0_10px_rgba(20,184,166,0.2)]">
                 <Activity className="h-6 w-6 text-teal-400" />
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-blue-400 tracking-tight">IoT Dashboard</h1>
            </div>
            <div className="flex items-center space-x-6">
              {session?.user?.role === "admin" && (
                <Link href="/admin" className="group flex items-center text-sm font-medium text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/20 transition-all">
                  <Shield className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Admin Panel
                </Link>
              )}
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-400">Welcome back,</span>
                <span className="text-white font-medium">{session?.user?.name || "User"}</span>
              </div>
              <div className="h-10 w-px bg-gray-700"></div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="group flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 border border-transparent hover:border-red-500/30 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Real-time metrics section */}
        <div>
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-6 bg-teal-500 rounded-full mr-3"></div>
                Device Telemetry
             </h2>
             <div className="flex items-center text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
               Live Updates
             </div>
           </div>
           
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Temperature Card */}
            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-white/5 backdrop-blur-sm hover:border-red-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">Temperature</p>
                  <h3 className="text-4xl font-light text-white mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
                    {blynkData?.v3 || "--"}<span className="text-xl text-gray-500 ml-1">°C</span>
                  </h3>
                </div>
                <div className="p-3 bg-linear-to-br from-red-500/20 to-orange-500/5 rounded-xl border border-red-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                  <Thermometer className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-1.5 mt-6 overflow-hidden">
                <div
                  className="bg-linear-to-r from-orange-500 to-red-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(Number(blynkData?.v3 || 0) * 2, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Humidity Card */}
            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-white/5 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">Humidity</p>
                  <h3 className="text-4xl font-light text-white mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
                    {blynkData?.v4 || "--"}<span className="text-xl text-gray-500 ml-1">%</span>
                  </h3>
                </div>
                <div className="p-3 bg-linear-to-br from-blue-500/20 to-cyan-500/5 rounded-xl border border-blue-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                  <Droplets className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-1.5 mt-6 overflow-hidden">
                <div
                  className="bg-linear-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${Number(blynkData?.v4 || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* System Power Card */}
            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-white/5 backdrop-blur-sm hover:border-green-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">System Power</p>
                  <div className="mt-2 flex items-center">
                    <h3 className={`text-4xl font-light tracking-tight group-hover:scale-105 transition-transform origin-left ${relayOn ? 'text-white' : 'text-gray-500'}`}>
                      {relayOn ? "Active" : "Standby"}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`p-3 rounded-xl border transition-all duration-500 group-hover:scale-110 ${relayOn ? 'bg-linear-to-br from-green-500/20 to-emerald-500/5 border-green-500/20 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-gray-800 border-gray-700'}`}>
                    <Zap className={`w-6 h-6 ${relayOn ? 'text-green-400' : 'text-gray-600'}`} />
                  </div>
                  <button
                    onClick={() => updatePin("v7", relayOn ? 0 : 1)}
                    className={`relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none ${relayOn ? "bg-green-600" : "bg-gray-700"}`}
                  >
                    <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${relayOn ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between bg-gray-900/50 rounded-lg p-3 border border-white/5">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Device Token:</span>
                <span className={`text-xs font-mono px-2 py-1 rounded bg-gray-800 border ${session?.user?.blynkToken ? 'text-teal-400 border-teal-500/30' : 'text-yellow-400 border-yellow-500/30'}`}>
                  {session?.user?.blynkToken ? "Configured" : "Mock Data Mode"}
                </span>
              </div>
            </div>

            {/* PM2.5 Card */}
            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-white/5 backdrop-blur-sm hover:border-blue-400/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">PM 2.5 Dust</p>
                  <h3 className="text-4xl font-light text-white mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
                    {blynkData?.v6 || "--"}<span className="text-xl text-gray-500 ml-1">µg/m³</span>
                  </h3>
                </div>
                <div className="p-3 bg-linear-to-br from-blue-500/20 to-indigo-500/5 rounded-xl border border-blue-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                  <Wind className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-1.5 mt-6 overflow-hidden">
                <div
                  className="bg-linear-to-r from-blue-400 to-indigo-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(Number(blynkData?.v6 || 0), 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Light Card */}
            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-white/5 backdrop-blur-sm hover:border-yellow-400/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">Light</p>
                  <h3 className="text-4xl font-light text-white mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
                    {blynkData?.v2 || "--"}<span className="text-xl text-gray-500 ml-1">%</span>
                  </h3>
                </div>
                <div className="p-3 bg-linear-to-br from-yellow-500/20 to-amber-500/5 rounded-xl border border-yellow-500/20 group-hover:scale-110 group-hover:rotate-45 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all">
                  <Sun className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-1.5 mt-6 overflow-hidden">
                <div
                  className="bg-linear-to-r from-yellow-400 to-amber-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(Number(blynkData?.v2 || 0), 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Gas Card */}
            <div className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-white/5 backdrop-blur-sm hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">Gas Concentration</p>
                  <h3 className="text-4xl font-light text-white mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
                    {(blynkData?.v1 || blynkData?.v5) || "--"}<span className="text-xl text-gray-500 ml-1">ppm</span>
                  </h3>
                </div>
                <div className="p-3 bg-linear-to-br from-orange-500/20 to-red-500/5 rounded-xl border border-orange-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-1.5 mt-6 overflow-hidden">
                <div
                  className="bg-linear-to-r from-orange-400 to-red-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(Number(blynkData?.v1 || blynkData?.v5 || 0) / 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Charts Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <div className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></div>
              <BarChart3 className="w-5 h-5 mr-2 text-indigo-400" />
              Sensor History
            </h2>
            <div className="flex items-center text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
              <div className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></div>
              Auto updates every 30s
            </div>
          </div>

          {historyData.length === 0 ? (
            <div className="bg-gray-800/40 rounded-2xl p-12 border border-white/5 text-center">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No history data yet. Data is recorded every 5 minutes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SensorChart data={historyData} dataKey="temp" title="Temperature" color="#f87171" />
              <SensorChart data={historyData} dataKey="humidity" title="Humidity" color="#60a5fa" />
              <SensorChart data={historyData} dataKey="pm25" title="PM 2.5" color="#a78bfa" />
              <SensorChart data={historyData} dataKey="light" title="Light" color="#fbbf24" />
              <SensorChart data={historyData} dataKey="gas" title="Gas" color="#fb923c" />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
