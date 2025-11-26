"use client";

import { useState } from "react";
import { Mail, User, Building2, Send, MessageSquare, Clock, Sparkles } from "lucide-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Please enter a valid email";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.message.trim()) newErrors.message = "Message cannot be empty";
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <section 
    id="contact"
    className="relative w-full py-14 bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-green-50/30" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
        backgroundSize: '18px 18px'
      }} />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-20">

        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200/50 shadow-sm">
            <Sparkles className="w-3 h-3 text-green-600" />
            <span className="text-[10px] font-semibold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
              LET'S CONNECT
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Get in{" "}
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              Touch
            </span>
          </h2>

          <p className="text-slate-600 max-w-xl mx-auto text-sm leading-relaxed">
            Have questions about our biometric solutions? Our team is ready to help you find the perfect security system for your organization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Cards */}
          <div className="lg:col-span-1 space-y-4">

            {/* Contact Details */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-white">Contact Us</h3>
                <p className="text-blue-100 text-xs">+65 9716 0535</p>
                <div className="pt-1">
                  <h4 className="text-xs font-bold text-white">Email</h4>
                  <p className="text-blue-100 text-xs">info@bioverityai.com</p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-white mb-1">Business Hours</h3>
                <div className="text-purple-100 text-xs space-y-0.5">
                  <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Form */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl p-6 sm:p-8">

              {/* Success Message */}
              {submitted && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-900 text-sm">Message Sent Successfully!</h4>
                      <p className="text-xs text-green-700">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-50 transition-all ${
                      errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300 focus-within:border-green-500 focus-within:bg-white'
                    }`}>
                      <User className={`w-4 h-4 ${errors.name ? 'text-red-500' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        className="w-full bg-transparent outline-none text-slate-900 text-sm"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-50 transition-all ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300 focus-within:border-green-500 focus-within:bg-white'
                    }`}>
                      <Mail className={`w-4 h-4 ${errors.email ? 'text-red-500' : 'text-slate-400'}`} />
                      <input
                        type="email"
                        className="w-full bg-transparent outline-none text-slate-900 text-sm"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                </div>

                {/* Phone & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className={errors.phone ? 'phone-input-error' : ''}>
                      <PhoneInput
                        country={'lk'}
                        value={form.phone}
                        onChange={(phone) => handleChange("phone", phone)}
                        inputStyle={{
                          width: '100%',
                          height: '42px',
                          fontSize: '14px',
                          paddingLeft: '48px',
                          border: errors.phone ? '1px solid #f87171' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          backgroundColor: errors.phone ? '#fef2f2' : '#f8fafc',
                        }}
                        buttonStyle={{
                          border: errors.phone ? '1px solid #f87171' : '1px solid #e2e8f0',
                          borderRadius: '8px 0 0 8px',
                          backgroundColor: errors.phone ? '#fef2f2' : '#f8fafc',
                        }}
                        dropdownStyle={{
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        }}
                        containerClass="phone-input-container"
                        inputClass="phone-input-field"
                        buttonClass="phone-input-button"
                        searchClass="phone-input-search"
                        enableSearch={true}
                        searchPlaceholder="Search country..."
                        preferredCountries={['lk', 'in', 'sg', 'my', 'us', 'gb', 'ae']}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Company Name
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:border-slate-300 focus-within:border-green-500 focus-within:bg-white transition-all">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        className="w-full bg-transparent outline-none text-slate-900 text-sm"
                        placeholder="Your Company"
                        value={form.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                      />
                    </div>
                  </div>

                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <div className={`rounded-lg border bg-slate-50 transition-all ${
                    errors.message ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300 focus-within:border-green-500 focus-within:bg-white'
                  }`}>
                    <div className="flex items-start gap-2 px-3 py-2">
                      <MessageSquare className={`w-4 h-4 mt-1 ${errors.message ? 'text-red-500' : 'text-slate-400'}`} />
                      <textarea
                        rows={4}
                        className="w-full bg-transparent outline-none text-slate-900 text-sm resize-none"
                        placeholder="Tell us about your requirements..."
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                      />
                    </div>
                  </div>
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-500 pt-1">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </p>

              </div>
            </div>
          </div>

        </div>

      </div>

      <style jsx>{`
        .phone-input-container:hover .react-tel-input .form-control {
          border-color: #cbd5e1 !important;
        }
        .phone-input-container .react-tel-input .form-control:focus {
          border-color: #10b981 !important;
          background-color: white !important;
          box-shadow: none !important;
        }
        .phone-input-container .react-tel-input .flag-dropdown:hover {
          background-color: #f1f5f9 !important;
        }
        .phone-input-container .react-tel-input .selected-flag:focus {
          outline: none !important;
        }
      `}</style>
    </section>
  );
}