import { useMemo, useState } from "react";
import { LogOut, MessageCircle, Plus, RotateCcw, Trash2, Lock } from "lucide-react";
import { DEMO_ADMIN_PASSCODE } from "../lib/config";
import { store } from "../lib/store";
import { useShopData } from "../lib/useShopData";
import { formatDate, formatPrice, formatTime, toDateKey } from "../lib/format";
import type { Booking, BookingStatus, Service } from "../lib/types";

const SESSION_KEY = "barberbook:admin";

function readSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: "bg-amber-400/15 text-amber-300 border-amber-400/40",
  confirmed: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
  completed: "bg-sky-400/15 text-sky-300 border-sky-400/40",
  cancelled: "bg-neutral-500/15 text-neutral-400 border-neutral-500/40",
};

/** 0123456789 -> 60123456789 for a wa.me link */
function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "60" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}

export default function Admin() {
  const [authed, setAuthed] = useState(readSession);
  return authed ? <Dashboard onLogout={() => setAuthed(false)} /> : <Login onOk={() => setAuthed(true)} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <div className="w-14 h-14 rounded-xl bg-accent text-ink flex items-center justify-center mb-6">
        <Lock size={24} />
      </div>
      <h1 className="font-display uppercase text-4xl text-white mb-2">Admin</h1>
      <p className="text-neutral-400 text-sm mb-8">
        Demo passcode: <code className="font-mono text-accent">{DEMO_ADMIN_PASSCODE}</code>
        <br />
        This is a demo only. A real shop would use proper sign-in.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code === DEMO_ADMIN_PASSCODE) {
            try {
              sessionStorage.setItem(SESSION_KEY, "1");
            } catch {
              // Session storage blocked: the dashboard still opens for this visit.
            }
            onOk();
          } else {
            setError(true);
          }
        }}
        className="space-y-4"
      >
        <label htmlFor="passcode" className="block text-sm text-neutral-300">
          Passcode
        </label>
        <input
          id="passcode"
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          autoComplete="off"
          className="w-full rounded-lg bg-panel border border-line px-4 py-3 text-white focus:border-accent focus:outline-none"
        />
        {error && (
          <p role="alert" className="text-sm text-red-400">
            Wrong passcode.
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-accent text-ink font-semibold py-3 hover:bg-amber-300 transition-colors"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { services, barbers, bookings, loading, reload } = useShopData();
  const [tab, setTab] = useState<"bookings" | "services">("bookings");
  const [date, setDate] = useState(toDateKey(new Date()));
  const [showAll, setShowAll] = useState(false);

  const todayKey = toDateKey(new Date());
  const serviceOf = (id: string) => services.find((s) => s.id === id);
  const barberName = (id: string) => barbers.find((b) => b.id === id)?.name ?? "Unknown";

  const visible = useMemo(() => {
    return bookings
      .filter((b) => showAll || b.date === date)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [bookings, date, showAll]);

  const todays = bookings.filter((b) => b.date === todayKey && b.status !== "cancelled");
  const pending = bookings.filter((b) => b.status === "pending").length;
  const todaysRevenue = todays.reduce((sum, b) => sum + (serviceOf(b.serviceId)?.price ?? 0), 0);

  async function setStatus(b: Booking, status: BookingStatus) {
    await store.updateBookingStatus(b.id, status);
    await reload();
  }

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-16 text-neutral-400">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display uppercase text-4xl text-white">Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (confirm("Reset all demo data back to the starting examples?")) {
                await store.resetDemoData();
                await reload();
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line text-sm text-neutral-300 hover:border-accent transition-colors"
          >
            <RotateCcw size={15} /> Reset demo
          </button>
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem(SESSION_KEY);
              } catch {
                // Nothing to clear.
              }
              onLogout();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line text-sm text-neutral-300 hover:border-accent transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Bookings today", value: String(todays.length) },
          { label: "Waiting for confirmation", value: String(pending) },
          { label: "Expected today", value: formatPrice(todaysRevenue) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-panel p-5">
            <p className="text-sm text-neutral-400">{s.label}</p>
            <p className="font-display text-4xl text-accent mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-line" role="tablist">
        {(["bookings", "services"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-accent text-accent"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "bookings" && (
        <>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <label className="text-sm text-neutral-300 flex items-center gap-2">
              Date
              <input
                type="date"
                value={date}
                disabled={showAll}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="rounded-lg bg-panel border border-line px-3 py-2 text-white disabled:opacity-50 [color-scheme:dark]"
              />
            </label>
            <label className="text-sm text-neutral-300 flex items-center gap-2">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="accent-amber-400"
              />
              Show all dates
            </label>
          </div>

          {visible.length === 0 ? (
            <p className="text-neutral-400 py-10">No bookings for this selection.</p>
          ) : (
            <ul className="space-y-3">
              {visible.map((b) => {
                const svc = serviceOf(b.serviceId);
                return (
                  <li
                    key={b.id}
                    className="rounded-xl border border-line bg-panel p-5 flex flex-wrap items-center gap-x-8 gap-y-4"
                  >
                    <div className="min-w-[110px]">
                      <p className="font-display text-2xl text-white">{formatTime(b.time)}</p>
                      <p className="text-xs text-neutral-500">{formatDate(b.date)}</p>
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <p className="text-white font-medium">{b.customerName}</p>
                      <p className="text-sm text-neutral-400">
                        {svc?.name ?? "Removed service"} · with {barberName(b.barberId)}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {b.code} · {b.phone}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${STATUS_STYLE[b.status]}`}
                    >
                      {b.status}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {b.status === "pending" && (
                        <ActionButton onClick={() => setStatus(b, "confirmed")} primary>
                          Confirm
                        </ActionButton>
                      )}
                      {b.status === "confirmed" && (
                        <ActionButton onClick={() => setStatus(b, "completed")} primary>
                          Mark done
                        </ActionButton>
                      )}
                      {(b.status === "pending" || b.status === "confirmed") && (
                        <ActionButton onClick={() => setStatus(b, "cancelled")}>Cancel</ActionButton>
                      )}
                      <a
                        href={whatsappLink(b.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-line text-sm text-neutral-300 hover:border-accent transition-colors"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {tab === "services" && <ServicesTab services={services} reload={reload} />}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        primary
          ? "bg-accent text-ink hover:bg-amber-300"
          : "border border-line text-neutral-300 hover:border-red-400 hover:text-red-300"
      }`}
    >
      {children}
    </button>
  );
}

function ServicesTab({ services, reload }: { services: Service[]; reload: () => Promise<void> }) {
  const [message, setMessage] = useState<string | null>(null);

  async function save(s: Service) {
    setMessage(null);
    if (!s.name.trim() || s.name.length > 60) return setMessage("Name must be 1 to 60 characters.");
    if (!(s.price >= 0 && s.price <= 1000)) return setMessage("Price must be between 0 and 1000.");
    if (!(s.duration >= 15 && s.duration <= 180 && s.duration % 15 === 0))
      return setMessage("Duration must be 15 to 180 minutes, in steps of 15.");
    await store.saveService({ ...s, name: s.name.trim(), description: s.description.trim() });
    await reload();
    setMessage("Saved.");
  }

  async function remove(id: string) {
    setMessage(null);
    if (!confirm("Delete this service?")) return;
    try {
      await store.deleteService(id);
      await reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not delete the service.");
    }
  }

  return (
    <div>
      {message && (
        <p role="status" className="mb-4 text-sm text-amber-300">
          {message}
        </p>
      )}
      <ul className="space-y-3">
        {services.map((s) => (
          <ServiceRow key={s.id} service={s} onSave={save} onDelete={() => remove(s.id)} />
        ))}
      </ul>
      <button
        onClick={() =>
          save({
            id: crypto.randomUUID(),
            name: "New service",
            description: "Describe this service.",
            price: 30,
            duration: 30,
          })
        }
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line text-sm text-neutral-300 hover:border-accent transition-colors"
      >
        <Plus size={15} /> Add service
      </button>
    </div>
  );
}

function ServiceRow({
  service,
  onSave,
  onDelete,
}: {
  service: Service;
  onSave: (s: Service) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(service);
  const dirty = JSON.stringify(draft) !== JSON.stringify(service);
  const field =
    "rounded-lg bg-ink border border-line px-3 py-2 text-white text-sm focus:border-accent focus:outline-none";

  return (
    <li className="rounded-xl border border-line bg-panel p-5 grid gap-3 sm:grid-cols-[1.5fr_2fr_90px_90px_auto] items-end">
      <label className="text-xs text-neutral-500 grid gap-1">
        Name
        <input
          className={field}
          value={draft.name}
          maxLength={60}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      </label>
      <label className="text-xs text-neutral-500 grid gap-1">
        Description
        <input
          className={field}
          value={draft.description}
          maxLength={160}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </label>
      <label className="text-xs text-neutral-500 grid gap-1">
        Price (RM)
        <input
          className={field}
          type="number"
          min={0}
          max={1000}
          value={draft.price}
          onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
        />
      </label>
      <label className="text-xs text-neutral-500 grid gap-1">
        Minutes
        <input
          className={field}
          type="number"
          min={15}
          max={180}
          step={15}
          value={draft.duration}
          onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })}
        />
      </label>
      <div className="flex gap-2">
        <button
          disabled={!dirty}
          onClick={() => onSave(draft)}
          className="px-3 py-2 rounded-lg bg-accent text-ink text-sm font-semibold disabled:opacity-40 hover:bg-amber-300 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onDelete}
          aria-label={`Delete ${service.name}`}
          className="px-3 py-2 rounded-lg border border-line text-neutral-400 hover:border-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}
