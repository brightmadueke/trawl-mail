// src/App.tsx

import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { AppHeader, HEADER_HEIGHT } from "@/components/app-header.tsx";
import { Inbox } from "@/components/inbox.tsx";
import React, { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Logs from "@/components/logs.tsx";
import { AppProvider } from "@/components/app-context";
import Settings from "@/components/settings.tsx";

function App() {
  useEffect(() => {
    const setup = async () => {
      await getCurrentWindow().show();
    };
    setup();
  }, []);

  return (
    <AppProvider>
      <Router>
        <SidebarProvider>
          <div
            className="bg-linear-to-br from-green-200 dark:from-green-900 from-5% via-sidebar-accent via-15% to-sidebar border-none flex flex-col h-screen w-full overflow-hidden select-none"
            style={
              {
                "--header-height": HEADER_HEIGHT,
              } as React.CSSProperties
            }
          >
            <AppHeader />

            <div className="flex flex-1 min-h-0 w-full">
              <AppSidebar />

              <main className="bg-inherit border-none flex-1 overflow-hidden rounded-lg rounded-br-none">
                <div className="h-full w-full">
                  <Routes>
                    <Route index element={<Inbox />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </Router>
    </AppProvider>
  );
}

export default App;
