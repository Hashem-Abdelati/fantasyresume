import { useMemo, useState } from "react";
import ArcaneCard from "../components/ArcaneCard";
import { Mail, Github, Linkedin, Feather, Sparkles } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const ravenAddress = "abdelatihashem@gmail.com";

  const mailtoHref = useMemo(() => {
    const subject = `Raven from ${form.name || "A Fellow Traveler"}`;
    const body = [
      `Name: ${form.name || "-"}`,
      `Email: ${form.email || "-"}`,
      ``,
      `Message:`,
      form.message || "-",
      ``,
      `---`,
      `Sent via Hashem's Resume Codex`,
    ].join("\n");

    return `mailto:${ravenAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [form, ravenAddress]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    window.location.href = mailtoHref; // opens user email app
    setSent(true);
  };

  return (
    <section className="character-screen">
      <div className="character-rings" />

      <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
        {/* Left: Send a Raven */}
        <ArcaneCard
          title="Send a Raven"
          subtitle="Dispatch a message to the Codex Keeper"
        >
          {!sent ? (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="rounded-2xl border border-[rgba(255,215,140,0.18)] bg-[rgba(0,0,0,0.22)] p-4">
                <p className="font-cinzel text-sm tracking-[0.12em] text-[rgba(255,240,196,0.85)]">
                  RAVEN PROTOCOL
                </p>
                <p className="mt-1 font-imfell text-[rgba(255,255,255,0.72)]">
                  Fill the scroll, seal it, and your mail client will carry the message.
                </p>
              </div>

              <div>
                <label className="block font-cinzel text-xs tracking-[0.1em] text-[rgba(255,240,196,0.75)]">
                  Your Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Elara Nightwind"
                  className="mt-1.5 w-full rounded-xl border border-[rgba(255,215,140,0.18)] bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[rgba(255,215,140,0.45)] focus:ring-2 focus:ring-[rgba(255,215,140,0.18)]"
                />
              </div>

              <div>
                <label className="block font-cinzel text-xs tracking-[0.1em] text-[rgba(255,240,196,0.75)]">
                  Your Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@realm.com"
                  className="mt-1.5 w-full rounded-xl border border-[rgba(255,215,140,0.18)] bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[rgba(255,215,140,0.45)] focus:ring-2 focus:ring-[rgba(255,215,140,0.18)]"
                />
              </div>

              <div>
                <label className="block font-cinzel text-xs tracking-[0.1em] text-[rgba(255,240,196,0.75)]">
                  Message Scroll
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Write your message to Hashem..."
                  className="mt-1.5 h-36 w-full resize-y rounded-xl border border-[rgba(255,215,140,0.18)] bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[rgba(255,215,140,0.45)] focus:ring-2 focus:ring-[rgba(255,215,140,0.18)]"
                />
              </div>

              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-xl border border-[rgba(255,215,140,0.32)] bg-[linear-gradient(180deg,rgba(255,227,160,0.16),rgba(255,206,110,0.08))] px-4 py-2.5 font-cinzel text-sm tracking-[0.08em] text-[rgba(255,240,196,0.98)] transition hover:translate-y-[-1px] hover:shadow-[0_0_24px_rgba(255,215,140,0.25)]"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  <Feather className="h-4 w-4" />
                  Seal & Send Raven
                </span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.24),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
              </button>

              <p className="text-xs text-white/55">
                This opens your default email app and sends to{" "}
                <span className="text-[rgba(255,240,196,0.9)]">{ravenAddress}</span>.
              </p>
            </form>
          ) : (
            <div className="rounded-2xl border border-[rgba(255,215,140,0.24)] bg-[rgba(0,0,0,0.22)] p-5">
              <div className="flex items-center gap-2 text-[rgba(255,240,196,0.95)]">
                <Sparkles className="h-4 w-4" />
                <p className="font-cinzel tracking-[0.08em]">RAVEN DISPATCHED</p>
              </div>
              <p className="mt-2 font-imfell text-lg text-white/80">
                Your message scroll has been prepared. If your mail app did not open, use the direct sigil below.
              </p>
              <a
                href={mailtoHref}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[rgba(255,215,140,0.24)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[rgba(255,240,196,0.95)] hover:bg-[rgba(255,255,255,0.08)]"
              >
                <Mail className="h-4 w-4" />
                Open Raven Link
              </a>
            </div>
          )}
        </ArcaneCard>

        {/* Right: Other channels */}
        <ArcaneCard title="Other Channels" subtitle="Guild links & direct contact">
          <div className="space-y-3">
            <a
              href="mailto:abdelatihashem@gmail.com"
              className="group flex items-center justify-between rounded-xl border border-[rgba(255,215,140,0.18)] bg-black/20 px-3 py-3 transition hover:bg-black/30"
            >
              <span className="inline-flex items-center gap-2 text-white/90">
                <Mail className="h-4 w-4 text-[rgba(255,215,140,0.95)]" />
                Email
              </span>
              <span className="text-xs text-white/60 group-hover:text-white/80">
                abdelatihashem@gmail.com
              </span>
            </a>

            <a
              href="https://www.linkedin.com/in/hashem-abdelati/"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-xl border border-[rgba(255,215,140,0.18)] bg-black/20 px-3 py-3 transition hover:bg-black/30"
            >
              <span className="inline-flex items-center gap-2 text-white/90">
                <Linkedin className="h-4 w-4 text-[rgba(255,215,140,0.95)]" />
                LinkedIn
              </span>
              <span className="text-xs text-white/60 group-hover:text-white/80">
                Hashem Abdelati
              </span>
            </a>

            <a
              href="https://github.com/Hashem-Abdelati"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-xl border border-[rgba(255,215,140,0.18)] bg-black/20 px-3 py-3 transition hover:bg-black/30"
            >
              <span className="inline-flex items-center gap-2 text-white/90">
                <Github className="h-4 w-4 text-[rgba(255,215,140,0.95)]" />
                GitHub
              </span>
              <span className="text-xs text-white/60 group-hover:text-white/80">
                Hashem-Abdelati
              </span>
            </a>
          </div>

          <div className="mt-4 rounded-xl border border-[rgba(255,215,140,0.14)] bg-[rgba(255,255,255,0.03)] p-3">
            <p className="font-cinzel text-xs tracking-[0.1em] text-[rgba(255,240,196,0.8)]">
              RESPONSE NOTE
            </p>
            <p className="mt-1 text-sm text-white/70">
              Best for opportunities, collaborations, internships, and project discussions.
            </p>
          </div>
        </ArcaneCard>
      </div>
    </section>
  );
}
