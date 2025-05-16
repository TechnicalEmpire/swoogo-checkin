import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./styles.css";

const API_URL = "https://swoogo-new-api.azurewebsites.net/api/SwoogoFunction?code=ZZNDVIrOZJt-WvNDYPfW_cnkJfftQr9w5DAeA95cHQ-gAzFuCCLjUw==";

type Attendee = {
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  secure_id: string;
  reg_type_id?: { value: string };
  [key: string]: any;
};

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
    <div className="container">
      {!attendee ? (
        <>
          <img src="/logo.png" alt="Logo" style={{ height: 60 }} />
          <h2>Conference Check-in</h2>
          <p className="email-indicator">Azure Function API Mode</p>

          <input
            type="email"
            placeholder="Enter attendee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <button className="primary" onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search & Generate QR"}
          </button>

          {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
        </>
      ) : (
        <>
          <h2>{attendee.first_name} {attendee.last_name}</h2>
          <p style={{ fontWeight: 500, color: "#444" }}>
            {attendee.reg_type_id?.value || "Attendee"}
          </p>
          {attendee.company && (
            <p style={{ fontStyle: "italic" }}>{attendee.company}</p>
          )}

          <div className="qr-container">
            <QRCodeSVG value={attendee.secure_id} size={180} level="H" includeMargin />
            <p style={{ marginTop: 8, fontSize: 12 }}>
              Secure ID: <code>{attendee.secure_id}</code>
            </p>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="primary" onClick={handleShare}>Share via Email</button>
            <button className="secondary" onClick={handleReset}>Reset</button>
          </div>

          {!showMore ? (
            <button
              onClick={() => setShowMore(true)}
              style={{
                marginTop: 16,
                fontSize: 14,
                color: "#2563eb",
                background: "none",
                border: "none"
              }}
            >
              View More Info
            </button>
          ) : (
            <div style={{ textAlign: "left", marginTop: 16, fontSize: 13, background: "#f9f9f9", padding: 12, borderRadius: 8 }}>
              <pre>{JSON.stringify(attendee, null, 2)}</pre>
              <button
                onClick={() => setShowMore(false)}
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "#2563eb",
                  background: "none",
                  border: "none"
                }}
              >
                Hide Info
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
