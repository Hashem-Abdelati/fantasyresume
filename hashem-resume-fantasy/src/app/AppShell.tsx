import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-obsidian text-parchment">
      <div className="fixed inset-0 pointer-events-none bg-aurora opacity-40" />
      <NavBar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24">
        <Outlet />
      </main>
    </div>
  );
}
