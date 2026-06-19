import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "switch" | "button";
}

export function ThemeToggle({
  className,
  variant = "button",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return variant === "switch" ? (
      <div
        className={cn(
          "h-7 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse",
          className,
        )}
      />
    ) : (
      <div className={cn("p-2 w-9 h-9", className)} />
    );
  }

  const isDark = theme === "dark";

  if (variant === "switch") {
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-300",
          isDark ? "bg-zinc-800" : "bg-zinc-200",
          className,
        )}
        aria-label="Toggle theme"
      >
        <span
          className={cn(
            "pointer-events-none flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            isDark ? "translate-x-5" : "translate-x-0",
          )}
        >
          {isDark ? (
            <Moon className="h-2.5 w-2.5 text-zinc-950" />
          ) : (
            <Sun className="h-2.5 w-2.5 text-zinc-500" />
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors",
        className,
      )}
      aria-label="Toggle theme"
    >
      <Sun className="w-[18px] h-[18px] dark:hidden" />
      <Moon className="w-[18px] h-[18px] hidden dark:block" />
    </button>
  );
}
