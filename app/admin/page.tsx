"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Shield, Users, Activity, LogOut, Search, Trash2, Key, Thermometer, Sun, Wind, Flame, Droplets, Zap, BarChart3, Settings, AlertTriangle, Bell, Info, Plus, X } from "lucide-react";
import Link from "next/link";
import SensorChart from "@/components/SensorChart";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  blynkTemplateId?: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blynkData, setBlynkData] = useState<Record<string, string | null> | null>(null);
  const [historyData, setHistoryData] = useState<{
    timestamp: string;
    temp: number;
    humidity: number;
    pm25: number;
    light: number;
    gas: number;
  }[]>([]);
  const [settings, setSettings] = useState({
    pm25_limit: 50,
    temp_limit: 40,
    humidity_limit: 80,
    gas_limit: 500,
    notification_enabled: true,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/admin/settings");
        if (res.data) setSettings(res.data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    if (status === "authenticated") fetchSettings();
  }, [status]);

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await axios.post("/api/admin/settings", newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/users", newUser);
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await axios.delete(`/api/admin/users?id=${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

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
      const interval = setInterval(fetchHistory, 30000); // 30s
      return () => clearInterval(interval);
    }
  }, [status]);

  const updatePin = async (pin: string, newValue: number) => {
    if (!session?.user?.blynkToken) return;
    try {
      await axios.post("/api/blynk", {
        token: session.user.blynkToken,
        pin,
        value: newValue
      });
      // Refresh data immediately
      const res = await axios.get(`/api/blynk?token=${session.user.blynkToken}`);
      setBlynkData(res.data);
    } catch (error) {
      console.error(`Failed to update pin ${pin}:`, error);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.blynkToken) {
      const fetchData = async () => {
        try {
          const res = await axios.get(`/api/blynk?token=${session.user.blynkToken}`);
          setBlynkData(res.data);
        } catch (error) {
          console.error("Blynk Fetch Error (Admin):", error);
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard");
      } else {
        fetchUsers();
      }
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(search.toLowerCase()) || 
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-purple-400">
        <Activity className="animate-spin w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#11182A] to-gray-800 text-white relative overflow-hidden">
      {/* Decorative background geometry */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[5%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
      </div>

      <header className="relative z-10 bg-gray-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 mr-3 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                 <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight">Admin Area</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm font-medium hidden sm:block">
                Back to Dashboard
              </Link>
              <div className="h-10 w-px bg-gray-700 hidden sm:block"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Superadmin</span>
                <span className="text-white font-medium">{session?.user?.name || "Admin"}</span>
              </div>
              
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="group flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 border border-transparent hover:border-red-500/30 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-white mt-2">{users.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                 <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Administrators</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                 <Shield className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Linked Devices</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {users.filter(u => u.blynkTemplateId).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                 <Activity className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Sensors Monitoring */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-teal-400" />
             {/* ESP32 System Status Card */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-linear-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/5 shadow-2xl flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${blynkData?.v3 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                <Activity className={`w-8 h-8 ${blynkData?.v3 ? "animate-pulse" : ""}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  ESP32 Controller 
                  <span className={`ml-3 px-2 py-0.5 text-[10px] rounded-full uppercase tracking-tighter ${blynkData?.v3 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                    {blynkData?.v3 ? "Connected" : "Disconnected"}
                  </span>
                </h2>
                <div className="mt-1 flex items-center text-sm text-gray-400">
                  <span className="flex items-center mr-4"><Info className="w-3 h-3 mr-1" /> Uptime: {blynkData?.v3 ? "99.9%" : "0%"}</span>
                  <span className="flex items-center"><Settings className="w-3 h-3 mr-1" /> Ver: 1.0.4 Octa</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs text-gray-500 font-mono">ID: {session?.user?.blynkToken?.substring(0, 8)}...</span>
              <div className="mt-2 h-1 w-32 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] w-[85%]"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-2xl p-6 border border-white/5 flex items-center justify-center">
             <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Active Alerts</p>
                <div className="text-3xl font-black text-orange-400">
                  {[
                    Number(blynkData?.v6) > settings.pm25_limit,
                    Number(blynkData?.v3) > settings.temp_limit,
                    Number(blynkData?.v1) > settings.gas_limit,
                  ].filter(Boolean).length}
                </div>
             </div>
          </div>
        </div>

        {/* Live Device Monitoring Section */}
            </h2>
            <div className="flex items-center text-xs text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full border border-white/5">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Real-time
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* PM2.5 */}
            <div className={`bg-gray-800/40 rounded-xl p-4 border transition-all group ${Number(blynkData?.v6) > settings.pm25_limit ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5 hover:border-blue-400/30'}`}>
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">PM 2.5</p>
                {Number(blynkData?.v6) > settings.pm25_limit ? <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" /> : <Wind className="w-4 h-4 text-blue-400 group-hover:animate-bounce" />}
              </div>
              <div className="mt-2 flex justify-between items-end">
                <div>
                  <span className={`text-2xl font-bold ${Number(blynkData?.v6) > settings.pm25_limit ? 'text-red-400' : 'text-white'}`}>{blynkData?.v6 || "0"}</span>
                  <span className="text-xs text-gray-500 ml-1">µg/m³</span>
                </div>
              </div>
              <div className="w-full bg-gray-900 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`${Number(blynkData?.v6) > settings.pm25_limit ? 'bg-red-500' : 'bg-blue-500'} h-full rounded-full transition-all duration-1000`}
                  style={{ width: `${Math.min(Number(blynkData?.v6 || 0), 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Light */}
            <div className="bg-gray-800/40 rounded-xl p-4 border border-white/5 backdrop-blur-sm hover:border-yellow-400/30 transition-all group">
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Light</p>
                <Sun className="w-4 h-4 text-yellow-400 group-hover:rotate-45 transition-transform" />
              </div>
              <div className="mt-2 flex justify-between items-end">
                <div>
                  <span className="text-2xl font-bold">{blynkData?.v2 || "0"}</span>
                  <span className="text-xs text-gray-500 ml-1">%</span>
                </div>
              </div>
              <div className="w-full bg-gray-900 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-yellow-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(Number(blynkData?.v2 || 0), 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Temperature */}
            <div className={`bg-gray-800/40 rounded-xl p-4 border transition-all group ${Number(blynkData?.v3) > settings.temp_limit ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5 hover:border-red-400/30'}`}>
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Temp</p>
                {Number(blynkData?.v3) > settings.temp_limit ? <Bell className="w-4 h-4 text-red-500 animate-pulse" /> : <Thermometer className="w-4 h-4 text-red-500" />}
              </div>
              <div className="mt-2 flex justify-between items-end">
                <div>
                  <span className={`text-2xl font-bold ${Number(blynkData?.v3) > settings.temp_limit ? 'text-red-400' : 'text-white'}`}>{blynkData?.v3 || "0"}</span>
                  <span className="text-xs text-gray-500 ml-1">°C</span>
                </div>
              </div>
              <div className="w-full bg-gray-900 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(Number(blynkData?.v3 || 0) * 2, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Gas */}
            <div className={`bg-gray-800/40 rounded-xl p-4 border transition-all group ${Number(blynkData?.v5) > settings.gas_limit ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5 hover:border-orange-400/30'}`}>
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Gas</p>
                <Flame className={`w-4 h-4 ${Number(blynkData?.v5) > settings.gas_limit ? 'text-red-500' : 'text-orange-500'} group-hover:scale-125 transition-transform`} />
              </div>
              <div className="mt-2 flex justify-between items-end">
                <div>
                  <span className={`text-2xl font-bold ${Number(blynkData?.v1 || blynkData?.v5 || 0) > settings.gas_limit ? 'text-red-400' : 'text-white'}`}>{(blynkData?.v1 || blynkData?.v5) || "0"}</span>
                  <span className="text-xs text-gray-500 ml-1">ppm</span>
                </div>
                <button
                  onClick={() => updatePin("v15", blynkData?.v15 === "1" ? 0 : 1)}
                  className={`h-6 w-10 rounded-full transition-colors relative ${blynkData?.v15 === "1" ? "bg-orange-600" : "bg-gray-700"}`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${blynkData?.v15 === "1" ? "translate-x-4" : ""}`} />
                </button>
              </div>
              <div className="w-full bg-gray-900 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`${Number(blynkData?.v1 || blynkData?.v5 || 0) > settings.gas_limit ? 'bg-red-500' : 'bg-orange-500'} h-full rounded-full transition-all duration-1000`}
                  style={{ width: `${Math.min(Number(blynkData?.v1 || blynkData?.v5 || 0) / 10, 100)}%` }}
                ></div>
              </div>
            </div>


            {/* Humidity */}
            <div className="bg-gray-800/40 rounded-xl p-4 border border-white/5 backdrop-blur-sm hover:border-cyan-400/30 transition-all group">
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Humidity</p>
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 flex justify-between items-end">
                <div>
                  <span className="text-2xl font-bold">{blynkData?.v4 || "0"}</span>
                  <span className="text-xs text-gray-500 ml-1">%</span>
                </div>
              </div>
            </div>

            {/* Power Status */}
            <div className="bg-gray-800/40 rounded-xl p-4 border border-white/5 backdrop-blur-sm hover:border-emerald-400/30 transition-all group">
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Power</p>
                <Zap className={`w-4 h-4 ${blynkData?.v3 ? "text-emerald-400" : "text-gray-600"}`} />
              </div>
              <div className="mt-2 flex justify-between items-end">
                <div>
                  <span className={`text-xl font-bold ${blynkData?.v3 ? "text-emerald-400" : "text-gray-500"}`}>
                    {blynkData?.v3 ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
                <button
                  onClick={() => updatePin("v12", blynkData?.v12 === "1" ? 0 : 1)}
                  className={`h-6 w-10 rounded-full transition-colors relative ${blynkData?.v12 === "1" ? "bg-emerald-600" : "bg-gray-700"}`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${blynkData?.v12 === "1" ? "translate-x-4" : ""}`} />
                </button>
              </div>
            </div>

            {/* Master Control Switch */}
            <div className="bg-gray-800/40 rounded-xl p-4 border border-white/5 backdrop-blur-sm hover:border-purple-400/30 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Master Control</p>
                <div className={`h-2 w-2 rounded-full ${blynkData?.v7 === "1" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"}`}></div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold text-white uppercase tracking-tight">
                  {blynkData?.v7 === "1" ? "ON" : "OFF"}
                </span>
                <button
                  onClick={() => updatePin("v7", blynkData?.v7 === "1" ? 0 : 1)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    blynkData?.v7 === "1" ? 'bg-purple-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      blynkData?.v7 === "1" ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* System & Notification Settings Section */}
        <div className="space-y-6 mt-12 mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Bell className="w-5 h-5 mr-2 text-orange-400" />
              Notification & System Settings
            </h2>
            <button 
              onClick={() => saveSettings(settings)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Save Configuration
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-300">PM 2.5 Limit</p>
                <span className="text-xs font-mono text-orange-400">{settings.pm25_limit}</span>
              </div>
              <input 
                type="range" min="0" max="200" 
                value={settings.pm25_limit} 
                onChange={(e) => setSettings({...settings, pm25_limit: Number(e.target.value)})}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-300">Temp Limit (°C)</p>
                <span className="text-xs font-mono text-orange-400">{settings.temp_limit}</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={settings.temp_limit} 
                onChange={(e) => setSettings({...settings, temp_limit: Number(e.target.value)})}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-300">Humidity Limit (%)</p>
                <span className="text-xs font-mono text-orange-400">{settings.humidity_limit}</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={settings.humidity_limit} 
                onChange={(e) => setSettings({...settings, humidity_limit: Number(e.target.value)})}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-300">Gas Limit (ppm)</p>
                <span className="text-xs font-mono text-orange-400">{settings.gas_limit}</span>
              </div>
              <input 
                type="range" min="0" max="1000" 
                value={settings.gas_limit} 
                onChange={(e) => setSettings({...settings, gas_limit: Number(e.target.value)})}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Historical Charts Section */}
        <div className="space-y-6 mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
              Historical Sensor Analytics
            </h2>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Last 24 Hours / 50 Points</div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SensorChart data={historyData} dataKey="temp" title="Temperature" color="#EF4444" />
            <SensorChart data={historyData} dataKey="humidity" title="Humidity" color="#06B6D4" />
            <SensorChart data={historyData} dataKey="pm25" title="PM 2.5" color="#3B82F6" />
            <SensorChart data={historyData} dataKey="light" title="Light / LDR" color="#FACC15" />
            <SensorChart data={historyData} dataKey="gas" title="Gas Concentration" color="#F97316" />
          </div>
        </div>

        {/* Users Table Section */}
        <div className="bg-gray-800/60 rounded-2xl shadow-xl border border-white/5 backdrop-blur-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-white">User Management</h2>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-900/40">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Device Config</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50 bg-transparent">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden">
                             {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{user.name || "Unknown"}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border 
                          ${user.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                            : 'bg-gray-700/30 text-gray-300 border-gray-600/30'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.blynkTemplateId ? (
                          <div className="flex items-center text-sm text-teal-400">
                            <Activity className="w-4 h-4 mr-1.5" /> Active
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-gray-600 mr-2"></div> None
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button className="text-gray-400 hover:text-blue-400 transition-colors p-1" title="Reset Password">
                            <Key className="w-4 h-4" />
                          </button>
                          {user._id !== session?.user?.id && (
                            <button 
                              onClick={() => handleDeleteUser(user._id, user.name || user.email)}
                              className="text-gray-400 hover:text-red-400 transition-colors p-1" 
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-8 w-8 mb-3 text-gray-600" />
                        <p>No users found matching &quot;{search}&quot;</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input 
                  required
                  type="password" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
