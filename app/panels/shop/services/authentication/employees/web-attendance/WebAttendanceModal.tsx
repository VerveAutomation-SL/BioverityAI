import { X, Clock, MapPin, Calendar, Image as ImageIcon, User, Briefcase } from "lucide-react";
import { useState } from "react";

interface Props {
  log: any;
  onClose: () => void;
}

export default function WebAttendanceModal({ log, onClose }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: "—", time: "—" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const calculateDuration = () => {
    if (!log.check_in_time || !log.check_out_time) return null;
    const durationMs =
      new Date(log.check_out_time).getTime() -
      new Date(log.check_in_time).getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const checkInDateTime = formatDateTime(log.check_in_time);
  const checkOutDateTime = log.check_out_time
    ? formatDateTime(log.check_out_time)
    : null;
  const duration = calculateDuration();

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {log.employees.photo_url ? (
                <img
                  src={log.employees.photo_url}
                  alt={log.employees.full_name}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-white/20"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/20 ring-4 ring-white/20 flex items-center justify-center text-white font-bold text-xl">
                  {log.employees.full_name.charAt(0)}
                </div>
              )}
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {log.employees.full_name}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-blue-100">
                  <span className="text-sm flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    ID: {log.employees.employee_id}
                  </span>
                  <span className="text-blue-300">•</span>
                  <span className="text-sm flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {log.employees.department}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {/* Duration Summary Card */}
            {duration && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Total Hours Worked
                    </p>
                    <p className="text-4xl font-bold text-blue-600">
                      {duration}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Check In/Out Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Check In Card */}
              <div className="bg-white border-2 border-green-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Check In
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      Date
                    </div>
                    <p className="font-medium text-slate-900">
                      {checkInDateTime.date}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <Clock className="w-4 h-4" />
                      Time
                    </div>
                    <p className="font-medium text-slate-900 text-lg">
                      {checkInDateTime.time}
                    </p>
                  </div>
                  {log.check_in_address && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                        <MapPin className="w-4 h-4" />
                        Location
                      </div>
                      <p className="font-medium text-slate-900 text-sm leading-relaxed">
                        {log.check_in_address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Check Out Card */}
              <div className="bg-white border-2 border-red-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Check Out
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {checkOutDateTime ? (
                    <>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          Date
                        </div>
                        <p className="font-medium text-slate-900">
                          {checkOutDateTime.date}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                          <Clock className="w-4 h-4" />
                          Time
                        </div>
                        <p className="font-medium text-slate-900 text-lg">
                          {checkOutDateTime.time}
                        </p>
                      </div>
                      {log.check_out_address && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                            <MapPin className="w-4 h-4" />
                            Location
                          </div>
                          <p className="font-medium text-slate-900 text-sm leading-relaxed">
                            {log.check_out_address}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full py-8">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-3">
                          <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <p className="text-slate-600 font-medium">
                          Still Active
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          No check-out recorded
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Verification Photos
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Check In Photo */}
                {log.check_in_photo_url ? (
                  <div className="group relative">
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white shadow-lg">
                        Check In
                      </span>
                    </div>
                    <img
                      src={log.check_in_photo_url}
                      alt="Check in photo"
                      className="w-full h-64 object-cover rounded-lg cursor-pointer hover:ring-4 hover:ring-blue-500 transition-all shadow-md"
                      onClick={() => setSelectedImage(log.check_in_photo_url)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors pointer-events-none" />
                  </div>
                ) : (
                  <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        No check-in photo
                      </p>
                    </div>
                  </div>
                )}

                {/* Check Out Photo */}
                {log.check_out_photo_url ? (
                  <div className="group relative">
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-lg">
                        Check Out
                      </span>
                    </div>
                    <img
                      src={log.check_out_photo_url}
                      alt="Check out photo"
                      className="w-full h-64 object-cover rounded-lg cursor-pointer hover:ring-4 hover:ring-blue-500 transition-all shadow-md"
                      onClick={() =>
                        setSelectedImage(log.check_out_photo_url)
                      }
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors pointer-events-none" />
                  </div>
                ) : (
                  <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        No check-out photo
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <>
          <div
            className="fixed inset-0 bg-black/90 z-[60] animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={selectedImage}
              alt="Full size photo"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </>
      )}
    </>
  );
}