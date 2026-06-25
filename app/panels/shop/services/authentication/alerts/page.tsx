"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Check, Bell, Trash2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type FormData = {
  name: string;
  phoneNumber: string;
};

type Recipient = {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
};

type Country = {
  name: string;
  code: string; // dial code e.g. "94"
  flag: string;
  iso: string;  // ISO 3166-1 alpha-2
};

const COUNTRIES: Country[] = [
  { name: "Afghanistan", code: "93", flag: "🇦🇫", iso: "AF" },
  { name: "Albania", code: "355", flag: "🇦🇱", iso: "AL" },
  { name: "Algeria", code: "213", flag: "🇩🇿", iso: "DZ" },
  { name: "Andorra", code: "376", flag: "🇦🇩", iso: "AD" },
  { name: "Angola", code: "244", flag: "🇦🇴", iso: "AO" },
  { name: "Antigua and Barbuda", code: "1268", flag: "🇦🇬", iso: "AG" },
  { name: "Argentina", code: "54", flag: "🇦🇷", iso: "AR" },
  { name: "Armenia", code: "374", flag: "🇦🇲", iso: "AM" },
  { name: "Australia", code: "61", flag: "🇦🇺", iso: "AU" },
  { name: "Austria", code: "43", flag: "🇦🇹", iso: "AT" },
  { name: "Azerbaijan", code: "994", flag: "🇦🇿", iso: "AZ" },
  { name: "Bahamas", code: "1242", flag: "🇧🇸", iso: "BS" },
  { name: "Bahrain", code: "973", flag: "🇧🇭", iso: "BH" },
  { name: "Bangladesh", code: "880", flag: "🇧🇩", iso: "BD" },
  { name: "Barbados", code: "1246", flag: "🇧🇧", iso: "BB" },
  { name: "Belarus", code: "375", flag: "🇧🇾", iso: "BY" },
  { name: "Belgium", code: "32", flag: "🇧🇪", iso: "BE" },
  { name: "Belize", code: "501", flag: "🇧🇿", iso: "BZ" },
  { name: "Benin", code: "229", flag: "🇧🇯", iso: "BJ" },
  { name: "Bhutan", code: "975", flag: "🇧🇹", iso: "BT" },
  { name: "Bolivia", code: "591", flag: "🇧🇴", iso: "BO" },
  { name: "Bosnia and Herzegovina", code: "387", flag: "🇧🇦", iso: "BA" },
  { name: "Botswana", code: "267", flag: "🇧🇼", iso: "BW" },
  { name: "Brazil", code: "55", flag: "🇧🇷", iso: "BR" },
  { name: "Brunei", code: "673", flag: "🇧🇳", iso: "BN" },
  { name: "Bulgaria", code: "359", flag: "🇧🇬", iso: "BG" },
  { name: "Burkina Faso", code: "226", flag: "🇧🇫", iso: "BF" },
  { name: "Burundi", code: "257", flag: "🇧🇮", iso: "BI" },
  { name: "Cambodia", code: "855", flag: "🇰🇭", iso: "KH" },
  { name: "Cameroon", code: "237", flag: "🇨🇲", iso: "CM" },
  { name: "Canada", code: "1", flag: "🇨🇦", iso: "CA" },
  { name: "Cape Verde", code: "238", flag: "🇨🇻", iso: "CV" },
  { name: "Central African Republic", code: "236", flag: "🇨🇫", iso: "CF" },
  { name: "Chad", code: "235", flag: "🇹🇩", iso: "TD" },
  { name: "Chile", code: "56", flag: "🇨🇱", iso: "CL" },
  { name: "China", code: "86", flag: "🇨🇳", iso: "CN" },
  { name: "Colombia", code: "57", flag: "🇨🇴", iso: "CO" },
  { name: "Comoros", code: "269", flag: "🇰🇲", iso: "KM" },
  { name: "Congo (DRC)", code: "243", flag: "🇨🇩", iso: "CD" },
  { name: "Congo (Republic)", code: "242", flag: "🇨🇬", iso: "CG" },
  { name: "Costa Rica", code: "506", flag: "🇨🇷", iso: "CR" },
  { name: "Croatia", code: "385", flag: "🇭🇷", iso: "HR" },
  { name: "Cuba", code: "53", flag: "🇨🇺", iso: "CU" },
  { name: "Cyprus", code: "357", flag: "🇨🇾", iso: "CY" },
  { name: "Czech Republic", code: "420", flag: "🇨🇿", iso: "CZ" },
  { name: "Denmark", code: "45", flag: "🇩🇰", iso: "DK" },
  { name: "Djibouti", code: "253", flag: "🇩🇯", iso: "DJ" },
  { name: "Dominica", code: "1767", flag: "🇩🇲", iso: "DM" },
  { name: "Dominican Republic", code: "1809", flag: "🇩🇴", iso: "DO" },
  { name: "Ecuador", code: "593", flag: "🇪🇨", iso: "EC" },
  { name: "Egypt", code: "20", flag: "🇪🇬", iso: "EG" },
  { name: "El Salvador", code: "503", flag: "🇸🇻", iso: "SV" },
  { name: "Equatorial Guinea", code: "240", flag: "🇬🇶", iso: "GQ" },
  { name: "Eritrea", code: "291", flag: "🇪🇷", iso: "ER" },
  { name: "Estonia", code: "372", flag: "🇪🇪", iso: "EE" },
  { name: "Eswatini", code: "268", flag: "🇸🇿", iso: "SZ" },
  { name: "Ethiopia", code: "251", flag: "🇪🇹", iso: "ET" },
  { name: "Fiji", code: "679", flag: "🇫🇯", iso: "FJ" },
  { name: "Finland", code: "358", flag: "🇫🇮", iso: "FI" },
  { name: "France", code: "33", flag: "🇫🇷", iso: "FR" },
  { name: "Gabon", code: "241", flag: "🇬🇦", iso: "GA" },
  { name: "Gambia", code: "220", flag: "🇬🇲", iso: "GM" },
  { name: "Georgia", code: "995", flag: "🇬🇪", iso: "GE" },
  { name: "Germany", code: "49", flag: "🇩🇪", iso: "DE" },
  { name: "Ghana", code: "233", flag: "🇬🇭", iso: "GH" },
  { name: "Greece", code: "30", flag: "🇬🇷", iso: "GR" },
  { name: "Grenada", code: "1473", flag: "🇬🇩", iso: "GD" },
  { name: "Guatemala", code: "502", flag: "🇬🇹", iso: "GT" },
  { name: "Guinea", code: "224", flag: "🇬🇳", iso: "GN" },
  { name: "Guinea-Bissau", code: "245", flag: "🇬🇼", iso: "GW" },
  { name: "Guyana", code: "592", flag: "🇬🇾", iso: "GY" },
  { name: "Haiti", code: "509", flag: "🇭🇹", iso: "HT" },
  { name: "Honduras", code: "504", flag: "🇭🇳", iso: "HN" },
  { name: "Hungary", code: "36", flag: "🇭🇺", iso: "HU" },
  { name: "Iceland", code: "354", flag: "🇮🇸", iso: "IS" },
  { name: "India", code: "91", flag: "🇮🇳", iso: "IN" },
  { name: "Indonesia", code: "62", flag: "🇮🇩", iso: "ID" },
  { name: "Iran", code: "98", flag: "🇮🇷", iso: "IR" },
  { name: "Iraq", code: "964", flag: "🇮🇶", iso: "IQ" },
  { name: "Ireland", code: "353", flag: "🇮🇪", iso: "IE" },
  { name: "Israel", code: "972", flag: "🇮🇱", iso: "IL" },
  { name: "Italy", code: "39", flag: "🇮🇹", iso: "IT" },
  { name: "Ivory Coast", code: "225", flag: "🇨🇮", iso: "CI" },
  { name: "Jamaica", code: "1876", flag: "🇯🇲", iso: "JM" },
  { name: "Japan", code: "81", flag: "🇯🇵", iso: "JP" },
  { name: "Jordan", code: "962", flag: "🇯🇴", iso: "JO" },
  { name: "Kazakhstan", code: "7", flag: "🇰🇿", iso: "KZ" },
  { name: "Kenya", code: "254", flag: "🇰🇪", iso: "KE" },
  { name: "Kiribati", code: "686", flag: "🇰🇮", iso: "KI" },
  { name: "Kosovo", code: "383", flag: "🇽🇰", iso: "XK" },
  { name: "Kuwait", code: "965", flag: "🇰🇼", iso: "KW" },
  { name: "Kyrgyzstan", code: "996", flag: "🇰🇬", iso: "KG" },
  { name: "Laos", code: "856", flag: "🇱🇦", iso: "LA" },
  { name: "Latvia", code: "371", flag: "🇱🇻", iso: "LV" },
  { name: "Lebanon", code: "961", flag: "🇱🇧", iso: "LB" },
  { name: "Lesotho", code: "266", flag: "🇱🇸", iso: "LS" },
  { name: "Liberia", code: "231", flag: "🇱🇷", iso: "LR" },
  { name: "Libya", code: "218", flag: "🇱🇾", iso: "LY" },
  { name: "Liechtenstein", code: "423", flag: "🇱🇮", iso: "LI" },
  { name: "Lithuania", code: "370", flag: "🇱🇹", iso: "LT" },
  { name: "Luxembourg", code: "352", flag: "🇱🇺", iso: "LU" },
  { name: "Madagascar", code: "261", flag: "🇲🇬", iso: "MG" },
  { name: "Malawi", code: "265", flag: "🇲🇼", iso: "MW" },
  { name: "Malaysia", code: "60", flag: "🇲🇾", iso: "MY" },
  { name: "Maldives", code: "960", flag: "🇲🇻", iso: "MV" },
  { name: "Mali", code: "223", flag: "🇲🇱", iso: "ML" },
  { name: "Malta", code: "356", flag: "🇲🇹", iso: "MT" },
  { name: "Marshall Islands", code: "692", flag: "🇲🇭", iso: "MH" },
  { name: "Mauritania", code: "222", flag: "🇲🇷", iso: "MR" },
  { name: "Mauritius", code: "230", flag: "🇲🇺", iso: "MU" },
  { name: "Mexico", code: "52", flag: "🇲🇽", iso: "MX" },
  { name: "Micronesia", code: "691", flag: "🇫🇲", iso: "FM" },
  { name: "Moldova", code: "373", flag: "🇲🇩", iso: "MD" },
  { name: "Monaco", code: "377", flag: "🇲🇨", iso: "MC" },
  { name: "Mongolia", code: "976", flag: "🇲🇳", iso: "MN" },
  { name: "Montenegro", code: "382", flag: "🇲🇪", iso: "ME" },
  { name: "Morocco", code: "212", flag: "🇲🇦", iso: "MA" },
  { name: "Mozambique", code: "258", flag: "🇲🇿", iso: "MZ" },
  { name: "Myanmar", code: "95", flag: "🇲🇲", iso: "MM" },
  { name: "Namibia", code: "264", flag: "🇳🇦", iso: "NA" },
  { name: "Nauru", code: "674", flag: "🇳🇷", iso: "NR" },
  { name: "Nepal", code: "977", flag: "🇳🇵", iso: "NP" },
  { name: "Netherlands", code: "31", flag: "🇳🇱", iso: "NL" },
  { name: "New Zealand", code: "64", flag: "🇳🇿", iso: "NZ" },
  { name: "Nicaragua", code: "505", flag: "🇳🇮", iso: "NI" },
  { name: "Niger", code: "227", flag: "🇳🇪", iso: "NE" },
  { name: "Nigeria", code: "234", flag: "🇳🇬", iso: "NG" },
  { name: "North Korea", code: "850", flag: "🇰🇵", iso: "KP" },
  { name: "North Macedonia", code: "389", flag: "🇲🇰", iso: "MK" },
  { name: "Norway", code: "47", flag: "🇳🇴", iso: "NO" },
  { name: "Oman", code: "968", flag: "🇴🇲", iso: "OM" },
  { name: "Pakistan", code: "92", flag: "🇵🇰", iso: "PK" },
  { name: "Palau", code: "680", flag: "🇵🇼", iso: "PW" },
  { name: "Palestine", code: "970", flag: "🇵🇸", iso: "PS" },
  { name: "Panama", code: "507", flag: "🇵🇦", iso: "PA" },
  { name: "Papua New Guinea", code: "675", flag: "🇵🇬", iso: "PG" },
  { name: "Paraguay", code: "595", flag: "🇵🇾", iso: "PY" },
  { name: "Peru", code: "51", flag: "🇵🇪", iso: "PE" },
  { name: "Philippines", code: "63", flag: "🇵🇭", iso: "PH" },
  { name: "Poland", code: "48", flag: "🇵🇱", iso: "PL" },
  { name: "Portugal", code: "351", flag: "🇵🇹", iso: "PT" },
  { name: "Qatar", code: "974", flag: "🇶🇦", iso: "QA" },
  { name: "Romania", code: "40", flag: "🇷🇴", iso: "RO" },
  { name: "Russia", code: "7", flag: "🇷🇺", iso: "RU" },
  { name: "Rwanda", code: "250", flag: "🇷🇼", iso: "RW" },
  { name: "Saint Kitts and Nevis", code: "1869", flag: "🇰🇳", iso: "KN" },
  { name: "Saint Lucia", code: "1758", flag: "🇱🇨", iso: "LC" },
  { name: "Saint Vincent and the Grenadines", code: "1784", flag: "🇻🇨", iso: "VC" },
  { name: "Samoa", code: "685", flag: "🇼🇸", iso: "WS" },
  { name: "San Marino", code: "378", flag: "🇸🇲", iso: "SM" },
  { name: "Sao Tome and Principe", code: "239", flag: "🇸🇹", iso: "ST" },
  { name: "Saudi Arabia", code: "966", flag: "🇸🇦", iso: "SA" },
  { name: "Senegal", code: "221", flag: "🇸🇳", iso: "SN" },
  { name: "Serbia", code: "381", flag: "🇷🇸", iso: "RS" },
  { name: "Seychelles", code: "248", flag: "🇸🇨", iso: "SC" },
  { name: "Sierra Leone", code: "232", flag: "🇸🇱", iso: "SL" },
  { name: "Singapore", code: "65", flag: "🇸🇬", iso: "SG" },
  { name: "Slovakia", code: "421", flag: "🇸🇰", iso: "SK" },
  { name: "Slovenia", code: "386", flag: "🇸🇮", iso: "SI" },
  { name: "Solomon Islands", code: "677", flag: "🇸🇧", iso: "SB" },
  { name: "Somalia", code: "252", flag: "🇸🇴", iso: "SO" },
  { name: "South Africa", code: "27", flag: "🇿🇦", iso: "ZA" },
  { name: "South Korea", code: "82", flag: "🇰🇷", iso: "KR" },
  { name: "South Sudan", code: "211", flag: "🇸🇸", iso: "SS" },
  { name: "Spain", code: "34", flag: "🇪🇸", iso: "ES" },
  { name: "Sri Lanka", code: "94", flag: "🇱🇰", iso: "LK" },
  { name: "Sudan", code: "249", flag: "🇸🇩", iso: "SD" },
  { name: "Suriname", code: "597", flag: "🇸🇷", iso: "SR" },
  { name: "Sweden", code: "46", flag: "🇸🇪", iso: "SE" },
  { name: "Switzerland", code: "41", flag: "🇨🇭", iso: "CH" },
  { name: "Syria", code: "963", flag: "🇸🇾", iso: "SY" },
  { name: "Taiwan", code: "886", flag: "🇹🇼", iso: "TW" },
  { name: "Tajikistan", code: "992", flag: "🇹🇯", iso: "TJ" },
  { name: "Tanzania", code: "255", flag: "🇹🇿", iso: "TZ" },
  { name: "Thailand", code: "66", flag: "🇹🇭", iso: "TH" },
  { name: "Timor-Leste", code: "670", flag: "🇹🇱", iso: "TL" },
  { name: "Togo", code: "228", flag: "🇹🇬", iso: "TG" },
  { name: "Tonga", code: "676", flag: "🇹🇴", iso: "TO" },
  { name: "Trinidad and Tobago", code: "1868", flag: "🇹🇹", iso: "TT" },
  { name: "Tunisia", code: "216", flag: "🇹🇳", iso: "TN" },
  { name: "Turkey", code: "90", flag: "🇹🇷", iso: "TR" },
  { name: "Turkmenistan", code: "993", flag: "🇹🇲", iso: "TM" },
  { name: "Tuvalu", code: "688", flag: "🇹🇻", iso: "TV" },
  { name: "Uganda", code: "256", flag: "🇺🇬", iso: "UG" },
  { name: "Ukraine", code: "380", flag: "🇺🇦", iso: "UA" },
  { name: "United Arab Emirates", code: "971", flag: "🇦🇪", iso: "AE" },
  { name: "United Kingdom", code: "44", flag: "🇬🇧", iso: "GB" },
  { name: "United States", code: "1", flag: "🇺🇸", iso: "US" },
  { name: "Uruguay", code: "598", flag: "🇺🇾", iso: "UY" },
  { name: "Uzbekistan", code: "998", flag: "🇺🇿", iso: "UZ" },
  { name: "Vanuatu", code: "678", flag: "🇻🇺", iso: "VU" },
  { name: "Vatican City", code: "39", flag: "🇻🇦", iso: "VA" },
  { name: "Venezuela", code: "58", flag: "🇻🇪", iso: "VE" },
  { name: "Vietnam", code: "84", flag: "🇻🇳", iso: "VN" },
  { name: "Yemen", code: "967", flag: "🇾🇪", iso: "YE" },
  { name: "Zambia", code: "260", flag: "🇿🇲", iso: "ZM" },
  { name: "Zimbabwe", code: "263", flag: "🇿🇼", iso: "ZW" },
];

function normalizePhoneNumber(dialCode: string, local: string): string {
  let num = local.replace(/\s+/g, "").replace(/^0+/, "");
  return dialCode + num;
}

function isValidLocalPhone(num: string): boolean {
  const stripped = num.replace(/\s+/g, "").replace(/^0+/, "");
  return /^[0-9]{6,14}$/.test(stripped);
}

export default function AlertsPage() {
  const [formData, setFormData] = useState<FormData>({ name: "", phoneNumber: "" });
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // default Sri Lanka
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch org_id on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (profile?.org_id) setOrgId(profile.org_id);
      setIsLoading(false);
    })();
  }, []);

  // Auto-load saved data + recipients when orgId is available
  useEffect(() => {
    if (!orgId) return;

    (async () => {
      const { data } = await supabase
        .from("alert_recipients")
        .select("name, phone_number")
        .eq("org_id", orgId)
        .single();

      if (data) {
        // Try to match stored number to a country dial code
        const stored = data.phone_number as string;
        const matched = COUNTRIES.find((c) => stored.startsWith(c.code));
        if (matched) {
          setSelectedCountry(matched);
          setFormData({ name: data.name, phoneNumber: stored.slice(matched.code.length) });
        } else {
          setFormData({ name: data.name, phoneNumber: stored });
        }
      }
    })();

    fetchRecipients();
  }, [orgId]);

  async function fetchRecipients() {
    if (!orgId) return;
    setIsLoadingRecipients(true);
    const { data } = await supabase
      .from("alert_recipients")
      .select("id, name, phone_number, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    setRecipients(data ?? []);
    setIsLoadingRecipients(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from("alert_recipients").delete().eq("id", id);
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const isFormValid =
    formData.name.trim() !== "" && isValidLocalPhone(formData.phoneNumber);

  async function handleSubmit() {
    if (!isFormValid || isSubmitting || !orgId) return;
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    const fullNumber = normalizePhoneNumber(selectedCountry.code, formData.phoneNumber);

    const { error } = await supabase.from("alert_recipients").insert({
      org_id: orgId,
      name: formData.name.trim(),
      phone_number: fullNumber,
      created_by: user?.id ?? null,
    });

    setIsSubmitting(false);

    if (error) { console.error("Save failed:", error); return; }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setFormData({ name: "", phoneNumber: "" });
    fetchRecipients();
  }

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch.replace("+", ""))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Alert Settings
              </h1>
            </div>
          </div>
          <p className="text-slate-600 text-lg ml-15">
            Configure who will receive the real-time alerts and notifications
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-emerald-900 mb-1">WhatsApp Notifications</h3>
              <p className="text-sm text-emerald-700">
                Add your contact details to receive instant WhatsApp alerts for employee check-ins and check-outs.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">Successfully Saved!</h3>
                <p className="text-sm text-green-700">Your WhatsApp alert settings have been updated.</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Contact Information</h2>
              <p className="text-sm text-slate-500">Enter details for WhatsApp notifications</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Phone Number Input with Country Code */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                WhatsApp Number
              </label>

              <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((p) => !p)}
                    className="flex items-center gap-2 h-full px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 hover:border-slate-300 transition-all duration-200 text-slate-800 whitespace-nowrap"
                  >
                    <img
                      src={`https://flagcdn.com/24x18/${selectedCountry.iso.toLowerCase()}.png`}
                      alt={selectedCountry.name}
                      className="w-6 h-auto rounded-sm"
                    />
                    <span className="text-sm font-semibold text-slate-700">+{selectedCountry.code}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border-2 border-slate-200 rounded-xl shadow-xl overflow-hidden w-72">
                      <div className="p-2 border-b border-slate-100">
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search country or code..."
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800 placeholder-slate-400"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {filteredCountries.length === 0 ? (
                          <p className="text-center text-xs text-slate-400 py-4">No countries found</p>
                        ) : (
                          filteredCountries.map((country) => (
                            <button
                              key={country.iso}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setDropdownOpen(false);
                                setCountrySearch("");
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors text-left ${
                                selectedCountry.iso === country.iso ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-700"
                              }`}
                            >
                              <img
                                src={`https://flagcdn.com/24x18/${country.iso.toLowerCase()}.png`}
                                alt={country.name}
                                className="w-6 h-auto rounded-sm flex-shrink-0"
                              />
                              <span className="flex-1 truncate">{country.name}</span>
                              <span className="text-xs text-slate-400 font-mono">+{country.code}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Local Number Input */}
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9 ]*"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder={`${selectedCountry.flag} 75 207 2772`}
                  className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400"
                />
              </div>


            </div>

            {/* Feature List */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">You'll receive alerts for:</h4>
              <div className="space-y-2">
                {["Employee check-in notifications", "Employee check-out notifications", "Real-time attendance updates"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting || !orgId}
              className={`w-full py-4 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 transform
                ${isFormValid && !isSubmitting && orgId
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-xl hover:scale-105 cursor-pointer"
                  : "bg-slate-300 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                "Save Alert Settings"
              )}
            </button>
          </div>
        </div>

        {/* ── Recipients Table ── */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Registered Recipients</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {recipients.length} contact{recipients.length !== 1 ? "s" : ""} will receive alerts
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-slate-500" />
            </div>
          </div>

          {isLoadingRecipients ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recipients.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No recipients added yet. Use the form above to add one.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">#</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Name</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">WhatsApp Number</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Added</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-4 text-slate-800 font-medium">{r.name}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-mono text-xs font-medium">
                          <MessageCircle className="w-3 h-3" />
                          +{r.phone_number}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {new Date(r.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-40"
                          title="Remove recipient"
                        >
                          {deletingId === r.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Important Information</h3>
          <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>• Make sure your WhatsApp number is active and can receive messages</p>
            <p>• You'll receive a verification message when you save your settings</p>
            <p>• Update your contact details anytime by submitting this form again</p>
          </div>
        </div>
      </div>
    </div>
  );
}