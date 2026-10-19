import { Route, Routes, Navigate } from "react-router-dom";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Experience from "../pages/Experience";
import Contact from "../pages/Contact";
import Inventory from "../pages/Inventory";
import AppShell from "./AppShell";
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={null} />
        <Route path="/hub" element={null} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      {Object.entries({
        "/character": "/about",
        "/quests": "/projects",
        "/journey": "/experience",
        "/raven": "/contact",
        "/grand-hall": "/hub",
      }).map(([from, to]) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
