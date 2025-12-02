"use client";
import { Smile, Fingerprint, Hand, QrCode, CreditCard, KeyRound, CheckCircle2 } from "lucide-react";

export default function ProductHighlights() {
  const features = [
    { icon: Smile, label: "Face Recognition", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { icon: Fingerprint, label: "Fingerprint", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { icon: Hand, label: "Palm / Finger Vein", color: "text-cyan-600", bgColor: "bg-cyan-50", borderColor: "border-cyan-200" },
    { icon: QrCode, label: "QR Code", color: "text-teal-600", bgColor: "bg-teal-50", borderColor: "border-teal-200" },
    { icon: CreditCard, label: "Card", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
    { icon: KeyRound, label: "Password / PIN", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" }
  ];

  return (
    <section className="relative w-full py-16 bg-linear-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-green-100 to-transparent rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-linear-to-tr from-blue-100 to-transparent rounded-full blur-3xl opacity-30" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      <div className="relative max-w-7xl mx-auto px-10 sm:px-16 lg:px-32">
        
        {/* Heading Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full border border-green-200 mb-4">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700">VERSATILE AUTHENTICATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Multi-Biometric Authentication
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Built for every business need with 7+ authentication methods
          </p>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative flex flex-col items-center gap-3 p-6 ${feature.bgColor} ${feature.borderColor} border rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer`}
            >
              {/* Icon Container */}
              <div className={`p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              
              {/* Label */}
              <span className="text-sm font-semibold text-slate-700 text-center leading-tight">
                {feature.label}
              </span>
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-green-400 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-10">
          <p className="text-sm text-slate-500 font-medium">
            Seamlessly integrate multiple authentication methods for maximum security and flexibility
          </p>
        </div>
      </div>
    </section>
  );
}