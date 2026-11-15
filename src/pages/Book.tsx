import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { store } from "../lib/store";
import { useShopData } from "../lib/useShopData";
import { bookableDates, getAvailableSlots, isClosedOn } from "../lib/slots";
import {
  formatDate,
  formatPrice,
  formatTime,
  fromDateKey,
  isValidPhone,
  normalisePhone,
} from "../lib/format";
import type { Booking } from "../lib/types";

const STEPS = ["Service", "Barber", "Date & time", "Your details"] as const;

export default function Book() {
  const [params] = useSearchParams();
  const { services, barbers, bookings, loading, reload } = useShopData();

  const preselected = params.get("service");
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string>("any");
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<{ time: string; barberId: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);

  // Preselect a service from ?service=, once, when services have loaded.
  const effectiveServiceId =
    serviceId ??
    (preselected && services.some((s) => s.id === preselected) ? preselected : null);
  const service = services.find((s) => s.id === effectiveServiceId) ?? null;

  // Skip the service step when it came from the URL.
  const activeStep = serviceId === null && effectiveServiceId && step === 0 ? 1 : step;

  const dates = useMemo(() => bookableDates(), []);

  const slots = useMemo(() => {
    if (!service || !date) return [];
    return getAvailableSlots({
      dateKey: date,
      service,
      barberId,
      barbers,
      bookings,
      services,
    });
  }, [service, date, barberId, barbers, bookings, services]);

  const barberName = (id: string) => barbers.find((b) => b.id === id)?.name ?? "";

  function pickService(id: string) {
    setServiceId(id);
    setDate(null);
    setSlot(null);
    setStep(1);
  }

  function pickBarber(id: string) {
    setBarberId(id);
    setDate(null);
    setSlot(null);
    setStep(2);
  }

  async function submit() {
    setError(null);
    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 60) {
      setError("Please enter your name (2 to 60 characters).");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number, for example 012-345 6789.");
      return;
    }
    if (!service || !date || !slot) return;

    setSubmitting(true);
    try {
      const booking = await store.createBooking({
        serviceId: service.id,
        barberId: slot.barberId,
        date,
        time: slot.time,
        customerName: cleanName,
        phone: normalisePhone(phone),
      });
      setDone(booking);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      await reload();
      setSlot(null);
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-6 py-24 text-neutral-400">Loading…</div>;
  }

  if (done && service) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center rise">
        <CheckCircle2 size={56} className="text-accent mx-auto mb-5" />
        <h1 className="font-display uppercase text-4xl text-white mb-2">You're booked</h1>
        <p className="text-neutral-400 mb-8">
          Thanks, {done.customerName}. Show this code when you arrive.
        </p>
        <div className="rounded-xl border border-accent/50 bg-panel p-6 text-left">
          <p className="font-display text-4xl text-accent tracking-widest text-center mb-6">
            {done.code}
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-neutral-500">Service</dt>
            <dd className="text-white">{service.name}</dd>
            <dt className="text-neutral-500">Barber</dt>
            <dd className="text-white">{barberName(done.barberId)}</dd>
            <dt className="text-neutral-500">When</dt>
            <dd className="text-white">
              {formatDate(done.date, { year: "numeric" })}, {formatTime(done.time)}
            </dd>
            <dt className="text-neutral-500">Price</dt>
            <dd className="text-white">{formatPrice(service.price)}, pay at the shop</dd>
          </dl>
        </div>
        <p className="mt-6 text-xs text-neutral-500">
          Demo: this booking is stored in your browser only.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/admin"
            className="px-5 py-3 rounded-lg border border-line text-white hover:border-accent transition-colors"
          >
            See it in admin
          </Link>
          <Link
            to="/"
            className="px-5 py-3 rounded-lg bg-accent text-ink font-semibold hover:bg-amber-300 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display uppercase text-4xl sm:text-5xl text-white mb-8">
        Book an appointment
      </h1>

      {/* Stepper */}
      <ol className="flex flex-wrap gap-2 mb-10" aria-label="Booking steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === activeStep ? "step" : undefined}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              i === activeStep
                ? "bg-accent text-ink border-accent"
                : i < activeStep
                  ? "border-accent/50 text-accent"
                  : "border-line text-neutral-500"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
        <div>
          {activeStep > 0 && (
            <button
              onClick={() => {
                setError(null);
                if (activeStep === 1 && !serviceId) setServiceId(effectiveServiceId);
                setStep(activeStep - 1);
              }}
              className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white mb-6"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}

          {/* Step 0: service */}
          {activeStep === 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => pickService(s.id)}
                  className={`text-left rounded-xl border p-5 transition-colors ${
                    effectiveServiceId === s.id
                      ? "border-accent bg-accent/10"
                      : "border-line bg-panel hover:border-accent/60"
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold text-white">{s.name}</span>
                    <span className="text-accent font-semibold">{formatPrice(s.price)}</span>
                  </div>
                  <p className="text-sm text-neutral-400 mt-1">{s.description}</p>
                  <p className="text-xs text-neutral-500 mt-3">{s.duration} min</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: barber */}
          {activeStep === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {[{ id: "any", name: "Any available", role: "Earliest free barber" }, ...barbers].map(
                (b) => (
                  <button
                    key={b.id}
                    onClick={() => pickBarber(b.id)}
                    className={`text-left rounded-xl border p-5 transition-colors ${
                      barberId === b.id
                        ? "border-accent bg-accent/10"
                        : "border-line bg-panel hover:border-accent/60"
                    }`}
                  >
                    <span className="block font-semibold text-white">{b.name}</span>
                    <span className="block text-sm text-neutral-400">{b.role}</span>
                  </button>
                ),
              )}
            </div>
          )}

          {/* Step 2: date and time */}
          {activeStep === 2 && service && (
            <div>
              <h2 className="text-white font-semibold mb-3">Pick a day</h2>
              <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
                {dates.map((d) => {
                  const closed = isClosedOn(d);
                  const dt = fromDateKey(d);
                  return (
                    <button
                      key={d}
                      disabled={closed}
                      onClick={() => {
                        setDate(d);
                        setSlot(null);
                      }}
                      className={`shrink-0 w-16 rounded-xl border py-3 text-center transition-colors ${
                        date === d
                          ? "border-accent bg-accent text-ink"
                          : closed
                            ? "border-line text-neutral-600 cursor-not-allowed"
                            : "border-line bg-panel text-white hover:border-accent/60"
                      }`}
                      aria-label={`${formatDate(d)}${closed ? ", closed" : ""}`}
                    >
                      <span className="block text-xs uppercase opacity-80">
                        {dt.toLocaleDateString("en-MY", { weekday: "short" })}
                      </span>
                      <span className="block font-display text-2xl leading-tight">
                        {dt.getDate()}
                      </span>
                      <span className="block text-xs opacity-80">
                        {closed ? "Closed" : dt.toLocaleDateString("en-MY", { month: "short" })}
                      </span>
                    </button>
                  );
                })}
              </div>

              {date && (
                <div className="mt-8">
                  <h2 className="text-white font-semibold mb-3">
                    Available times on {formatDate(date)}
                  </h2>
                  {slots.length === 0 ? (
                    <p className="text-neutral-400">
                      No free times on this day. Try another day or barber.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {slots.map((s) => (
                        <button
                          key={s.time}
                          onClick={() => {
                            setSlot(s);
                            setStep(3);
                          }}
                          className={`rounded-lg border py-3 text-sm font-medium transition-colors ${
                            slot?.time === s.time
                              ? "border-accent bg-accent text-ink"
                              : "border-line bg-panel text-white hover:border-accent/60"
                          }`}
                        >
                          {formatTime(s.time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {error && (
                <p role="alert" className="mt-6 text-sm text-red-400">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Step 3: details */}
          {activeStep === 3 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-5 max-w-md"
              noValidate
            >
              <div>
                <label htmlFor="name" className="block text-sm text-neutral-300 mb-2">
                  Your name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  autoComplete="name"
                  className="w-full rounded-lg bg-panel border border-line px-4 py-3 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none"
                  placeholder="e.g. Ahmad"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm text-neutral-300 mb-2">
                  Phone number
                </label>
                <input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  className="w-full rounded-lg bg-panel border border-line px-4 py-3 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none"
                  placeholder="e.g. 012-345 6789"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Demo only: your details stay in your browser.
                </p>
              </div>
              {error && (
                <p role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-accent text-ink font-semibold py-4 hover:bg-amber-300 transition-colors disabled:opacity-60"
              >
                {submitting ? "Booking…" : "Confirm booking"}
              </button>
            </form>
          )}
        </div>

        {/* Summary */}
        <aside className="rounded-xl border border-line bg-panel p-6 lg:sticky lg:top-24">
          <h2 className="font-display uppercase text-xl text-white mb-4">Your booking</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-neutral-500">Service</dt>
              <dd className="text-white">
                {service ? `${service.name} · ${formatPrice(service.price)}` : "Not chosen yet"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Barber</dt>
              <dd className="text-white">
                {slot
                  ? barberName(slot.barberId)
                  : barberId === "any"
                    ? "Any available"
                    : barberName(barberId)}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">When</dt>
              <dd className="text-white">
                {date && slot ? `${formatDate(date)}, ${formatTime(slot.time)}` : "Not chosen yet"}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-neutral-500">Pay at the shop.</p>
        </aside>
      </div>
    </div>
  );
}
