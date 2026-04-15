import React, { useState, useEffect } from "react";
import {
  Search, Copy, Shield, Database, Code, Mail, Key, Globe,
  Wifi, Check, FileText, ExternalLink, Cloud, Terminal,
  ScanLine, Filter, X, Lock, Server, Zap, Loader2, Crosshair as Target,
  Activity, AlertTriangle
} from "lucide-react";

/* ─── CONFIG ────────────────────────────────────────────────── */
const SEV = {
  critical: { bg: "#FEE2E2", text: "#991B1B", label: "Critical" },
  high:     { bg: "#FEF3C7", text: "#92400E", label: "High"     },
  medium:   { bg: "#DBEAFE", text: "#1E40AF", label: "Medium"   },
  low:      { bg: "#D1FAE5", text: "#065F46", label: "Low"      },
};

const CATS = [
  { id: "all", label: "All", Icon: Globe },
  { id: "common", label: "High Success", Icon: Zap },
  { id: "credentials", label: "Credentials", Icon: Key },
  { id: "database", label: "Database", Icon: Database },
  { id: "files", label: "Files", Icon: FileText },
  { id: "code", label: "Code Leaks", Icon: Code },
  { id: "network", label: "Network", Icon: Wifi },
  { id: "cloud", label: "Cloud", Icon: Cloud },
  { id: "cms", label: "CMS", Icon: Server },
  { id: "email", label: "Paste/Email", Icon: Mail },
  { id: "api", label: "API / Keys", Icon: Terminal },
];

/* ─── FULL 150+ DORKS ────────────────────────────────────────── */
const DORKS = [
  { id: 200, cat: "common", sev: "high", label: "Exposed Logs", query: 'site:{target} filetype:log allintext:password' },
  { id: 201, cat: "common", sev: "critical", label: "Firebase Secrets", query: 'site:{target} ext:json "firebase"' },
  { id: 202, cat: "common", sev: "critical", label: "Env API Keys", query: 'site:{target} "API_KEY=" ext:env' },
  { id: 203, cat: "common", sev: "high", label: "SQL Backups", query: 'site:{target} inurl:wp-content/uploads ext:sql' },
  { id: 204, cat: "common", sev: "medium", label: "Node Modules Listing", query: 'site:{target} intitle:"Index of" "node_modules"' },
  { id: 205, cat: "common", sev: "critical", label: "Hardcoded Passwords", query: 'site:{target} intext:"password=" ext:php | ext:py | ext:js' },
  { id:1,  cat:"credentials", sev:"critical", label:"Username Directory",      query:'intitle:"index of" "/usernames"' },
  { id:2,  cat:"credentials", sev:"critical", label:"Contacts File Exposed",   query:'intitle:"index of" "contacts.txt"' },
  { id:3,  cat:"credentials", sev:"critical", label:"Credentials XML",         query:'intitle:"index of" "credentials.xml" | "credentials.inc"' },
  { id:4,  cat:"credentials", sev:"critical", label:"RSA Private Key",         query:'"-----BEGIN RSA PRIVATE KEY-----" ext:key' },
  { id:5,  cat:"credentials", sev:"critical", label:"FTP Users File",          query:'intitle:"index of" "/ftpusers"' },
  { id:6,  cat:"credentials", sev:"critical", label:"Tomcat Users XML",        query:'intitle:"index of" "tomcat-users.xml"' },
  { id:7,  cat:"credentials", sev:"critical", label:"/etc/passwd Exposed",     query:'intext:"root:x:0:0:root:/root:/bin/bash" inurl:*=/etc/passwd' },
  { id:8,  cat:"credentials", sev:"critical", label:"Master Password File",    query:'intitle:"index of" "/master.passwd"' },
  { id:9,  cat:"credentials", sev:"critical", label:"Credentials YML",         query:'intitle:"index of" "credentials.yml"' },
  { id:10, cat:"credentials", sev:"critical", label:"Passwords YML",           query:'intitle:"index of" "passwords.yml"' },
  { id:11, cat:"credentials", sev:"critical", label:"htpasswd Exposed",        query:'intitle:"Index of" htpasswd' },
  { id:12, cat:"credentials", sev:"critical", label:"WinLogon Default Pass",   query:'"DefaultPassword" ext:reg "[HKEY_LOCAL_MACHINESOFTWAREMicrosoftWindows NTCurrentVersionWinlogon]"' },
  { id:13, cat:"credentials", sev:"high",     label:"Bash History",            query:'intitle:index.of .bash_history' },
  { id:14, cat:"credentials", sev:"high",     label:"SH History",              query:'intitle:index.of .sh_history' },
  { id:15, cat:"credentials", sev:"high",     label:"Users SQL File",          query:'intitle:"index of" "users.sql"' },
  { id:16, cat:"credentials", sev:"high",     label:"Admin Userlist ASP",      query:'inurl:admin filetype:asp inurl:userlist' },
  { id:17, cat:"credentials", sev:"high",     label:"FileZilla Servers XML",   query:'intitle:"index of" "sitemanager.xml" | "recentservers.xml"' },
  { id:18, cat:"credentials", sev:"high",     label:"FileZilla Recent XML",    query:'"FileZilla" inurl:"recentservers.xml" -git' },
  { id:19, cat:"credentials", sev:"high",     label:"PuTTY Log Passwords",     query:'filetype:log username putty' },
  { id:20, cat:"credentials", sev:"high",     label:"Creds Text File",         query:'intitle:index.of "creds.txt"' },
  { id:21, cat:"credentials", sev:"high",     label:"Users DB File",           query:'intitle:index.of "users.db"' },
  { id:22, cat:"credentials", sev:"high",     label:"Allintext Log Usernames", query:'allintext:username filetype:log' },
  { id:23, cat:"credentials", sev:"medium",   label:"Login CSV",               query:'intitle:"index of" intext:login.csv' },
  { id:24, cat:"credentials", sev:"medium",   label:"URL-Based Login Lookup",  query:'inurl:/profile.php?lookup=1' },
  { id:25, cat:"database", sev:"critical", label:"MySQL JDBC YML/Java",      query:'jdbc:mysql://localhost:3306/ + username + password ext:yml | ext:java' },
  { id:26, cat:"database", sev:"critical", label:"SQL Server JDBC",          query:'jdbc:sqlserver://localhost:1433 + username + password ext:yml | ext:java' },
  { id:27, cat:"database", sev:"critical", label:"Oracle JDBC",              query:'jdbc:oracle://localhost: + username + password ext:yml | ext:java' },
  { id:28, cat:"database", sev:"critical", label:"PostgreSQL JDBC",          query:'jdbc:postgresql://localhost: + username + password ext:yml | ext:java' },
  { id:29, cat:"database", sev:"critical", label:"MySQL DSN Config",         query:'"\'dsn: mysql:host=localhost;dbname=" ext:yml | ext:txt "password:"' },
  { id:30, cat:"database", sev:"critical", label:"DB Properties File",       query:'intitle:"index of" "db.properties"' },
  { id:31, cat:"database", sev:"critical", label:"Spring Datasource Pass",   query:'"spring.datasource.password=" + "spring.datasource.username="' },
  { id:32, cat:"database", sev:"critical", label:"POSTGRES Password",        query:'"POSTGRES_PASSWORD=" ext:env' },
  { id:33, cat:"database", sev:"critical", label:"MySQL Root Password",      query:'"MYSQL_ROOT_PASSWORD:" ext:env' },
  { id:34, cat:"database", sev:"critical", label:"Redis Password ENV",       query:'allintext:"redis_password" ext:env' },
  { id:35, cat:"database", sev:"critical", label:"DB Env Password",          query:'intext:"db_database" ext:env intext:"db_password"' },
  { id:36, cat:"database", sev:"critical", label:"SQL Create Role Encrypted",query:'"CREATE ROLE" + "ENCRYPTED PASSWORD"' },
  { id:48, cat:"files", sev:"critical", label:"ENV File Exposed",           query:'"index of" ".env"' },
  { id:49, cat:"files", sev:"critical", label:"DB Password ENV",            query:'filetype:env "DB_PASSWORD"' },
  { id:50, cat:"files", sev:"critical", label:"Secret Certificate TXT",     query:'intext:"-----BEGIN CERTIFICATE-----" ext:txt' },
  { id:51, cat:"files", sev:"critical", label:"Application Users Props",    query:'intitle:"index of" "application-users.properties"' },
  { id:52, cat:"files", sev:"critical", label:"Shadow File Exposed",        query:'"/etc/shadow root:$"' },
  { id:53, cat:"files", sev:"critical", label:"Private Key PEM",            query:'"BEGIN RSA PRIVATE KEY" filetype:key' },
  { id:54, cat:"files", sev:"critical", label:"SFTP Config JSON",           query:'intitle:"Index Of" intext:sftp-config.json' },
  { id:72, cat:"code", sev:"critical", label:"GitHub Company Password",     query:'site:github.com "{target}" password' },
  { id:73, cat:"code", sev:"critical", label:"GitHub SFTP Config",          query:'site:github.com inurl:sftp-config.json' },
  { id:74, cat:"code", sev:"critical", label:"WP Config PHP DB Pass",       query:'inurl:wp-config.php intext:DB_PASSWORD' },
  { id:87, cat:"code", sev:"high",     label:"Git Repo Exposed",            query:'intitle:"index of" ".git"' },
  { id:105, cat:"cloud", sev:"critical", label:"AWS Secret Key CSV",        query:'filetype:csv intext:"Secret access key"' },
  { id:106, cat:"cloud", sev:"critical", label:"S3 Bucket XLS Passwords",   query:'s3 site:amazonaws.com filetype:xls password' },
  { id:116, cat:"cms", sev:"critical", label:"WP Uploads Passwords TXT",    query:'inurl:/wp-content/uploads/ ext:txt "username" AND "password"' },
  { id:125, cat:"email", sev:"high",   label:"Pastebin Admin Password",     query:'site:pastebin.com "admin password"' },
  { id:138, cat:"api", sev:"critical", label:"PHP MySQL Bak Connect",       query:'filetype:bak inurl:php "mysql_connect"' },
  { id:150, cat:"api", sev:"medium",   label:"XLS NAME TEL EMAIL PASS",     query:'ext:xls intext:NAME intext:TEL intext:EMAIL intext:PASSWORD' },
];

/* ─── COMPONENT ───────────────────────────────────────────────── */
export default function Dwork() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);

  const [target, setTarget] = useState("");
  const [cat, setCat] = useState("all");
  const [scanning, setScanning] = useState(null);
  const [scanResults, setScanResults] = useState({});
  const [logs, setLogs] = useState({});

  const addLog = (id, msg) => {
    setLogs(prev => ({ ...prev, [id]: [...(prev[id] || []), `> ${msg}`] }));
  };

  const resolve = (text) => target ? text.replace(/\{target\}/g, target) : text;

  const runAutoScan = async (dork) => {
    const query = resolve(dork.query);
    setScanning(dork.id);
    setLogs(prev => ({ ...prev, [dork.id]: ["System Handshake..."] }));

    try {
      const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
      const fullPath = `${baseUrl}/api/auto-scan`;
      
      addLog(dork.id, `POST: ${fullPath}`);

      const res = await fetch(fullPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server Response: ${res.status}`);
      }
      
      if (data.success) {
        addLog(dork.id, `Success: Extracted ${data.results.length} links.`);
        setScanResults(prev => ({ ...prev, [dork.id]: data.results }));
      }
    } catch (err) {
      addLog(dork.id, `CRITICAL: ${err.message}`);
    } finally {
      setScanning(null);
    }
  };

  const filtered = DORKS.filter(d => (cat === "all" || d.cat === cat));

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", width: "100%", margin: 0, padding: 0, boxSizing: "border-box", overflowX: "hidden" }}>
      <style>{`
        body, html { margin: 0; padding: 0; overflow-x: hidden; width: 100%; font-family: 'Outfit', sans-serif; }
        * { box-sizing: border-box; }
        .card-container { width: 100%; padding: 0 10px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <header style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", padding: "15px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #1D4ED8, #3B82F6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ScanLine size={20} color="#fff" />
          </div>
          <b style={{ fontSize: 24, letterSpacing: "-1px" }}>Dwork<span style={{ color: "#3B82F6" }}>.</span></b>
        </div>
        <Activity size={20} color="#1D4ED8" />
      </header>

      <div style={{ padding: "24px 0" }}>
        <div style={{ padding: "0 15px", marginBottom: 25 }}>
          <div style={{ position: "relative" }}>
            <Target size={18} style={{ position: "absolute", left: 16, top: 18, color: "#9CA3AF" }} />
            <input 
              value={target} 
              onChange={e => setTarget(e.target.value)}
              placeholder="target.com"
              style={{ width: "100%", padding: "18px 15px 18px 48px", borderRadius: 16, border: "2px solid #E5E7EB", fontSize: 16, outline: "none", background: "#fff" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 15px", marginBottom: 30 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              padding: "12px 20px", borderRadius: 40, background: cat === c.id ? "#1D4ED8" : "#fff",
              color: cat === c.id ? "#fff" : "#4B5563", border: "1px solid #E5E7EB", whiteSpace: "nowrap", fontWeight: 700, fontSize: 13
            }}>{c.label}</button>
          ))}
        </div>

        <div className="card-container">
          {filtered.map(d => {
            const s = SEV[d.sev];
            return (
              <div key={d.id} style={{ background: "#fff", borderRadius: 24, padding: 20, marginBottom: 16, border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <b style={{ fontSize: 17, color: "#111" }}>{d.label}</b>
                  <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 30, background: s.bg, color: s.text, fontWeight: 900 }}>{s.label.toUpperCase()}</span>
                </div>
                
                {logs[d.id] && (
                  <div style={{ background: "#0F172A", color: "#3B82F6", padding: "14px", borderRadius: 16, fontSize: 11, fontFamily: "monospace", marginBottom: 16, maxHeight: 120, overflowY: "auto", border: "1px solid #1E293B" }}>
                    {logs[d.id].map((l, i) => <div key={i}>{l}</div>)}
                  </div>
                )}

                <button onClick={() => runAutoScan(d)} disabled={scanning === d.id} style={{ width: "100%", padding: "16px", background: "#1D4ED8", color: "#fff", borderRadius: 18, border: "none", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 14 }}>
                  {scanning === d.id ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={18} />}
                  EXECUTE SCAN
                </button>

                {scanResults[d.id] && (
                  <div style={{ marginTop: 20, borderTop: "2px dashed #F1F5F9", paddingTop: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 900, color: "#1D4ED8", marginBottom: 12 }}>THREAT DETECTED:</p>
                    {scanResults[d.id].length > 0 ? scanResults[d.id].map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 12, color: "#EF4444", marginBottom: 10, textDecoration: "none", background: "#FEF2F2", padding: "12px", borderRadius: 12, border: "1px solid #FEE2E2", wordBreak: "break-all" }}>
                        {link}
                      </a>
                    )) : <p style={{ fontSize: 13, color: "#94A3B8" }}>No public vulnerabilities found.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
