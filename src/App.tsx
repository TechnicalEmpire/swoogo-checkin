import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle, Info } from "lucide-react";

const API_URL = "https://swoogo-new-api.azurewebsites.net/api/SwoogoFunction?code=ZZNDVIrOZJt-WvNDYPfW_cnkJfftQr9w5DAeA95cHQ-gAzFuCCLjUw==";

interface Attendee {
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  secure_id: string;
  reg_type_id?: { value: string };
  [key: string]: any;
}

export default function App() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setAttendee(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), eventId: "226396" }),
      });
      const data = await res.json();
      if (data?.error || !data?.secure_id) throw new Error("No match found");
      setAttendee(data);
    } catch (err) {
      setError("No attendee found or server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setAttendee(null);
    setShowMore(false);
    setError("");
  };

  const handleShare = () => {
    if (!attendee?.email) return;
    const subject = `Your QR Code for BILD Expo`;
    const body = `Hello ${attendee.first_name},%0D%0A%0D%0AHere is your check-in QR Code for BILD Expo. Your Secure ID is: ${attendee.secure_id}`;
    window.location.href = `mailto:${attendee.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6">
        {!attendee ? (
          <>
            <div className="text-center mb-4">
              <img src="/logo.png" alt="Logo" className="h-16 mx-auto" />
              <h2 className="text-xl font-semibold mt-2">Conference Check-in</h2>
              <p className="text-sm text-gray-500">Azure Function API Mode</p>
            </div>
            <Input
              type="email"
              placeholder="Enter attendee email"
              value={email}
	onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="text-base py-6 text-black bg-white"
              disabled={loading}
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full mt-4 py-5 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search & Generate QR"
              )}
            </Button>
            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-lg font-semibold flex justify-center items-center gap-2">
                {attendee.first_name} {attendee.last_name} <CheckCircle className="text-green-500 h-5 w-5" />
              </h2>
              <p className="text-sm font-medium text-gray-700">{attendee.reg_type_id?.value || "Attendee"}</p>
              {attendee.company && (
                <p className="text-sm text-gray-500 italic">{attendee.company}</p>
              )}
            </div>

            <div className="my-6 flex justify-center">
              <div className="bg-white border rounded-xl p-4 shadow">
                <QRCodeSVG value={attendee.secure_id} size={200} level="H" includeMargin={true} />
                <p className="text-center text-xs text-gray-600 mt-2">Secure ID: <code>{attendee.secure_id}</code></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleShare} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white">
                Share via Email
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full py-3">
                New Lookup
              </Button>
            </div>

            {!showMore ? (
              <button
                onClick={() => setShowMore(true)}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mx-auto"
              >
                <Info className="h-4 w-4" /> View More Info
              </button>
            ) : (
              <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-left">
                <pre className="overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(attendee, null, 2)}</pre>
                <button
                  onClick={() => setShowMore(false)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-xs"
                >
                  Hide Info
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
