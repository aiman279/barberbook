import { Link } from "react-router-dom";
import { Clock, MapPin, ArrowRight, Info } from "lucide-react";
import { CLOSE_MIN, OPEN_MIN, SHOP } from "../lib/config";
import { formatPrice, formatTime, minutesToTime } from "../lib/format";
import { useShopData } from "../lib/useShopData";

export default function Home() {
  const { services, barbers } = useShopData();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fbbf24 0 2px, transparent 2px 22px)",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32 rise">
          <p className="text-accent font-medium tracking-[0.25em] uppercase text-sm mb-5">
            Barbershop · Kuala Lumpur
          </p>
          <h1 className="font-display uppercase text-5xl sm:text-7xl lg:text-8xl leading-[0.95] text-white max-w-4xl">
            Look sharp.
            <br />
            <span className="text-accent">Book in 60 seconds.</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-xl">{SHOP.tagline} Pick a
            service, choose your barber and grab a time that suits you.</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-lg bg-accent text-ink font-semibold hover:bg-amber-300 transition-colors"
            >
              Book an appointment <ArrowRight size={18} />
            </Link>
            <a href="#services" className="text-neutral-300 hover:text-white font-medium">
              See services
            </a>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-neutral-400">
            <span className="inline-flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              Mon–Sat, {formatTime(minutesToTime(OPEN_MIN))} – {formatTime(minutesToTime(CLOSE_MIN))}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-accent" />
              {SHOP.address}
            </span>
          </div>
        </div>
      </section>

      {/* Demo notice */}
      <div className="bg-accent/10 border-b border-accent/30">
        <div className="max-w-6xl mx-auto px-6 py-3 text-sm text-amber-200 flex items-start gap-2">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            This is a live demo. Make a test booking, then open the{" "}
            <Link to="/admin" className="underline font-medium">
              admin dashboard
            </Link>{" "}
            to see it arrive. Demo passcode: <code className="font-mono">demo1234</code>.
          </p>
        </div>
      </div>

      {/* Services */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display uppercase text-4xl text-white mb-2">Services</h2>
        <p className="text-neutral-400 mb-10">Simple prices. Every service starts on time.</p>

        <div className="grid sm:grid-cols-2 gap-5">
          {services.map((s) => (
            <article
              key={s.id}
              className="group rounded-xl border border-line bg-panel p-6 flex flex-col hover:border-accent/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display uppercase text-2xl text-white">{s.name}</h3>
                <span className="font-display text-2xl text-accent shrink-0">
                  {formatPrice(s.price)}
                </span>
              </div>
              <p className="text-neutral-400 mt-2 mb-6 flex-1">{s.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">{s.duration} min</span>
                <Link
                  to={`/book?service=${encodeURIComponent(s.id)}`}
                  className="inline-flex items-center gap-1 text-accent font-medium hover:underline"
                >
                  Book this <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Barbers */}
      <section className="border-t border-line bg-panel/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display uppercase text-4xl text-white mb-10">Your barbers</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {barbers.map((b) => (
              <div key={b.id} className="rounded-xl border border-line bg-ink p-6">
                <div className="w-14 h-14 rounded-full bg-accent text-ink font-display text-2xl flex items-center justify-center mb-4">
                  {b.name.charAt(0)}
                </div>
                <h3 className="text-white font-semibold text-lg">{b.name}</h3>
                <p className="text-neutral-400 text-sm">{b.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display uppercase text-4xl sm:text-5xl text-white mb-6">
          Ready for a fresh cut?
        </h2>
        <Link
          to="/book"
          className="inline-flex items-center gap-2 px-7 py-4 rounded-lg bg-accent text-ink font-semibold hover:bg-amber-300 transition-colors"
        >
          Book now <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
