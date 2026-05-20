import { useState, useEffect, useRef } from "react";
import axios from "axios";

const COLORS = {
  bg: "#0A0E1A",
  bgCard: "#0F1629",
  bgCard2: "#141C35",
  border: "#1E2D5A",
  accent: "#00D4FF",
  accentGlow: "#00D4FF33",
  accent2: "#FF6B35",
  accent3: "#7C3AED",
  green: "#10B981",
  red: "#EF4444",
  yellow: "#F59E0B",
  textPrimary: "#E2E8F0",
  textSecondary: "#94A3B8",
  textMuted: "#475569",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Space Grotesk', sans-serif; background: ${COLORS.bg}; color: ${COLORS.textPrimary}; min-height: 100vh; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${COLORS.bg}; } ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .glow { text-shadow: 0 0 20px ${COLORS.accentGlow}; color: ${COLORS.accent}; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes countUp { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .badge { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:0.05em; }
  .btn { display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:8px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all 0.2s;letter-spacing:0.02em; }
  .btn-primary { background:${COLORS.accent};color:#000; }
  .btn-primary:hover { filter:brightness(1.15);transform:translateY(-1px); }
  .btn-outline { background:transparent;color:${COLORS.accent};border:1.5px solid ${COLORS.accent}; }
  .btn-outline:hover { background:${COLORS.accentGlow}; }
  .btn-danger { background:${COLORS.red};color:#fff; }
  .btn-success { background:${COLORS.green};color:#fff; }
  .input { width:100%;padding:10px 14px;background:#0A0E1A;border:1.5px solid ${COLORS.border};border-radius:8px;color:${COLORS.textPrimary};font-family:inherit;font-size:14px;outline:none;transition:border-color 0.2s; }
  .input:focus { border-color:${COLORS.accent}; }
  .input::placeholder { color:${COLORS.textMuted}; }
  .select { appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394A3B8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center; }
  .card { background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:12px;padding:20px; }
  .card2 { background:${COLORS.bgCard2};border:1px solid ${COLORS.border};border-radius:12px;padding:16px; }
  .nav-item { display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s;color:${COLORS.textSecondary};border:none;background:transparent;width:100%;text-align:left; }
  .nav-item:hover { background:${COLORS.bgCard2};color:${COLORS.textPrimary}; }
  .nav-item.active { background:${COLORS.accentGlow};color:${COLORS.accent};border:1px solid ${COLORS.accent}33; }
  table { width:100%;border-collapse:collapse;font-size:13px; }
  th { text-align:left;padding:10px 14px;color:${COLORS.textMuted};font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid ${COLORS.border}; }
  td { padding:12px 14px;border-bottom:1px solid ${COLORS.border}22;vertical-align:middle; }
  tr:hover td { background:${COLORS.bgCard2}; }
  .tag { display:inline-block;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase; }
  .progress-bar { height:6px;background:${COLORS.border};border-radius:3px;overflow:hidden; }
  .progress-fill { height:100%;background:linear-gradient(90deg,${COLORS.accent},${COLORS.accent2});border-radius:3px;transition:width 0.8s ease; }
  .stat-card { background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:12px;padding:20px;position:relative;overflow:hidden; }
  .stat-card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent-color),transparent); }
`;

const mockComplaints = [
  { id: "PG-2024-001", type: "Phishing", desc: "Fake bank email asking for OTP", status: "Investigating", date: "2024-01-15", priority: "High", reporter: "Rahul S." },
  { id: "PG-2024-002", type: "UPI Fraud", desc: "Fraudulent UPI payment request", status: "Resolved", date: "2024-01-14", priority: "Critical", reporter: "Priya M." },
  { id: "PG-2024-003", type: "Fake Job", desc: "Fake job offer demanding fees", status: "Pending", date: "2024-01-13", priority: "Medium", reporter: "Amit K." },
  { id: "PG-2024-004", type: "OTP Scam", desc: "Unknown caller requesting OTP", status: "Investigating", date: "2024-01-12", priority: "High", reporter: "Sneha P." },
  { id: "PG-2024-005", type: "Malware", desc: "Suspicious app installed from link", status: "Pending", date: "2024-01-11", priority: "Critical", reporter: "Vijay R." },
  { id: "PG-2024-006", type: "Fake Website", desc: "Cloned HDFC Bank login page", status: "Resolved", date: "2024-01-10", priority: "High", reporter: "Divya N." },
];

const quizQuestions = [
  {
    q: "You receive an email from 'support@paypa1.com' asking you to verify your account. What do you do?",
    options: ["Click the link immediately", "Check the sender domain carefully — 'paypa1' is not 'paypal'", "Reply with your password", "Forward to friends"],
    correct: 1,
    explanation: "Always inspect the sender domain. 'paypa1.com' uses the number '1' instead of the letter 'l' — a classic typosquatting trick.",
  },
  {
    q: "An urgent message says 'Your account will be suspended in 2 hours! Click here NOW'. This is likely:",
    options: ["A legitimate security warning", "A phishing attempt using urgency tactics", "A helpful reminder", "An automated system notice"],
    correct: 1,
    explanation: "Urgency is a key phishing tactic. Legitimate organizations rarely demand immediate action under threat of account suspension.",
  },
  {
    q: "Which URL is safest to enter your banking credentials?",
    options: ["http://sbi-bank-login.net", "https://onlinesbi.sbi (verified padlock)", "https://sbi.secure-login.com", "http://www.sbi.co.in.verify.net"],
    correct: 1,
    explanation: "Always verify the exact domain. Look for HTTPS and the official domain. Subdomains like 'sbi.secure-login.com' are still hosted on 'secure-login.com', not SBI.",
  },
  {
    q: "A stranger on WhatsApp sends you a link saying you've won ₹50,000. What's the red flag?",
    options: ["The amount is too high", "Unsolicited prizes requiring personal info are scams", "WhatsApp can't send prizes", "All of the above"],
    correct: 3,
    explanation: "All are red flags! Unexpected windfalls from strangers are nearly always scams. Never click such links or provide personal information.",
  },
  {
    q: "What does HTTPS padlock icon in the browser address bar guarantee?",
    options: ["The website is legitimate and trustworthy", "Your connection is encrypted (not that the site is safe)", "The site is government approved", "Your data is 100% safe"],
    correct: 1,
    explanation: "HTTPS only means the connection is encrypted. Phishing sites can also use HTTPS. Always verify the domain name separately.",
  },
];

const awarenessModules = [
  {
    icon: "🎣", title: "What is Phishing?", color: COLORS.accent,
    content: "Phishing is a cyberattack where criminals impersonate trusted entities via email, SMS, or websites to steal sensitive information like passwords, OTPs, and banking details.",
    tips: ["Verify sender email domains", "Hover over links before clicking", "Never share OTPs verbally", "Check for HTTPS"],
  },
  {
    icon: "📱", title: "SMS & WhatsApp Scams", color: COLORS.accent2,
    content: "Smishing (SMS phishing) and WhatsApp fraud involve fake messages from banks, delivery services, or government agencies asking for urgent action.",
    tips: ["Banks never ask OTP via SMS reply", "Ignore 'KYC update' messages", "Don't click shortened URLs", "Verify via official helplines"],
  },
  {
    icon: "💸", title: "UPI & Payment Fraud", color: COLORS.yellow,
    content: "Fraudsters create fake UPI payment requests or QR codes that debit instead of credit your account. They exploit the 'Collect Request' feature.",
    tips: ["Receiving money needs no PIN/OTP", "Verify merchant names in UPI apps", "Never scan QR codes from strangers", "Report to your bank immediately"],
  },
  {
    icon: "🔐", title: "Social Engineering", color: "#7C3AED",
    content: "Social engineering manipulates human psychology — trust, fear, urgency, and authority — to bypass technical security measures.",
    tips: ["Verify identity of callers claiming to be officials", "Think before acting under pressure", "Use callback verification", "When in doubt, hang up"],
  },
];

export default function PhishGuard() {
  const [view, setView] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
  fetchComplaints();
}, [user]);
  const [quizState, setQuizState] = useState({ started: false, idx: 0, selected: null, answered: false, score: 0, finished: false });
 const [form, setForm] = useState({
  email: "",
  password: "",
  confirmPassword: "",
  name: ""
});
  const [showPassword, setShowPassword] = useState(false);
  const [complaint, setComplaint] = useState({
  type: "",
  desc: "",
  details: "",
  scamUrl: "",
  upiId: "",
  phoneNumber: "",
  evidence: null
});
  const [submitted, setSubmitted] = useState(null);
  const [filter, setFilter] = useState({ status: "all", type: "all", search: "" });
  const [moduleIdx, setModuleIdx] = useState(0);
  const [progress, setProgress] = useState({ awareness: 0, quiz: 0, reports: 0 });  
  const [adminTab, setAdminTab] = useState("overview");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [urlCheck, setUrlCheck] = useState({ url: "", result: null, loading: false });
  const [notification, setNotification] = useState(null);
useEffect(() => {
  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);

    setUser(parsedUser);

    setView(
      parsedUser.role === "admin"
        ? "admin"
        : "dashboard"
    );
  }
}, []);
  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async () => {
  if (!form.email || !form.password) {
    return showNotif("Fill all fields", "error");
  }

  try {
    const endpoint =
      authMode === "register"
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

    const payload =
      authMode === "register"
        ? {
            name: form.name,
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
          }
        : {
            email: form.email,
            password: form.password,
          };

    const res = await axios.post(endpoint, payload, {
  headers: {
    "Content-Type": "application/json",
  },
});

    const userData = res.data.user;
    console.log(userData);

setUser({
  _id: userData._id,
  name: userData.name,
  email: userData.email,
  role: userData.role,
  complaints: 0,
});

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(userData));

    setView(userData.role === "admin" ? "admin" : "dashboard");

    showNotif(
      authMode === "register"
        ? "Registration successful"
        : "Login successful",
      "success"
    );
  } catch (err) {
    showNotif(
      err.response?.data?.message || "Authentication failed",
      "error"
    );
  }
};

const fetchComplaints = async () => {
  try {

    if (!user?.id) return;

    const response = await axios.get(
      `http://localhost:5000/api/complaints/${user.id}`
    );

    setComplaints(response.data.complaints);

  } catch (error) {
    console.error("Failed to fetch complaints", error);
  }
};
const updateComplaintStatus = async (id, status) => {
  try {

    const response = await axios.put(
      `http://localhost:5000/api/complaints/${id}/status`,
      { status }
    );

    if (response.data.success) {

      setComplaints(prev =>
        prev.map(c =>
          c._id === id
            ? { ...c, status }
            : c
        )
      );

      showNotif("Complaint status updated", "success");
    }

  } catch (error) {
    console.error(error);

    showNotif("Failed to update status", "error");
  }
};
const handleComplaintSubmit = async () => {
  if (!complaint.type || !complaint.desc) {
    return showNotif("Fill all required fields", "error");
  }

  const complaintId = `PG-${Date.now()}`;

  const newC = {
    user: user?.id,
    reporterName: user?.name,
    complaintId,
    type: complaint.type,
    desc: complaint.desc,
    details: complaint.details,
    scamUrl: complaint.scamUrl,
    upiId: complaint.upiId,
    phoneNumber: complaint.phoneNumber,
    evidence: complaint.evidence?.name || "No file",
    status: "Pending",
    date: new Date().toISOString().slice(0, 10),
    priority: "High"
  };

console.log(user);
console.log(newC);

console.log("Submitting:", newC);

const response = await axios.post(
  "http://localhost:5000/api/complaints",
  newC
);

console.log(response.data);

  setComplaint({
    type: "",
    desc: "",
    details: "",
    scamUrl: "",
    upiId: "",
    phoneNumber: "",
    evidence: null
  });

  setSubmitted(complaintId);

showNotif(`Complaint ${complaintId} submitted successfully!`, "success");
};

  const checkUrl = () => {
    if (!urlCheck.url) return;
    setUrlCheck(u => ({ ...u, loading: true }));
    setTimeout(() => {
      const suspicious = urlCheck.url.includes("bit.ly") || urlCheck.url.includes("free") || urlCheck.url.includes("click") || urlCheck.url.includes("win") || urlCheck.url.includes("secure-") || !urlCheck.url.startsWith("https");
      setUrlCheck(u => ({ ...u, loading: false, result: suspicious ? "SUSPICIOUS" : "SAFE" }));
    }, 1800);
  };

  const statusColor = (s) => ({ Pending: COLORS.yellow, Investigating: COLORS.accent, Resolved: COLORS.green }[s] || COLORS.textMuted);
  const priorityColor = (p) => ({ Critical: COLORS.red, High: COLORS.accent2, Medium: COLORS.yellow, Low: COLORS.green }[p] || COLORS.textMuted);

  const filteredComplaints = complaints.filter(c => {
    if (filter.status !== "all" && c.status !== filter.status) return false;
    if (filter.type !== "all" && c.type !== filter.type) return false;
    if (filter.search && !c.desc.toLowerCase().includes(filter.search.toLowerCase()) && !c.id.includes(filter.search)) return false;
    return true;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    investigating: complaints.filter(c => c.status === "Investigating").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
  };

  const navItems = user?.role === "admin"
    ? [
        { id: "admin", icon: "🛡️", label: "Admin Panel" },
        { id: "complaints-list", icon: "📋", label: "All Complaints" },
        { id: "threat-intel", icon: "🔍", label: "Threat Intel" },
      ]
    : [
        { id: "dashboard", icon: "📊", label: "Dashboard" },
        { id: "awareness", icon: "📚", label: "Awareness Training" },
        { id: "quiz", icon: "🎯", label: "Phishing Quiz" },
        { id: "report", icon: "🚨", label: "Report Fraud" },
        { id: "my-complaints", icon: "📁", label: "My Complaints" },
        { id: "url-checker", icon: "🔗", label: "URL Checker" },
      ];

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, position: "relative", overflow: "hidden" }}>
      <style>{css}</style>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 20% 20%, ${COLORS.accent}08 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${COLORS.accent3}08 0%, transparent 50%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.border}15 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border}15 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="fade-in" style={{ width: 400, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: COLORS.accent }} className="glow">PhishGuard</h1>
          <p style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 4 }}>Phishing Awareness & Fraud Reporting System</p>
        </div>
        <div className="card" style={{ border: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", marginBottom: 24, background: COLORS.bg, borderRadius: 8, padding: 4 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setAuthMode(m)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 6, cursor: "pointer", background: authMode === m ? COLORS.accent : "transparent", color: authMode === m ? "#000" : COLORS.textSecondary, fontFamily: "inherit", fontWeight: 600, fontSize: 13, transition: "all 0.2s" }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {authMode === "register" && (
              <div>
                <label style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, display: "block", fontWeight: 600 }}>FULL NAME</label>
                <input className="input" placeholder="Enter your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, display: "block", fontWeight: 600 }}>EMAIL ADDRESS</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, display: "block", fontWeight: 600 }}>PASSWORD</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            {authMode === "register" && (
  <div>
    <label
      style={{
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 6,
        display: "block",
        fontWeight: 600
      }}
    >
      CONFIRM PASSWORD
    </label>

    <input
      className="input"
      type={showPassword ? "text" : "password"}
      placeholder="Confirm password"
      value={form.confirmPassword}
      onChange={(e) =>
        setForm((f) => ({
          ...f,
          confirmPassword: e.target.value
        }))
      }
    />
  </div>
)}
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 8, justifyContent: "center", padding: "12px" }} onClick={handleLogin}>
              {authMode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </div>
          <div style={{ marginTop: 16, padding: "12px", background: `${COLORS.accent}10`, borderRadius: 8, border: `1px solid ${COLORS.accent}22` }}>
            <p style={{ fontSize: 11, color: COLORS.textMuted, textAlign: "center" }}>Secure PhishGuard Cyber Security Portal, use <span className="mono" style={{ color: COLORS.accent }}>admin@...</span> for admin access</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Welcome back, <span style={{ color: COLORS.accent }}>{user.name}</span> 👋</h2>
        <p style={{ color: COLORS.textSecondary, marginTop: 4 }}>Your cybersecurity training progress and threat overview</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Complaints Filed", val: user.complaints, icon: "🚨", color: COLORS.accent2, note: "2 active" },
          { label: "Training Progress", val: `${progress.awareness}%`, icon: "📚", color: COLORS.accent, note: "Keep going!" },
          { label: "Quiz Score", val: `${progress.quiz}%`, icon: "🎯", color: COLORS.green, note: "Top 20%" },
          { label: "Threats Reported", val: "12K+", icon: "🛡️", color: "#7C3AED", note: "Community total" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ "--accent-color": s.color }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: s.color, marginTop: 6, animation: "countUp 0.5s ease" }}>{s.val}</p>
                <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{s.note}</p>
              </div>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Training Progress</h3>
          {[
            { label: "Phishing Awareness", pct: 80, color: COLORS.accent },
            { label: "Social Engineering", pct: 60, color: COLORS.accent2 },
            { label: "Password Security", pct: 90, color: COLORS.green },
            { label: "Malware Awareness", pct: 40, color: "#7C3AED" },
          ].map((m, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${m.pct}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Recent Activity</h3>
          {[
            { icon: "✅", text: "Completed phishing quiz — 4/5 correct", time: "2h ago", c: COLORS.green },
            { icon: "🚨", text: "Reported UPI fraud complaint", time: "1d ago", c: COLORS.accent2 },
            { icon: "📚", text: "Read: Social Engineering Tactics", time: "2d ago", c: COLORS.accent },
            { icon: "🔗", text: "Checked 2 suspicious URLs", time: "3d ago", c: "#7C3AED" },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 12, borderBottom: i < 3 ? `1px solid ${COLORS.border}33` : "none", marginBottom: i < 3 ? 12 : 0 }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: COLORS.textPrimary }}>{a.text}</p>
                <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ border: `1px solid ${COLORS.accent2}44`, background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.accent2}08 100%)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 36 }}>🚨</span>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Have you been targeted by cyber fraud?</h3>
              <p style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>Report phishing attempts, OTP scams, UPI fraud, and more. Your report helps protect others.</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setView("report")}>Report Now →</button>
        </div>
      </div>
    </div>
  );

  const renderAwareness = () => {
    const mod = awarenessModules[moduleIdx];
    return (
      <div className="fade-in">
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Cybersecurity Awareness Training</h2>
          <p style={{ color: COLORS.textSecondary, marginTop: 4 }}>Learn to identify and defend against cyber threats</p>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {awarenessModules.map((m, i) => (
            <button key={i} onClick={() => setModuleIdx(i)} style={{ padding: "10px 16px", borderRadius: 8, border: `1.5px solid ${i === moduleIdx ? m.color : COLORS.border}`, background: i === moduleIdx ? `${m.color}15` : "transparent", color: i === moduleIdx ? m.color : COLORS.textSecondary, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
              {m.icon} {m.title}
            </button>
          ))}
        </div>
        <div className="card" style={{ border: `1px solid ${mod.color}33`, background: `linear-gradient(135deg, ${COLORS.bgCard}, ${mod.color}05)`, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <span style={{ fontSize: 48 }}>{mod.icon}</span>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: mod.color, marginBottom: 12 }}>{mod.title}</h3>
              <p style={{ color: COLORS.textSecondary, lineHeight: 1.7, fontSize: 14 }}>{mod.content}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                {mod.tips.map((t, i) => (
                  <span key={i} style={{ padding: "6px 12px", background: `${mod.color}15`, border: `1px solid ${mod.color}33`, borderRadius: 6, fontSize: 12, color: mod.color, fontWeight: 600 }}>✓ {t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div className="card">
            <h4 style={{ fontWeight: 700, marginBottom: 14, color: COLORS.green, fontSize: 14 }}>✅ Legitimate Email Example</h4>
            <div style={{ background: COLORS.bg, borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 12 }}>
              <div style={{ marginBottom: 6 }}><span style={{ color: COLORS.textMuted }}>From:</span> <span style={{ color: COLORS.green }}>support@hdfc.com</span></div>
              <div style={{ marginBottom: 6 }}><span style={{ color: COLORS.textMuted }}>Subject:</span> Account Statement - January 2024</div>
              <div style={{ color: COLORS.textMuted, lineHeight: 1.6 }}>Dear Customer, your January statement is ready. Login at <span style={{ color: COLORS.green }}>hdfcbank.com</span> to view. No action required.</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: COLORS.green }}>✓ Official domain ✓ No urgency ✓ No credential request</div>
          </div>
          <div className="card">
            <h4 style={{ fontWeight: 700, marginBottom: 14, color: COLORS.red, fontSize: 14 }}>⚠️ Phishing Email Example</h4>
            <div style={{ background: COLORS.bg, borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 12 }}>
              <div style={{ marginBottom: 6 }}><span style={{ color: COLORS.textMuted }}>From:</span> <span style={{ color: COLORS.red }}>noreply@hdfc-security.net</span></div>
              <div style={{ marginBottom: 6 }}><span style={{ color: COLORS.textMuted }}>Subject:</span> 🚨 URGENT: Account will be SUSPENDED!</div>
              <div style={{ color: COLORS.textMuted, lineHeight: 1.6 }}>VERIFY NOW or lose access! Click <span style={{ color: COLORS.red }}>bit.ly/hdfc-verify</span> and enter OTP IMMEDIATELY!</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: COLORS.red }}>⚠️ Wrong domain ⚠️ Urgency/fear ⚠️ Shortened URL ⚠️ OTP request</div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontWeight: 600 }}>Ready to test your knowledge?</p>
            <p style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>Take the phishing identification quiz — 5 questions, instant results</p>
          </div>
          <button className="btn btn-primary" onClick={() => setView("quiz")}>Start Quiz →</button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    const q = quizQuestions[quizState.idx];
    if (quizState.finished) return (
      <div className="fade-in" style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{quizState.score >= 4 ? "🏆" : quizState.score >= 3 ? "👍" : "📚"}</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Quiz Complete!</h2>
        <p style={{ color: COLORS.textSecondary, marginBottom: 24 }}>You scored <span style={{ color: COLORS.accent, fontWeight: 700 }}>{quizState.score}/{quizQuestions.length}</span></p>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="progress-bar" style={{ height: 12 }}>
            <div className="progress-fill" style={{ width: `${(quizState.score / quizQuestions.length) * 100}%` }} />
          </div>
          <p style={{ marginTop: 12, color: quizState.score >= 4 ? COLORS.green : quizState.score >= 3 ? COLORS.yellow : COLORS.red, fontWeight: 600 }}>
            {quizState.score >= 4 ? "Excellent! You're well-prepared against phishing." : quizState.score >= 3 ? "Good job! Review the awareness modules to improve." : "Keep learning! Phishing awareness is critical to your safety."}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setQuizState({ started: false, idx: 0, selected: null, answered: false, score: 0, finished: false })}>Retake Quiz</button>
      </div>
    );
    if (!quizState.started) return (
      <div className="fade-in" style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Phishing Identification Quiz</h2>
        <p style={{ color: COLORS.textSecondary, marginBottom: 24 }}>{quizQuestions.length} questions to test your cyber threat awareness skills</p>
        <div className="card" style={{ textAlign: "left", marginBottom: 24 }}>
          {["Identify real vs. fake phishing scenarios", "Learn red flags in each question", "Instant explanations for each answer", "Score tracked to your profile"].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${COLORS.border}33` : "none" }}>
              <span style={{ color: COLORS.green, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 14, color: COLORS.textSecondary }}>{f}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ fontSize: 16, padding: "14px 32px" }} onClick={() => setQuizState(s => ({ ...s, started: true }))}>Start Quiz →</button>
      </div>
    );
    return (
      <div className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 600 }}>QUESTION {quizState.idx + 1} OF {quizQuestions.length}</span>
          <span style={{ fontSize: 13, color: COLORS.accent, fontWeight: 600 }}>Score: {quizState.score}</span>
        </div>
        <div className="progress-bar" style={{ marginBottom: 28 }}>
          <div className="progress-fill" style={{ width: `${((quizState.idx) / quizQuestions.length) * 100}%` }} />
        </div>
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 16, lineHeight: 1.7, fontWeight: 500 }}>{q.q}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {q.options.map((opt, i) => {
            let bg = COLORS.bgCard, border = COLORS.border, color = COLORS.textPrimary;
            if (quizState.answered) {
              if (i === q.correct) { bg = `${COLORS.green}15`; border = COLORS.green; color = COLORS.green; }
              else if (i === quizState.selected && i !== q.correct) { bg = `${COLORS.red}15`; border = COLORS.red; color = COLORS.red; }
            } else if (i === quizState.selected) { bg = `${COLORS.accent}15`; border = COLORS.accent; }
            return (
              <button key={i} disabled={quizState.answered} onClick={() => setQuizState(s => ({ ...s, selected: i }))} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 10, padding: "14px 18px", cursor: quizState.answered ? "default" : "pointer", textAlign: "left", color, fontFamily: "inherit", fontSize: 14, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: `${border}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, color }}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>
        {quizState.answered && (
          <div className="card fade-in" style={{ marginBottom: 20, border: `1px solid ${quizState.selected === q.correct ? COLORS.green : COLORS.red}44`, background: `${quizState.selected === q.correct ? COLORS.green : COLORS.red}08` }}>
            <p style={{ fontWeight: 700, color: quizState.selected === q.correct ? COLORS.green : COLORS.red, marginBottom: 6 }}>{quizState.selected === q.correct ? "✅ Correct!" : "❌ Incorrect!"}</p>
            <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6 }}>{q.explanation}</p>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          {!quizState.answered ? (
            <button className="btn btn-primary" disabled={quizState.selected === null} onClick={() => setQuizState(s => ({ ...s, answered: true, score: s.selected === q.correct ? s.score + 1 : s.score }))} style={{ opacity: quizState.selected === null ? 0.5 : 1 }}>Submit Answer</button>
          ) : (
            <button className="btn btn-primary" onClick={() => {
              if (quizState.idx + 1 >= quizQuestions.length) setQuizState(s => ({ ...s, finished: true }));
              else setQuizState(s => ({ ...s, idx: s.idx + 1, selected: null, answered: false }));
            }}>
              {quizState.idx + 1 >= quizQuestions.length ? "See Results" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderReport = () => (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Report Cyber Fraud</h2>
        <p style={{ color: COLORS.textSecondary, marginTop: 4 }}>File a complaint about phishing, scams, or cyber fraud incidents</p>
      </div>
      {submitted && (
        <div className="card fade-in" style={{ border: `1px solid ${COLORS.green}44`, background: `${COLORS.green}08`, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>✅</span>
            <div>
              <p style={{ fontWeight: 700, color: COLORS.green }}>Complaint Submitted Successfully!</p>
              <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Your Complaint ID: <span className="mono" style={{ color: COLORS.accent, fontWeight: 700 }}>{submitted}</span> — Track status in "My Complaints"</p>
            </div>
            <button className="btn btn-outline" style={{ marginLeft: "auto" }} onClick={() => { setSubmitted(null); setView("my-complaints"); }}>Track Status</button>
          </div>
        </div>
      )}
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>FRAUD TYPE *</label>
            <select className="input select" value={complaint.type} onChange={e => setComplaint(c => ({ ...c, type: e.target.value }))}>
              <option value="">Select category...</option>
              {["Phishing", "OTP Scam", "UPI Fraud", "Fake Job Scam", "Malware Attack", "Social Media Hack", "Fake Website"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>INCIDENT DATE</label>
            <input className="input" type="date" style={{ colorScheme: "dark" }} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>BRIEF DESCRIPTION *</label>
          <input className="input" placeholder="What happened? (e.g., Received fake bank email asking for OTP)" value={complaint.desc} onChange={e => setComplaint(c => ({ ...c, desc: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>DETAILED ACCOUNT</label>
          <textarea className="input" rows={4} placeholder="Provide full details: What was the URL/number? What information was requested? Any financial loss?" style={{ resize: "vertical", lineHeight: 1.6 }} value={complaint.details} onChange={e => setComplaint(c => ({ ...c, details: e.target.value }))} />
        </div>
        <input
  className="input"
  placeholder="Scam URL (optional)"
  value={complaint.scamUrl}
  onChange={(e) =>
    setComplaint({ ...complaint, scamUrl: e.target.value })
  }
/>

<input
  className="input"
  placeholder="UPI ID involved"
  value={complaint.upiId}
  onChange={(e) =>
    setComplaint({ ...complaint, upiId: e.target.value })
  }
/>

<input
  className="input"
  placeholder="Fraud phone number"
  value={complaint.phoneNumber}
  onChange={(e) =>
    setComplaint({ ...complaint, phoneNumber: e.target.value })
  }
/>

<input
  type="file"
  className="input"
  onChange={(e) =>
    setComplaint({ ...complaint, evidence: e.target.files[0] })
  }
/>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>UPLOAD EVIDENCE</label>
          <div style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 8, padding: "24px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.accent} onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
            <span style={{ fontSize: 28 }}>📎</span>
            <p style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 8 }}>Drag & drop screenshots, email exports, or other evidence</p>
            <p style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4 }}>PNG, JPG, PDF up to 10MB</p>
            <input type="file" style={{ display: "none" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "14px", background: `${COLORS.yellow}10`, borderRadius: 8, marginBottom: 20, border: `1px solid ${COLORS.yellow}22` }}>
          <span>⚠️</span>
          <p style={{ fontSize: 12, color: COLORS.yellow, lineHeight: 1.6 }}>If you've suffered financial loss, also contact your bank's fraud helpline and file a complaint at <strong>cybercrime.gov.in</strong> or call <strong>1930</strong> immediately.</p>
        </div>
        <button className="btn btn-danger" style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 15 }} onClick={handleComplaintSubmit}>
          🚨 Submit Fraud Report
        </button>
      </div>
    </div>
  );

  const renderMyComplaints = () => (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>My Complaints</h2>
        <p style={{ color: COLORS.textSecondary, marginTop: 4 }}>Track the status of your fraud reports</p>
      </div>
      {complaints.slice(0, 3).map((c, i) => (
        <div key={i} className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 13, color: COLORS.accent, fontWeight: 700 }}>{c.id}</span>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: `${statusColor(c.status)}20`, color: statusColor(c.status), fontWeight: 700 }}>{c.status}</span>
              </div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>{c.type}</p>
              <p style={{ fontSize: 13, color: COLORS.textSecondary }}>{c.desc}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, color: COLORS.textMuted }}>{c.date}</p>
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: `${priorityColor(c.priority)}20`, color: priorityColor(c.priority), fontWeight: 700, marginTop: 6, display: "inline-block" }}>{c.priority}</span>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 14 }}>
            <div className="progress-fill" style={{ width: c.status === "Pending" ? "15%" : c.status === "Investigating" ? "55%" : "100%", background: statusColor(c.status) }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: COLORS.textMuted }}>
            <span style={{ color: c.status === "Pending" ? COLORS.yellow : COLORS.textMuted }}>Filed</span>
            <span style={{ color: c.status === "Investigating" ? COLORS.accent : COLORS.textMuted }}>Investigating</span>
            <span style={{ color: c.status === "Resolved" ? COLORS.green : COLORS.textMuted }}>Resolved</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUrlChecker = () => (
    <div className="fade-in" style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>URL Safety Checker</h2>
        <p style={{ color: COLORS.textSecondary, marginTop: 4 }}>Analyze suspicious URLs for phishing indicators</p>
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="input" placeholder="https://suspicious-site.com/verify?..." value={urlCheck.url} onChange={e => setUrlCheck(u => ({ ...u, url: e.target.value, result: null }))} style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && checkUrl()} />
          <button className="btn btn-primary" onClick={checkUrl} disabled={urlCheck.loading} style={{ whiteSpace: "nowrap", opacity: urlCheck.loading ? 0.7 : 1 }}>
            {urlCheck.loading ? "Scanning..." : "🔍 Check URL"}
          </button>
        </div>
        {urlCheck.loading && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Analyzing URL structure and reputation...</p>
          </div>
        )}
        {urlCheck.result && (
          <div className="fade-in" style={{ marginTop: 20, padding: 20, borderRadius: 10, background: urlCheck.result === "SAFE" ? `${COLORS.green}12` : `${COLORS.red}12`, border: `1px solid ${urlCheck.result === "SAFE" ? COLORS.green : COLORS.red}44` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{urlCheck.result === "SAFE" ? "✅" : "🚨"}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 18, color: urlCheck.result === "SAFE" ? COLORS.green : COLORS.red }}>{urlCheck.result}</p>
                <p style={{ fontSize: 13, color: COLORS.textSecondary }}>{urlCheck.result === "SAFE" ? "No obvious phishing indicators detected" : "Multiple suspicious indicators found"}</p>
              </div>
            </div>
            {urlCheck.result === "SUSPICIOUS" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  !urlCheck.url.startsWith("https") && "⚠️ Not using HTTPS encryption",
                  urlCheck.url.includes("bit.ly") && "⚠️ URL shortener detected — hides real destination",
                  urlCheck.url.includes("free") && "⚠️ 'Free' in URL — common phishing lure",
                  urlCheck.url.includes("secure-") && "⚠️ Fake 'secure' prefix in non-official domain",
                ].filter(Boolean).map((w, i) => (
                  <p key={i} style={{ fontSize: 13, color: COLORS.red }}>{w}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="card">
        <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>🔍 What we check</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {["Domain reputation", "HTTPS certificate", "URL structure analysis", "Typosquatting detection", "Known phishing patterns", "Redirect chains"].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: COLORS.textSecondary }}>
              <span style={{ color: COLORS.accent, fontWeight: 700 }}>◆</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ background: `${COLORS.red}20`, padding: "6px 10px", borderRadius: 8, fontSize: 20 }}>🛡️</span>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Admin Dashboard</h2>
            <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>SOC Operations Center — Fraud Complaint Management</p>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, padding: "4px 10px", background: `${COLORS.red}20`, color: COLORS.red, borderRadius: 4, fontWeight: 700, border: `1px solid ${COLORS.red}44` }}>ADMIN ACCESS</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Complaints", val: stats.total, color: COLORS.accent, icon: "📋" },
          { label: "Pending", val: stats.pending, color: COLORS.yellow, icon: "⏳" },
          { label: "Investigating", val: stats.investigating, color: COLORS.accent2, icon: "🔍" },
          { label: "Resolved", val: stats.resolved, color: COLORS.green, icon: "✅" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ "--accent-color": s.color }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: s.color, marginTop: 6 }}>{s.val}</p>
              </div>
              <span style={{ fontSize: 24, opacity: 0.7 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Complaints by Type</h4>
          {[["Phishing", 32, COLORS.accent], ["UPI Fraud", 24, COLORS.accent2], ["OTP Scam", 18, COLORS.yellow], ["Fake Job", 14, "#7C3AED"], ["Malware", 12, COLORS.red]].map(([label, pct, color], i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Recent High-Priority</h4>
          {complaints.filter(c => c.priority === "Critical" || c.priority === "High").slice(0, 4).map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${COLORS.border}22` : "none" }}>
              <span style={{ fontSize: 8, color: priorityColor(c.priority), marginTop: 6 }}>●</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{c.type}</p>
                <p style={{ fontSize: 11, color: COLORS.textMuted }}>{c.id} · {c.date}</p>
              </div>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${statusColor(c.status)}20`, color: statusColor(c.status), fontWeight: 700 }}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComplaintsList = () => (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>All Complaints</h2>
        <button className="btn btn-outline" style={{ fontSize: 12 }}>📥 Export CSV</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", gap: 12, marginBottom: 16 }}>
        <input className="input" placeholder="🔍 Search by ID, description..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
        <select className="input select" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="all">All Status</option>
          {["Pending", "Investigating", "Resolved"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="input select" value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
          <option value="all">All Types</option>
          {["Phishing", "UPI Fraud", "OTP Scam", "Fake Job", "Malware", "Fake Website"].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Complaint ID</th><th>Type</th><th>Description</th><th>Reporter</th><th>Priority</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((c, i) => (
              <tr key={i}>
                <td><span className="mono" style={{ color: COLORS.accent, fontSize: 12 }}>{c.id}</span></td>
                <td><span style={{ fontSize: 12, fontWeight: 600 }}>{c.type}</span></td>
                <td><span style={{ fontSize: 12, color: COLORS.textSecondary }}>{c.desc.slice(0, 40)}...</span></td>
                <td><span style={{ fontSize: 12 }}>{c.reporter}</span></td>
                <td><span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: `${priorityColor(c.priority)}20`, color: priorityColor(c.priority), fontWeight: 700 }}>{c.priority}</span></td>
                <td>
                  <select style={{ background: `${statusColor(c.status)}15`, color: statusColor(c.status), border: `1px solid ${statusColor(c.status)}44`, borderRadius: 6, padding: "4px 8px", fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer" }} value={c.status} onChange={e => { setComplaints(prev => prev.map((x, j) => j === i ? { ...x, status: e.target.value } : x)); showNotif(`Status updated to ${e.target.value}`); }}>
                    {["Pending", "Investigating", "Resolved"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <button onClick={() => setSelectedComplaint(c)} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredComplaints.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: COLORS.textMuted }}>
            <span style={{ fontSize: 32 }}>🔍</span>
            <p style={{ marginTop: 8 }}>No complaints match your filters</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderThreatIntel = () => (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Threat Intelligence</h2>
        <p style={{ color: COLORS.textSecondary, marginTop: 4 }}>Active threats and phishing campaigns</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          { title: "Active Phishing Campaigns", count: "247", trend: "+12% this week", color: COLORS.red, icon: "🎣" },
          { title: "Malicious URLs Detected", count: "1,892", trend: "Last 24 hours", color: COLORS.yellow, icon: "🔗" },
          { title: "Compromised Accounts", count: "34", trend: "Reported today", color: COLORS.accent2, icon: "🔓" },
        ].map((t, i) => (
          <div key={i} className="stat-card" style={{ "--accent-color": t.color }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase" }}>{t.title}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: t.color, margin: "8px 0 4px" }}>{t.count}</p>
                <p style={{ fontSize: 11, color: COLORS.textMuted }}>{t.trend}</p>
              </div>
              <span style={{ fontSize: 24 }}>{t.icon}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Active Threat Feed</h4>
        {[
          { severity: "CRITICAL", msg: "Large-scale SBI phishing campaign detected — fake KYC update emails", time: "5m ago" },
          { severity: "HIGH", msg: "New WhatsApp QR code scam targeting merchants in Maharashtra", time: "18m ago" },
          { severity: "HIGH", msg: "Fake IRCTC ticketing sites spoofing official portal", time: "42m ago" },
          { severity: "MEDIUM", msg: "Counterfeit OLX job listings requesting ₹5000 registration fees", time: "1h ago" },
          { severity: "MEDIUM", msg: "Suspicious APK file circulating via WhatsApp claiming to be Aadhaar update", time: "2h ago" },
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderBottom: i < 4 ? `1px solid ${COLORS.border}33` : "none" }}>
            <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 800, whiteSpace: "nowrap", background: t.severity === "CRITICAL" ? `${COLORS.red}20` : `${COLORS.yellow}20`, color: t.severity === "CRITICAL" ? COLORS.red : COLORS.yellow, letterSpacing: "0.04em" }}>{t.severity}</span>
            <p style={{ flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>{t.msg}</p>
            <span style={{ fontSize: 11, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const views = { dashboard: renderDashboard, awareness: renderAwareness, quiz: renderQuiz, report: renderReport, "my-complaints": renderMyComplaints, "url-checker": renderUrlChecker, admin: renderAdmin, "complaints-list": renderComplaintsList, "threat-intel": renderThreatIntel };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg, fontFamily: "'Space Grotesk', sans-serif", color: COLORS.textPrimary }}>
      <style>{css}</style>

      {notification && (
        <div className="fade-in" style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, background: notification.type === "error" ? `${COLORS.red}20` : `${COLORS.green}20`, border: `1px solid ${notification.type === "error" ? COLORS.red : COLORS.green}44`, color: notification.type === "error" ? COLORS.red : COLORS.green, fontWeight: 600, fontSize: 14, backdropFilter: "blur(10px)" }}>
          {notification.type === "error" ? "⚠️" : "✅"} {notification.msg}
        </div>
      )}

      {selectedComplaint && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelectedComplaint(null)}>
          <div className="card fade-in" style={{ width: 480, maxWidth: "90vw" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Complaint Details</h3>
              <button onClick={() => setSelectedComplaint(null)} style={{ background: "transparent", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            {[["ID", selectedComplaint.complaintId, COLORS.accent], ["Type", selectedComplaint.type, COLORS.textPrimary], ["Description", selectedComplaint.desc, COLORS.textSecondary], ["Reporter", selectedComplaint.reporterName, COLORS.textPrimary], ["Date Filed", new Date(selectedComplaint.createdAt).toLocaleDateString(), COLORS.textPrimary], ["Evidence", selectedComplaint.evidence, COLORS.textPrimary], ["Priority", selectedComplaint.priority, priorityColor(selectedComplaint.priority)], ["Status", selectedComplaint.status, statusColor(selectedComplaint.status)]].map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}33` }}>
                <span style={{ color: COLORS.textMuted, fontSize: 13 }}>{k}</span>
                <span style={{ color: c, fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))}

<div
  style={{
    display: "flex",
    gap: 12,
    marginTop: 24,
    justifyContent: "flex-end"
  }}
>
  <button
    onClick={() =>
      updateComplaintStatus(selectedComplaint._id, "Investigating")
    }
    style={{
      padding: "10px 16px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      background: "#f59e0b",
      color: "white",
      fontWeight: 600
    }}
  >
    Start Investigation
  </button>

  <button
    onClick={() =>
      updateComplaintStatus(selectedComplaint._id, "Resolved")
    }
    style={{
      padding: "10px 16px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      background: "#10b981",
      color: "white",
      fontWeight: 600
    }}
  >
    Mark Resolved
  </button>
</div>
{selectedComplaint.evidence &&
 selectedComplaint.evidence !== "No file" && (
  <div style={{ marginTop: 20 }}>
    <h4
      style={{
        marginBottom: 12,
        color: COLORS.textPrimary
      }}
    >
      Evidence Preview
    </h4>

    <img
      src={`http://localhost:5000/uploads/${selectedComplaint.evidence}`}
      alt="Evidence"
      style={{
        width: "100%",
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        maxHeight: 300,
        objectFit: "cover"
      }}
    />
  </div>
)}

          </div>
        </div>
      )}

      <aside style={{ width: 240, background: COLORS.bgCard, borderRight: `1px solid ${COLORS.border}`, padding: "24px 16px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "0 8px" }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15, color: COLORS.accent }} className="glow">PhishGuard</span>
            <p style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em" }}>CYBER AWARENESS</p>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 700, letterSpacing: "0.12em", padding: "0 8px", marginBottom: 8, textTransform: "uppercase" }}>Navigation</p>
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${view === item.id ? "active" : ""}`} onClick={() => setView(item.id)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 8, background: COLORS.bgCard2, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${COLORS.accent}20`, border: `1px solid ${COLORS.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: COLORS.accent, flexShrink: 0 }}>
              {user.name[0]}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
              <p style={{ fontSize: 10, color: COLORS.textMuted }}>{user.role === "admin" ? "🔴 Admin" : "🟢 User"}</p>
            </div>
          </div>
          <button className="nav-item" onClick={() => { setUser(null); setForm({ email: "", password: "", name: "" }); }} style={{ width: "100%", color: COLORS.red }}>
            <span>🚪</span><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", minWidth: 0 }}>
        {(views[view] || renderDashboard)()}
      </main>
    </div>
  );
}
