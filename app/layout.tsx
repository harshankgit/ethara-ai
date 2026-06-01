import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Inventory PRO | Enterprise Intelligence",
  description: "Advanced inventory and order management system by Ethara AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark scroll-smooth ${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans bg-[#020617] text-gray-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
          {/* Main Sidebar Component */}
          <Sidebar />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden bg-[#020617]">
               <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
               <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            {/* Content Container */}
            <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
              {children}
            </div>
            
            {/* Global Footer */}
            <footer className="mt-20 px-10 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg">
                  <span className="text-xs font-black">E</span>
                </div>
                <span>© 2026 ETHARA AI SYSTEMS. ALL RIGHTS RESERVED.</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="hover:text-indigo-400 transition-colors cursor-pointer">Security Protocol</span>
                <span className="hover:text-indigo-400 transition-colors cursor-pointer text-indigo-500/80">Created by Harshank</span>
                <span className="text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10 tracking-widest">V2.4.0-STABLE</span>
              </div>
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}
