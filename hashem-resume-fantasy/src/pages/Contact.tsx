import { useState } from "react";
import ArcaneCard from "../components/ArcaneCard";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <ArcaneCard title="Send a Raven" subtitle="Contact form (frontend)">
        {!sent ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div>
              <label className="text-xs text-white/60">Your Name</label>
              <input className="mt-1 w-full rounded-xl bg-black/30 px-3 py-2 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-white/20" />
            </div>
            <div>
              <label className="text-xs text-white/60">Your Email</label>
              <input className="mt-1 w-full rounded-xl bg-black/30 px-3 py-2 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-white/20" />
            </div>
            <div>
              <label className="text-xs text-white/60">Message</label>
              <textarea className="mt-1 h-28 w-full rounded-xl bg-black/30 px-3 py-2 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-white/20" />
            </div>
            <button className="w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15">
              Seal & Send
            </button>
            <p className="text-xs text-white/50">
              Next step: wire this to an email service or serverless function.
            </p>
          </form>
        ) : (
          <div className="text-white/80">
            Raven dispatched. Replace this with a real submission flow when ready.
          </div>
        )}
      </ArcaneCard>

      <ArcaneCard title="Other Channels" subtitle="Professional links">
        <div className="space-y-2 text-white/80">
          <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 ring-1 ring-white/10">
            <span>LinkedIn</span>
            <span className="text-xs text-white/60">add url</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 ring-1 ring-white/10">
            <span>GitHub</span>
            <span className="text-xs text-white/60">add url</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 ring-1 ring-white/10">
            <span>Email</span>
            <span className="text-xs text-white/60">add address</span>
          </div>
        </div>
      </ArcaneCard>
    </div>
  );
}
