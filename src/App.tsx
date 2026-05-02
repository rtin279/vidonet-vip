/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  Image as ImageIcon, 
  MousePointer2, 
  MessageSquareMore,
  Send,
  CheckCircle2,
  Wallet,
  Home as HomeIcon,
  ShoppingBag,
  ArrowUpRight,
  History,
  CreditCard,
  Plus,
  Rocket,
  Flame,
  Crown,
  Activity,
  Share2,
  Settings as SettingsIcon,
  LogOut,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { auth, db, signIn, logout as firebaseLogout } from "./lib/firebase";
import { onAuthStateChanged, User as AuthUser, getRedirectResult } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

// Declare Telegram WebApp types
declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

enum View {
  HOME = "home",
  ECONOMY_PACKAGES = "economy_packages",
  PREMIUM_PACKAGES = "premium_packages",
  WALLET = "wallet",
  ADMIN = "admin",
  PROFILE = "profile"
}

interface PackageDef {
  size: string;
  unit: string;
  price: string;
  tag: string;
  color: string;
  border: string;
  accent: string;
  pricePerGb?: string;
  recommended?: boolean;
}

const ECONOMY_PACKAGES: PackageDef[] = [
  {
    size: "5",
    unit: "گیگ",
    price: "1,100",
    pricePerGb: "220",
    tag: "اقتصادی",
    color: "from-cyan-500/10 to-teal-500/10",
    border: "border-cyan-500/20",
    accent: "text-cyan-400"
  },
  {
    size: "10",
    unit: "گیگ",
    price: "2,000",
    pricePerGb: "200",
    tag: "پرطرفدار",
    recommended: true,
    color: "from-cyan-600/20 to-cyan-400/20",
    border: "border-cyan-400/40",
    accent: "text-cyan-300"
  },
  {
    size: "20",
    unit: "گیگ",
    price: "3,600",
    pricePerGb: "180",
    tag: "بصرفه ترین",
    color: "from-teal-500/10 to-cyan-500/10",
    border: "border-teal-500/20",
    accent: "text-teal-400"
  }
];

const PREMIUM_PACKAGES: PackageDef[] = [
  { size: "1", unit: "گیگ", price: "380", tag: "Basic", color: "from-cyan-500/10 to-teal-500/10", border: "border-cyan-500/20", accent: "text-cyan-400" },
  { size: "2", unit: "گیگ", price: "740", tag: "Save More", color: "from-cyan-500/10 to-teal-500/10", border: "border-cyan-500/20", accent: "text-cyan-400" },
  { size: "3", unit: "گیگ", price: "1,095", tag: "Smart Choice", color: "from-cyan-500/10 to-teal-500/10", border: "border-cyan-500/20", accent: "text-cyan-400" },
  { size: "5", unit: "گیگ", price: "1,750", tag: "Good Deal", recommended: true, color: "from-teal-500/20 to-cyan-500/20", border: "border-teal-500/40", accent: "text-teal-400" },
  { size: "7", unit: "گیگ", price: "2,380", tag: "Best Value", color: "from-teal-500/20 to-cyan-500/20", border: "border-teal-500/40", accent: "text-teal-400" },
  { size: "10", unit: "گیگ", price: "3,300", tag: "Recommended", color: "from-teal-600/20 to-cyan-600/20", border: "border-teal-500/50", accent: "text-teal-400" }
];

const FEATURES = [
  { icon: MousePointer2, text: "اسکرول روان اینستاگرام و تلگرام" },
  { icon: ImageIcon, text: "ارسال عکس و ویدیو بدون لگ" },
  { icon: Cpu, text: "پروتکل‌های پیشرفته V2Ray" },
  { icon: Zap, text: "تنوع لوکیشن و سرورهای اختصاصی" },
  { icon: ShieldCheck, text: "ضمانت بازگشت وجه ۲۴ ساعته" }
];

function VidonetLogo({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-full h-full bg-cyan-500/20 blur-[40px] rounded-full" 
      />
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
        <defs>
          <linearGradient id="v-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0d9488', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path 
          d="M20,20 C35,20 45,60 50,80 C55,60 65,20 80,20 C70,25 60,70 50,90 C40,70 30,25 20,20 Z" 
          fill="url(#v-gradient)"
        />
        <circle cx="50" cy="80" r="2" fill="#fff" opacity="0.8" />
        <circle cx="20" cy="20" r="1.5" fill="#fff" opacity="0.5" />
        <circle cx="80" cy="20" r="1.5" fill="#fff" opacity="0.5" />
      </svg>
    </div>
  );
}

const Constellation = () => {
  return (
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: Math.random() * 5 + 3, repeat: Infinity }}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        <path 
          d="M10,20 L30,40 M60,10 L80,30 M20,80 L40,60 M70,90 L90,70" 
          stroke="rgba(34,211,238,0.1)" 
          strokeWidth="0.5" 
          fill="none" 
        />
      </svg>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [tgUser, setTgUser] = useState<any>(null);
  
  // Firebase State
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [salesEnabled, setSalesEnabled] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check for redirect result
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect Auth Error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("دامنه فعلی در کنسول فایربیس مجاز نیست. لطفا دامنه را در بخش Authorized Domains اضافه کنید.");
      }
    });

    // Auth Listener
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthLoading(false);
      
      if (user) {
        // Ensure user doc exists
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            balance: 0,
            role: user.email === "rtin279@gmail.com" ? "admin" : "user"
          });
        }

        // Real-time user doc listener
        const unsubUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setDbUser(doc.data());
          }
        });

        return () => unsubUser();
      } else {
        setDbUser(null);
      }
    });

    // Settings Listener - Initialize if doesn't exist
    const settingsRef = doc(db, "settings", "global");
    const unsubSettings = onSnapshot(settingsRef, async (docSnap) => {
      if (docSnap.exists()) {
        setSalesEnabled(docSnap.data().salesEnabled);
      } else {
        // Default to open if document missing
        setSalesEnabled(true);
      }
    });

    return () => {
      unsubAuth();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor("#020617");
      tg.setBackgroundColor("#020617");
      
      if (tg.initDataUnsafe?.user) {
        setTgUser(tg.initDataUnsafe.user);
      }

      const handleBack = () => setCurrentView(View.HOME);
      
      if (currentView !== View.HOME) {
        tg.BackButton.show();
        tg.BackButton.onClick(handleBack);
      } else {
        tg.BackButton.hide();
      }

      return () => {
        tg.BackButton.offClick(handleBack);
      };
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <Constellation />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-900/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 blur-[120px] rounded-full" />
      </div>

      <header className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 relative z-30 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView(View.HOME)}>
            <VidonetLogo className="w-10 h-10 md:w-12 md:h-12" />
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
                 VIDONET
              </h1>
              <p className="text-[9px] md:text-[10px] text-cyan-400/70 font-bold tracking-[0.2em] leading-none uppercase">
                 {tgUser ? `HI, ${tgUser.first_name}` : 'PREMIUM V2RAY SYSTEM'}
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-xl font-black text-white italic">VIDONET</h1>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <div onClick={() => setCurrentView(View.WALLET)} className="flex items-center gap-2 bg-slate-900/40 border border-white/5 px-3 py-2 rounded-xl cursor-pointer">
              <p className="text-xs font-black text-cyan-400">{dbUser?.balance || 0}</p>
              <Wallet size={14} className="text-cyan-400" />
            </div>
            {authUser ? (
              <div onClick={() => setCurrentView(View.PROFILE)} className="w-9 h-9 rounded-xl border border-white/10 overflow-hidden cursor-pointer">
                <img src={authUser.photoURL || ""} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <button onClick={() => signIn()} className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <UserIcon size={16} />
              </button>
            )}
          </div>
        </div>

        <nav className="flex items-center bg-slate-950/80 backdrop-blur-2xl border border-white/10 p-1 rounded-xl md:rounded-2xl shadow-xl w-full md:w-auto justify-center">
          <button onClick={() => setCurrentView(View.HOME)} className={`px-4 md:px-5 py-2 rounded-lg md:rounded-xl transition-all font-bold text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2 ${currentView === View.HOME ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'text-slate-400 hover:text-slate-200'}`}>
            <HomeIcon size={14} className="md:w-4 md:h-4" /> خانه
          </button>
          <button onClick={() => setCurrentView(View.ECONOMY_PACKAGES)} className={`px-4 md:px-5 py-2 rounded-lg md:rounded-xl transition-all font-bold text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2 ${currentView === View.ECONOMY_PACKAGES ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'text-slate-400 hover:text-slate-200'}`}>
            <Zap size={14} className="md:w-4 md:h-4" /> اقتصادی
          </button>
          <button onClick={() => setCurrentView(View.PREMIUM_PACKAGES)} className={`px-4 md:px-5 py-2 rounded-lg md:rounded-xl transition-all font-bold text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2 ${currentView === View.PREMIUM_PACKAGES ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'text-slate-400 hover:text-slate-200'}`}>
            <Rocket size={14} className="md:w-4 md:h-4" /> ویژه
          </button>
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div onClick={() => setCurrentView(View.WALLET)} className="flex items-center gap-3 bg-slate-900/40 border border-white/5 px-4 py-2 rounded-2xl cursor-pointer hover:border-cyan-500/30 transition-all group">
            <div className="text-left leading-tight">
              <p className="text-[9px] text-slate-500 font-black">WALLET</p>
              <p className="text-sm font-black text-cyan-400">{dbUser?.balance || 0}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
              <Plus size={16} />
            </div>
          </div>
          {authUser ? (
            <div onClick={() => setCurrentView(View.PROFILE)} className="w-10 h-10 rounded-2xl border-2 border-white/10 overflow-hidden cursor-pointer hover:border-cyan-500 transition-all">
              <img src={authUser.photoURL || ""} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <button onClick={() => signIn()} className="px-6 py-2 rounded-2xl bg-cyan-500 text-white font-black text-sm shadow-lg shadow-cyan-500/20">
              ورود
            </button>
          )}
          {dbUser?.role === 'admin' && (
            <button onClick={() => setCurrentView(View.ADMIN)} className={`p-2.5 rounded-2xl border transition-all ${currentView === View.ADMIN ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-900/50 border-white/10 text-indigo-400 hover:border-indigo-400'}`}>
              <SettingsIcon size={18} />
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 relative z-20">
        <AnimatePresence mode="wait">
          {currentView === View.HOME && (
            <motion.div key="home" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="max-w-6xl mx-auto">
              <div className="text-center mb-20">
                 <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-5xl md:text-8xl font-black mb-8 text-white leading-[1.1] tracking-tight">
                       عبور از <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">مرزهای</span> اینترنت
                    </h2>
                    <p className="text-lg md:text-2xl text-slate-400 max-w-4xl mx-auto font-medium leading-relaxed mb-12">
                       ویدونت با زیرساخت اختصاصی در <span className="text-cyan-400 font-black underline decoration-cyan-500/20 underline-offset-8">آلمان، هلند و لهستان</span>، تضمین‌کننده بالاترین آپتایم و سرعت در شبکه V2Ray است.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                       <button onClick={() => setCurrentView(View.PREMIUM_PACKAGES)} className="bg-cyan-500 hover:bg-cyan-400 text-white px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                          شروع تجربه پرسرعت <Rocket className="w-6 h-6" />
                       </button>
                       <button className="bg-white/5 border border-white/10 hover:bg-white/10 px-10 py-5 rounded-[2rem] font-bold text-xl transition-all flex items-center gap-3">
                          تست رایگان <Zap className="w-6 h-6 text-cyan-400" />
                       </button>
                    </div>
                 </motion.div>
              </div>

              <div className="grid lg:grid-cols-2 gap-10 mb-24">
                 <motion.div 
                    whileHover={{ y: -10 }}
                    onClick={() => setCurrentView(View.ECONOMY_PACKAGES)}
                    className="group relative bg-slate-900/30 border border-white/5 p-12 rounded-[4rem] overflow-hidden cursor-pointer backdrop-blur-3xl transition-all hover:border-cyan-500/20"
                 >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all text-cyan-400">
                       <Zap size={240} />
                    </div>
                    <div className="relative z-10">
                       <div className="w-16 h-16 bg-cyan-500/10 rounded-3xl flex items-center justify-center text-cyan-400 mb-8 border border-cyan-500/20">
                          <Activity size={32} />
                       </div>
                       <h3 className="text-4xl font-black text-white mb-4">پنل اقتصادی</h3>
                       <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-sm">
                          مناسب برای استفاده‌های سبک، شبکه‌های اجتماعی و وب‌گردی روزمره با قیمت‌های بی‌نظیر.
                       </p>
                       <div className="inline-flex items-center gap-4 text-cyan-400 font-black group-hover:gap-6 transition-all text-lg">
                          تعرفه‌های اقتصادی <ArrowUpRight size={24} />
                       </div>
                    </div>
                 </motion.div>

                 <motion.div 
                    whileHover={{ y: -10 }}
                    onClick={() => setCurrentView(View.PREMIUM_PACKAGES)}
                    className="group relative bg-gradient-to-br from-cyan-950/20 to-teal-950/20 border border-teal-500/10 p-12 rounded-[4rem] overflow-hidden cursor-pointer backdrop-blur-3xl transition-all hover:border-teal-500/30"
                 >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all text-teal-400">
                       <Flame size={240} />
                    </div>
                    <div className="relative z-10">
                       <div className="w-16 h-16 bg-teal-500/10 rounded-3xl flex items-center justify-center text-teal-400 mb-8 border border-teal-500/20">
                          <Rocket size={32} />
                       </div>
                       <h3 className="text-4xl font-black text-white mb-4">پنل ویژه</h3>
                       <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-sm">
                          پشتیبانی از پروتکل‌های فوق پیشرفته V2Ray+ برای گیمینگ و تماشای ویدیوهای با کیفیت 4K.
                       </p>
                       <div className="inline-flex items-center gap-4 text-teal-400 font-black group-hover:gap-6 transition-all text-lg">
                          تعرفه‌های حرفه‌ای <ArrowUpRight size={24} />
                       </div>
                    </div>
                 </motion.div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-t border-white/5">
                 {[
                   { label: "تعداد سرورها", val: "۴۸" },
                   { label: "کاربر فعال", val: "۱۰k+" },
                   { label: "آپتایم ماهانه", val: "۹۹.۹٪" },
                   { label: "تراکنش موفق", val: "۵۰k+" }
                 ].map((stat, i) => (
                   <div key={i} className="text-center group">
                      <p className="text-4xl font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">{stat.val}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {(currentView === View.ECONOMY_PACKAGES || currentView === View.PREMIUM_PACKAGES) && (
            <motion.div key="pricing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-20 mt-10">
                 <h2 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tight">
                    {currentView === View.ECONOMY_PACKAGES ? "پنل اقتصادی" : "پنل ویژه سرعت بالا"}
                 </h2>
                 <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                    {currentView === View.ECONOMY_PACKAGES 
                      ? "مناسب برای وب‌گردی و شبکه‌های اجتماعی با تعرفه فوق العاده" 
                      : "قدرت گرفته از سریع‌ترین پروتکل‌های V2Ray برای استریم و گیمینگ"}
                 </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
                {(currentView === View.ECONOMY_PACKAGES ? ECONOMY_PACKAGES : PREMIUM_PACKAGES).map((pkg, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -12, scale: 1.02 }}
                    className={`relative p-10 rounded-[3.5rem] border ${pkg.border} bg-gradient-to-b ${pkg.color} backdrop-blur-2xl flex flex-col items-center text-center overflow-hidden transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-cyan-500/10 group`}
                  >
                    {pkg.recommended && (
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 px-10 py-1.5 ${currentView === View.PREMIUM_PACKAGES ? 'bg-teal-500 shadow-teal-500/20' : 'bg-cyan-500 shadow-cyan-500/20'} text-white text-xs font-black rounded-b-[1.5rem] shadow-xl`}>
                        HIGH POTENTIAL
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <span className="text-7xl font-black block mb-2 text-white group-hover:scale-110 transition-transform">{pkg.size}</span>
                      <span className="text-xl font-bold text-slate-400">{pkg.unit}</span>
                    </div>

                    <div className="w-[60%] h-px bg-white/10 mb-10 mx-auto" />

                    <div className="mb-10 w-full">
                      <p className="text-[10px] text-slate-500 font-black mb-2 uppercase tracking-widest">{pkg.tag}</p>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl font-black text-white">{pkg.price}</span>
                        <span className="text-slate-400 font-bold text-sm">تومان</span>
                      </div>
                      {pkg.pricePerGb && (
                        <div className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] text-cyan-400/80 font-bold">
                           گیگی {pkg.pricePerGb} هزار تومان
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={async () => {
                        if (!salesEnabled) return;
                        if (!authUser) {
                          alert("ابتدا وارد حساب کاربری شوید");
                          return;
                        }
                        const p = parseInt(pkg.price.replace(/,/g, ''));
                        if (dbUser.balance < p) {
                          alert("موجودی کیف پول کافی نیست");
                          setCurrentView(View.WALLET);
                          return;
                        }
                        try {
                          await updateDoc(doc(db, "users", authUser.uid), {
                            balance: increment(-p)
                          });
                          alert(`پکیج ${pkg.size} گیگ با موفقیت فعال شد`);
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all duration-300 ${!salesEnabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : pkg.recommended ? (currentView === View.PREMIUM_PACKAGES ? 'bg-teal-500 shadow-teal-500/30' : 'bg-cyan-500 shadow-cyan-500/30') + ' text-white scale-105' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                      disabled={!salesEnabled}
                    >
                      {!salesEnabled ? "فروش موقتا غیرفعال" : "سفارش و اتصال آنی"}
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-4 max-w-7xl mx-auto">
                {FEATURES.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-900/50 border border-white/5 px-6 py-4 rounded-[2rem] backdrop-blur-xl">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <feat.icon size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-300">{feat.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === View.WALLET && (
            <motion.div key="wallet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
              <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-10 md:p-16 backdrop-blur-3xl relative overflow-hidden shadow-big">
                 <div className="absolute top-[-20%] right-[-10%] opacity-[0.02] pointer-events-none rotate-12 scale-150 text-cyan-400">
                    <Wallet size={400} />
                 </div>

                 <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                    <div>
                       <h2 className="text-4xl font-black text-white mb-3 italic">VIDONET PAY</h2>
                       <p className="text-slate-400 text-lg font-medium">شارژ آنی کیف پول جهت خریدهای پرسرعت و تمدید خودکار.</p>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 px-12 py-8 rounded-[3rem] text-center shadow-lg shadow-cyan-500/5 min-w-[240px]">
                       <p className="text-xs text-cyan-400 font-black mb-2 uppercase tracking-widest">Available Balance</p>
                       <p className="text-5xl font-black text-white">{dbUser?.balance || 0} <span className="text-sm">تومان</span></p>
                    </div>
                 </div>

                 <div className="space-y-10">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                       {["۵۰,۰۰۰", "۱۰۰,۰۰۰", "۵۰۰,۰۰۰", "۱,۰۰۰,۰۰۰"].map((amountStr, i) => (
                         <button 
                            key={i} 
                            onClick={async () => {
                              if (!authUser) return;
                              const amount = parseInt(amountStr.replace(/,/g, ''));
                              try {
                                await updateDoc(doc(db, "users", authUser.uid), {
                                  balance: increment(amount)
                                });
                                alert(`مبلغ ${amountStr} تومان به کیف پول اضافه شد (تست)`);
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className="bg-white/5 border border-white/5 py-6 rounded-3xl hover:border-cyan-500/50 text-slate-300 font-black text-lg transition-all active:scale-95"
                         >
                            {amountStr} <span className="text-xs font-bold">ت</span>
                         </button>
                       ))}
                    </div>

                    <button className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white py-6 rounded-[2.5rem] font-black text-2xl transition-all shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-4 group">
                       تایید نهایی و پرداخت آنلاین
                       <CreditCard size={32} className="group-hover:rotate-12 transition-transform" />
                    </button>
                 </div>
              </div>

              <div className="mt-10 grid md:grid-cols-2 gap-6">
                 <div className="bg-slate-900/30 border border-white/5 p-8 rounded-[3rem] backdrop-blur-xl">
                    <h4 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                       <History size={20} className="text-cyan-400" /> آخرین تراکنش‌ها
                    </h4>
                    <div className="space-y-5">
                       <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                          <div>
                            <p className="text-sm font-bold text-white">شارژ کیف پول</p>
                            <p className="text-[10px] text-slate-500">موفق - ۱۲ اردیبهشت</p>
                          </div>
                          <span className="text-teal-400 font-black text-lg">۱,۵۰۰,۰۰۰+</span>
                       </div>
                       <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl opacity-60">
                          <div>
                            <p className="text-sm font-bold text-white">خرید پکیج ۱۰ گیگ</p>
                            <p className="text-[10px] text-slate-500">پرمیوم - ۱۰ اردیبهشت</p>
                          </div>
                          <span className="text-slate-300 font-black text-lg">۳,۳۰۰,۰۰۰-</span>
                       </div>
                    </div>
                 </div>
                 <div className="bg-cyan-500/5 border border-cyan-500/10 p-8 rounded-[3rem] flex flex-col justify-center items-center text-center">
                    <ShieldCheck size={48} className="text-cyan-500 mb-4" />
                    <h5 className="text-lg font-bold text-white mb-2 underline decoration-cyan-500/30 underline-offset-8">پرداخت امن شاپرک</h5>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">تمامی تراکنش‌ها در بستر امن بانکی با پروتکل SSL انجام می‌شود. تضمین بازگشت وجه در صورت بروز مشکل فنی.</p>
                 </div>
              </div>
            </motion.div>
          )}
          {currentView === View.ADMIN && dbUser?.role === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
              <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-16 backdrop-blur-3xl">
                <h2 className="text-4xl font-black text-white mb-10">پنل مدیریت سیستم</h2>
                
                <div className="grid gap-8">
                  <div className="flex items-center justify-between bg-white/5 p-8 rounded-3xl border border-white/5">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">وضعیت فروش سرویس</h3>
                      <p className="text-sm text-slate-500">با غیرفعال کردن این گزینه، کاربران امکان خرید پکیج نخواهند داشت.</p>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          await setDoc(doc(db, "settings", "global"), { salesEnabled: !salesEnabled }, { merge: true });
                        } catch (e) { console.error(e); }
                      }}
                      className={`relative w-20 h-10 rounded-full transition-all duration-500 ${salesEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all duration-500 ${salesEnabled ? 'right-1' : 'right-11'}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                      <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">TOTAL REVENUE</p>
                      <p className="text-2xl font-black text-cyan-400">۴۸,۵۰۰,۰۰۰</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                      <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">ACTIVE USERS</p>
                      <p className="text-2xl font-black text-teal-400">۱,۸۴۲</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                      <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">SERVER STATUS</p>
                      <p className="text-2xl font-black text-green-400">OPTIMAL</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!authUser && !authLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6 text-right">
              <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-teal-500" />
                <VidonetLogo className="w-20 h-20 mx-auto mb-8" />
                <h2 className="text-3xl font-black text-white mb-4 italic">ویدونت - VIDONET</h2>
                <p className="text-slate-400 mb-10 leading-relaxed font-medium">برای دسترسی به پنل کاربری، مشاهده موجودی و خرید اشتراک، لطفا وارد حساب کاربری خود شوید.</p>
                
                <button 
                  onClick={() => signIn()}
                  className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-xl hover:bg-cyan-50 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
                >
                  ورود با حساب گوگل <UserIcon size={24} />
                </button>
                <p className="text-[10px] text-slate-600 mt-8 font-bold uppercase tracking-widest">Ultra Secure Authentication</p>
              </div>
            </motion.div>
          )}

          {authLoading && (
            <div className="fixed inset-0 z-[110] bg-slate-950 flex items-center justify-center">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <VidonetLogo className="w-16 h-16 opacity-50" />
               </motion.div>
            </div>
          )}
          {currentView === View.PROFILE && authUser && (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
              <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl relative overflow-hidden">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-[2.5rem] border-4 border-cyan-500/30 overflow-hidden mb-6 shadow-2xl">
                    <img src={authUser.photoURL || ""} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">{authUser.displayName}</h2>
                  <p className="text-slate-400 mb-8 font-medium">{authUser.email}</p>
                  
                  <div className="grid grid-cols-2 gap-6 w-full max-w-lg mb-10">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">موجودی کیف پول</p>
                      <p className="text-2xl font-black text-cyan-400">{dbUser?.balance || 0} <span className="text-xs">تومان</span></p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">سطح کاربری</p>
                      <p className="text-2xl font-black text-teal-400 uppercase">{dbUser?.role || 'User'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full max-w-sm">
                    <button onClick={() => setCurrentView(View.WALLET)} className="w-full bg-cyan-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-cyan-500/20">
                      افزایش موجودی
                    </button>
                    <button onClick={() => firebaseLogout()} className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-2xl font-black text-lg">
                      خروج از حساب کاربر
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Support Hub */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-4xl z-50">
        <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 p-2 md:p-4 rounded-full flex items-center justify-between shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 md:gap-4 mr-2 md:mr-3 shrink-0">
             <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-cyan-500/50 overflow-hidden ring-4 ring-cyan-500/10">
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100" alt="Support" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-teal-500 border-2 border-slate-950 rounded-full shadow-[0_0_15px_#14b8a6]" />
             </div>
             <div className="hidden xs:block">
                <p className="text-[12px] md:text-sm font-black text-white leading-none mb-1">مرکز پشتیبانی</p>
                <div className="flex items-center gap-1.5">
                   <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-teal-500 animate-pulse" />
                   <p className="text-[8px] md:text-[10px] text-teal-400 font-bold uppercase tracking-wider">Online</p>
                </div>
             </div>
          </div>
          
          <div className="flex gap-1.5 md:gap-2">
            <button className="bg-white/5 hover:bg-white/10 p-2 md:p-3 rounded-full text-white transition-all">
               <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
            <button className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:scale-105 active:scale-95 transition-all text-white px-4 md:px-8 py-2 md:py-3 rounded-full font-black text-xs md:text-md flex items-center gap-2 md:gap-3 shadow-[0_0_20px_rgba(34,211,238,0.3)] group whitespace-nowrap">
              گفتگو با کارشناس
              <Send size={16} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      <footer className="container mx-auto px-6 py-20 text-center relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-12" />
        <div className="flex flex-col items-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
           <VidonetLogo className="w-16 h-16 grayscale" />
           <p className="text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase">Vidonet Core Integrity</p>
        </div>
        <p className="text-[11px] text-slate-600 mt-8 font-medium italic">© ۲۰۲۶ VIDONET. Powered by V2Ray Core Architecture. تمامی حقوق محفوظ است.</p>
      </footer>
    </div>
  );
}
