import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory PRO | Enterprise Management",
  description: "Next-generation inventory and order management system for modern enterprises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}>
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
          {/* Main Sidebar Component */}
          <Sidebar />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {/* Background Decor Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
               <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
               <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Content Container */}
            <div className="p-4 sm:p-6 lg:p-10">
              {children}
            </div>
            
            {/* Global Footer (Visible on Scroll) */}
            <footer className="mt-20 px-10 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
              <div>© 2026 INVENTORY PRO SYSTEMS. ALL RIGHTS RESERVED.</div>
              <div className="flex items-center gap-6">
                <span className="hover:text-indigo-400 transition-colors cursor-pointer">Security Protocol</span>
                <span className="hover:text-indigo-400 transition-colors cursor-pointer">API Documentation</span>
                <span className="text-gray-400">V2.4.0-STABLE</span>
              </div>
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}
