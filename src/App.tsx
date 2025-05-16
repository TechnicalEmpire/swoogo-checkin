import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const API_URL = "https://swoogo-new-api.azurewebsites.net/api/SwoogoFunction?code=ZZNDVIrOZJt-WvNDYPfW_cnkJfftQr9w5DAeA95cHQ-gAzFuCCLjUw==";

export default function App() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendee, setAttendee] = useState(null);
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
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
      {!attendee ? (
        <div style={{ textAlign: "center" }}>
          <img src="/logo.png" alt="Logo" style={{ height: 64 }} />
          <h2>Conference Check-in</h2>
          <p style={{ fontSize: 14, color: "gray" }}>Azure Function API Mode</p>

          <input
            type="email"
            placeholder="Enter attendee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 16, borderRadius: 8 }}
            disabled={loading}
          />

          <button
            onClick={handleSearch}
            style={{ marginTop: 12, padding: "12px 24px", backgroundColor: "#0078D4", color: "white", border: "none", borderRadius: 6, fontSize: 16 }}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search & Generate QR"}
          </button>

          {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h2>{attendee.first_name} {attendee.last_name}</h2>
          <p style={{ fontWeight: 500, color: "#444" }}>{attendee.reg_type_id?.value || "Attendee"}</p>
          {attendee.company && <p style={{ fontStyle: "italic" }}>{attendee.company}</p>}

          <div style={{ margin: "20px auto", padding: 16, background: "white", border: "1px solid #eee", borderRadius: 12, display: "inline-block" }}>
            <QRCodeSVG value={attendee.secure_id} size={200} level="H" includeMargin={true} />
            <p style={{ marginTop: 8, fontSize: 12 }}>Secure ID: <code>{attendee.secure_id}</code></p>
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={handleShare} style={{ marginRight: 8, padding: "8px 12px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: 4 }}>Share via Email</button>
            <button onClick={handleReset} style={{ padding: "8px 12px", backgroundColor: "#e5e7eb", color: "#111", border: "none", borderRadius: 4 }}>Reset</button>
          </div>

          {!showMore ? (
            <button onClick={() => setShowMore(true)} style={{ marginTop: 16, fontSize: 14, color: "#2563eb", background: "none", border: "none" }}>View More Info</button>
          ) : (
            <div style={{ textAlign: "left", marginTop: 16, fontSize: 13, background: "#f9f9f9", padding: 12, borderRadius: 8 }}>
              <pre>{JSON.stringify(attendee, null, 2)}</pre>
              <button onClick={() => setShowMore(false)} style={{ marginTop: 8, fontSize: 13, color: "#2563eb", background: "none", border: "none" }}>Hide Info</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}