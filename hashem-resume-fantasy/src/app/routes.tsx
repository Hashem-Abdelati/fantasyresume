import { Route, Routes, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import Hub from "../pages/Hub";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Experience from "../pages/Experience";
import Contact from "../pages/Contact";
import AppShell from "./AppShell";
import Inventory from "../pages/Inventory";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Main “world” */}
      <Route element={<AppShell />}>
        <Route path="/hub" element={<Hub />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/inventory" element={<Inventory />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
