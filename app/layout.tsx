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
    <html lang="en" className={`scroll-smooth ${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased transition-colors duration-300">
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-background">
            <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
              {children}
            </div>
            
            <footer className="mt-20 px-10 py-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="text-xs font-black">E</span>
                </div>
                <span>© 2026 ETHARA AI SYSTEMS. ALL RIGHTS RESERVED.</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="hover:text-primary transition-colors cursor-pointer">Security Protocol</span>
                <span className="hover:text-primary transition-colors cursor-pointer text-primary/80">Created by Harshank</span>
                <span className="text-gray-400 bg-surface px-3 py-1 rounded-full border border-border tracking-widest">V2.4.0-STABLE</span>
              </div>
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}
