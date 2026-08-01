"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileArchive,
  LayoutDashboard,
  BookOpen,
  Sun,
  Moon,
  Menu,
  X,
  Zap,
} from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(true);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const navLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Docs",
      href: "/docs",
      icon: BookOpen,
    },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-b border-slate-800/40 bg-slate-950/60 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ZIP Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform duration-200 active:scale-95"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 shadow-md transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(38,208,124,0.4)]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 transition-colors duration-300 group-hover:bg-slate-900">
              <Zap className="h-5 w-5 text-emerald-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                ZIP
              </span>
              <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                NUCLEUS
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
              Context Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} />
                <span>{link.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#26d07c]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & External Links */}
        <div className="hidden items-center gap-3 md:flex">
          {/* GitHub Button */}
          <a
            href="https://github.com/anushka-j18/InnovaHack-Round-2---Nucleus"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-200 hover:text-white"
            >
              <GithubIcon className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>GitHub</span>
            </Button>
          </a>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="h-9 w-9 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all duration-200"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-cyan-400 transition-transform duration-300 hover:-rotate-12" />
            )}
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="h-9 w-9 border border-slate-800 text-slate-300"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-cyan-400" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="h-9 w-9 border border-slate-800 text-slate-200 hover:bg-slate-800"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-emerald-400" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pb-6 pt-3 md:hidden">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-emerald-400" : "text-slate-400")} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-2">
              <a
                href="https://github.com/anushka-j18/InnovaHack-Round-2---Nucleus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <GithubIcon className="h-4 w-4" />
                <span>Star on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
