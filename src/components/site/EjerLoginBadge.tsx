"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function EjerLoginBadge({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const r = await fetch("/api/unread", { cache: "no-store" });
        const j = await r.json();
        if (!cancelled && typeof j.count === "number") setCount(j.count);
      } catch {}
    };
    fetchCount();
    const id = setInterval(fetchCount, 3000);
    const onFocus = () => fetchCount();
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchCount();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    // lyt til admin-handlinger der dispatcher event
    const onUpdated = () => fetchCount();
    window.addEventListener("messages-updated", onUpdated);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("messages-updated", onUpdated);
    };
  }, []);

  return (
    <Link href="/admin/login" className="relative inline-flex items-center gap-1.5 hover:text-slate-300">
      Ejer-login
      {count > 0 ? (
        <span
          aria-label={`${count} ulæste beskeder`}
          className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[#991b1b] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white ring-2 ring-slate-900"
          style={{ backgroundColor: "#991b1b" }}
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
