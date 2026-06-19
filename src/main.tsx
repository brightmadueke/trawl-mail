import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import App from "@/App.tsx";

// This disables the default context menu when you right-click on the window
document.addEventListener("contextmenu", (e) => e.preventDefault());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <App />
      </TooltipProvider>
      <Toaster closeButton={true} className="select-none" />
    </ThemeProvider>
  </React.StrictMode>,
);
