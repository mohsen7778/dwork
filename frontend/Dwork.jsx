import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

const SEV = {
  critical: { bg: "#FFF1F2", text: "#B91C1C", label: "Critical" },
  high:     { bg: "#FFFBEB", text: "#B45309", label: "High"     },
  medium:   { bg: "#EFF6FF", text: "#1D4ED8", label: "Medium"   },
  low:      { bg: "#F0FDF4", text: "#065F46", label: "Low"      },
};

const DORKS = [
  { id:1, cat:"credentials", sev:"critical", label:"Username Directory", query:'intitle:"index of" "/usernames"' },
  { id:2, cat:"credentials", sev:"critical", label:"Contacts Exposed", query:'intitle:"index of" "contacts.txt"' },
  { id:3, cat:"files", sev:"critical", label:"ENV File", query:'"index of" ".env"' }
];

export default function Dwork() {
  const [target, setTarget] = useState("");
  const [scanning, setScanning] = useState(null);
  const [results, setResults] = useState({});

  const runScan = async (dork) => {
    setScanning(dork.id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: dork.query.replace("{target}", target) })
      });
      const data = await res.json();
      setResults(prev => ({ ...prev, [dork.id]: data.results }));
    } catch (e) { console.error(e); }
    setScanning(null);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", background: "#f5f5f7", minHeight: "100vh" }}>
      <h1 style={{ fontWeight: 800 }}>Dwork<span style={{ color: "#3B82F6" }}>.</span></h1>
      <input 
        placeholder="Enter Target..." 
        value={target} 
        onChange={e => setTarget(e.target.value)}
        style={{ width: "100%", padding: 15, borderRadius: 10, border: "1px solid #ddd", marginBottom: 20 }}
      />
      {DORKS.map(d => (
        <div key={d.id} style={{ background: "#fff", padding: 15, borderRadius: 12, marginBottom: 10, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <b>{d.label}</b>
            <span style={{ background: SEV[d.sev].bg, color: SEV[d.sev].text, padding: "2px 8px", borderRadius: 10, fontSize: 10 }}>{SEV[d.sev].label}</span>
          </div>
          <button 
            onClick={() => runScan(d)} 
            style={{ marginTop: 10, width: "100%", padding: 10, background: "#1D4ED8", color: "#fff", border: "none", borderRadius: 8 }}
          >
            {scanning === d.id ? "Scanning..." : "Run Server Scan"}
          </button>
          {results[d.id] && results[d.id].map((link, i) => (
            <a key={i} href={link} style={{ display: "block", color: "red", fontSize: 12, marginTop: 5 }}>{link}</a>
          ))}
        </div>
      ))}
    </div>
  );
}
