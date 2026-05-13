import { Outlet } from "react-router-dom";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import { ToastViewport } from "../state/ToastContext.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-shell">
      <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col lg:flex-row">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar />
          <main className="flex-1 px-5 pb-10 pt-6 sm:px-8 lg:px-10">
            <Outlet />
          </main>
        </div>
      </div>
      <ToastViewport />
    </div>
  );
}
