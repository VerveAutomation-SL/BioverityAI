"use client";

import { useState, useRef, useEffect } from "react";
import { DoorOpen, CalendarCheck, Dumbbell, CarFront, Smartphone, Building2, ArrowRight, Sparkles } from "lucide-react";

export default function Solutions() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const solutions = [
    {
      id: "access-control",
      title: "Access Control Systems",
      icon: DoorOpen,
      short: "AI-powered secure entry for doors and gates.",
      long: "Enable seamless access using face, fingerprint, palm vein, QR, card, or PIN authentication. Ideal for offices, banks, smart buildings, and high-security zones.",
      gradient: "from-green-500 to-emerald-600",
      bgGlow: "from-green-100 via-emerald-50",
    },
    {
      id: "attendance",
      title: "Employee Attendance System",
      icon: CalendarCheck,
      short: "Cloud-based multi-branch tracking.",
      long: "Track employee, student, or member attendance with cloud dashboards, reports, shift rules, salary/hour calculations, and multi-location monitoring.",
      gradient: "from-blue-500 to-cyan-600",
      bgGlow: "from-blue-100 via-cyan-50",
    },
    {
      id: "mobile-attendance",
      title: "Mobile Face Attendance App",
      icon: Smartphone,
      short: "Turn any phone into a biometric terminal.",
      long: "GPS-enabled mobile attendance with instant sync. Employees can check in/out using face recognition from their smartphones, perfect for remote teams and field workers.",
      gradient: "from-green-600 to-teal-600",
      bgGlow: "from-green-100 via-teal-50",
    },
    {
      id: "elevator",
      title: "Elevator Access Control",
      icon: Building2,
      short: "Floor-specific access control.",
      long: "Allow entry to specific floors based on face or fingerprint recognition. Perfect for residential buildings, corporate offices, and high-security facilities.",
      gradient: "from-blue-600 to-indigo-600",
      bgGlow: "from-blue-100 via-indigo-50",
    },
    {
      id: "parking",
      title: "Parking & UHF RFID System",
      icon: CarFront,
      short: "Automatic entry with RFID.",
      long: "Automated vehicle entry with UHF RFID tags. Includes driver verification, vehicle tracking, and integration with parking management systems.",
      gradient: "from-green-500 to-lime-600",
      bgGlow: "from-green-100 via-lime-50",
    },
    {
      id: "gym",
      title: "Smart Gates Solutions",
      icon: Dumbbell,
      short: "For schools, gyms, pools, offices.",
      long: "Control turnstiles, boom barriers, and entry gates with biometric verification. Prevent unauthorized access and track entry/exit logs in real-time.",
      gradient: "from-cyan-500 to-blue-600",
      bgGlow: "from-cyan-100 via-blue-50",
    },
  ];

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const activeCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeCard && cardRefs.current[activeCard]) {
      activeCardRef.current = cardRefs.current[activeCard];
      setTimeout(() => {
        activeCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      },);
    }
  }, [activeCard]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (solutions.some((s) => s.id === hash)) {
        setActiveCard(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!activeCard) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeCardRef.current &&
        !activeCardRef.current.contains(event.target as Node)
      ) {
        setActiveCard(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [activeCard]);

  return (
    <section id="solutions" className="relative w-full py-20 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-green-50 via-transparent to-blue-50 opacity-40" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '26px 26px',
        opacity: 0.15
      }} />

      <div className="relative max-w-7xl mx-auto px-10 sm:px-16 lg:px-32">

        {/* Heading with Badge */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
              INNOVATIVE SOLUTIONS
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
            Featured{" "}          
              Solutions
            </h2>
          
          <p className="text-slate-600 max-w-2xl mx-auto">
            Comprehensive biometric systems designed for modern security needs
          </p>
        </div>

        {/* Cards */}
        <div
          className={`grid gap-6 transition-all duration-500 ${
            activeCard ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {solutions.map((solution) => {
            const isActive = activeCard === solution.id;

            if (activeCard && !isActive) return null;

            return (
              <div
                key={solution.id}
                id={solution.id}
                ref={(el) => {
                  cardRefs.current[solution.id] = el;
                }}
                onClick={() => setActiveCard(isActive ? null : solution.id)}
                className={`group relative cursor-pointer rounded-2xl bg-white transition-all duration-500 ${
                  isActive 
                    ? "shadow-2xl scale-100" 
                    : "shadow-md hover:shadow-xl hover:-translate-y-2"
                }`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${solution.bgGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                {/* Content Container */}
                <div className={`relative rounded-2xl group-hover:border-transparent transition-all duration-500 ${
                  isActive ? "p-8 lg:p-10" : "p-6"
                }`}>
                  
                  {/* Icon */}
                  <div className={`relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${solution.gradient} mb-4 shadow-lg transition-transform duration-500 ${
                    isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3"
                  }`}>
                    <solution.icon className="w-7 h-7 text-white" />

                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                  </div>

                  {/* Title */}
                  <h3 className={`font-black text-slate-900 mb-2 transition-all duration-500 ${
                    isActive ? "text-2xl" : "text-lg"
                  }`}>
                    {solution.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {solution.short}
                  </p>

                  {/* Learn More Button (when collapsed) */}
                  {!isActive && (
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text group-hover:gap-3 transition-all duration-300">
                      Learn More
                      <ArrowRight className="w-3.5 h-3.5 text-green-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}

                  {/* Expanded Content */}
                  {isActive && (
                    <div
                      ref={activeCardRef}
                      className="mt-6 pt-6 border-t-2 border-slate-200 space-y-4 animate-fadeIn"
                    >
                      <p className="text-base text-slate-700 leading-relaxed">
                        {solution.long}
                      </p>
                    </div>
                  )}
                </div>

                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}