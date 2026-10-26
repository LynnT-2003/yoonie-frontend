"use client";

import * as React from "react";

export default function ArchitectureWhitepaperPage() {
  React.useEffect(() => {
    // Dynamically load Mermaid for interactive browser rendering
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    script.async = true;
    script.onload = () => {
      // @ts-expect-error mermaid global
      if (window.mermaid) {
        // @ts-expect-error mermaid global
        window.mermaid.initialize({
          startOnLoad: true,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#0B1120",
            primaryColor: "#1E293B",
            primaryTextColor: "#F8FAFC",
            primaryBorderColor: "#38BDF8",
            lineColor: "#38BDF8",
            secondaryColor: "#111827",
            tertiaryColor: "#0F172A",
            actorBorder: "#38BDF8",
            actorBkg: "#1E293B",
            actorTextColor: "#F8FAFC",
            signalColor: "#38BDF8",
            signalTextColor: "#F8FAFC",
          },
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F3F4F6] font-sans antialiased py-10 px-4 sm:px-6 lg:px-8 selection:bg-sky-500/30">
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #111827 !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          .print-clean {
            background: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
            color: #111827 !important;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Top Floating Control Bar */}
        <div className="flex justify-between items-center mb-8 no-print">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ENTERPRISE ARCHITECTURE DOSSIER (v2.4 CTO REVIEW)
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-white text-[#090D16] px-5 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-slate-200 transition-all cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Export to PDF / Print Pitch Deck
          </button>
        </div>

        {/* Hero Section */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-sky-500/10 via-slate-900/40 to-transparent p-8 sm:p-12 mb-10 relative overflow-hidden">
          <div className="flex flex-wrap gap-2.5 mb-5 font-mono text-xs uppercase tracking-wider">
            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Yoonie Unified OS
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Zero Double-Booking SLA
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Autonomous 05:30 Dispatch
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Data-Grounded AI Concierge
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Enterprise System Architecture & Due Diligence Whitepaper
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed mb-6">
            Comprehensive architectural breakdown of the Yoonie Hospitality Operating System. Engineered for sub-100ms global edge ingress, 
            strict host-based multi-tenancy isolation, optimistic concurrency guarantees, automated morning dispatch execution, 
            and an event-driven AI concierge pipeline.
          </p>

          <div className="font-mono text-xs text-slate-500">
            Author: Yoonie Engineering Group • Classification: Master Technical Flex & Pitch Deck Appendix
          </div>
        </div>

        {/* 3 Metric Flex Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-sky-400 text-xl font-bold mb-2 flex items-center gap-2">
              <span>⚡</span> Instant Tenant Provisioning
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Wildcard DNS (<code>*.yoonie.app</code>) + Vercel Edge routing enables any hotel to launch their branded direct-booking site in <strong>&lt; 60 seconds</strong> with automated wildcard SSL.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-emerald-400 text-xl font-bold mb-2 flex items-center gap-2">
              <span>🔒</span> Concurrency & Atomic Locking
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Atomic Compare-And-Swap (CAS) counter decrements + 15-minute TTL hold leases eliminate room and excursion over-allocation during peak holiday traffic surges.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-purple-400 text-xl font-bold mb-2 flex items-center gap-2">
              <span>🤖</span> Data-Grounded AI Concierge
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              n8n webhook orchestrator + live backend tool execution. Direct WhatsApp & LINE synchronization for guests, airport drivers, and operations supervisors.
            </p>
          </div>
        </div>

        {/* SECTION 1: TOP-DOWN VISUAL CTO ARCHITECTURE DIAGRAM */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3 border-b border-slate-800 pb-3">
            <span>1.</span> Executive Top-Down System Topology
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Traffic flows through four decoupled tiers: Cloudflare Anycast Edge, Vercel Dynamic Ingress Routing, 
            NestJS 10 Distributed Microservices Core, and MongoDB Atlas Multi-Tenant Replica Sets coupled with an asynchronous AI event mesh.
          </p>

          <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-4 sm:p-6 overflow-x-auto shadow-2xl">
            <svg
              className="w-full h-auto min-w-[850px]"
              viewBox="0 0 1000 620"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="1000" height="620" rx="16" fill="#0B1120" />

              {/* TIER 1: CLIENTS */}
              <rect
                x="30"
                y="30"
                width="940"
                height="70"
                rx="12"
                fill="#111827"
                stroke="#1F2937"
                strokeWidth="1.5"
              />
              <text
                x="50"
                y="60"
                fill="#94A3B8"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="12"
                fontWeight="600"
              >
                TIER 1: CLIENT INGRESS
              </text>

              <rect
                x="220"
                y="45"
                width="160"
                height="40"
                rx="8"
                fill="#1E293B"
                stroke="#38BDF8"
              />
              <text
                x="300"
                y="70"
                fill="#F8FAFC"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                Guest Direct Web
              </text>

              <rect
                x="400"
                y="45"
                width="160"
                height="40"
                rx="8"
                fill="#1E293B"
                stroke="#38BDF8"
              />
              <text
                x="480"
                y="70"
                fill="#F8FAFC"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                Central Ops Portal
              </text>

              <rect
                x="580"
                y="45"
                width="160"
                height="40"
                rx="8"
                fill="#1E293B"
                stroke="#38BDF8"
              />
              <text
                x="660"
                y="70"
                fill="#F8FAFC"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                Platform Landing
              </text>

              <rect
                x="760"
                y="45"
                width="180"
                height="40"
                rx="8"
                fill="#1E293B"
                stroke="#C084FC"
              />
              <text
                x="850"
                y="70"
                fill="#F8FAFC"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                Mobile Staff (Offline SQLite)
              </text>

              {/* CONNECTORS */}
              <path
                d="M 500 100 L 500 135"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* TIER 2: EDGE INGRESS */}
              <rect
                x="30"
                y="135"
                width="940"
                height="90"
                rx="12"
                fill="#0F172A"
                stroke="#38BDF8"
                strokeWidth="1.5"
              />
              <text
                x="50"
                y="165"
                fill="#38BDF8"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="12"
                fontWeight="600"
              >
                TIER 2: EDGE INGRESS & ROUTING (Cloudflare Anycast + Vercel)
              </text>

              <rect
                x="60"
                y="175"
                width="260"
                height="36"
                rx="6"
                fill="#1E293B"
              />
              <text
                x="190"
                y="198"
                fill="#CBD5E1"
                fontSize="11"
                textAnchor="middle"
              >
                Anycast DNS: *.yoonie.app (76.76.21.21)
              </text>

              <rect
                x="340"
                y="175"
                width="240"
                height="36"
                rx="6"
                fill="#1E293B"
              />
              <text
                x="460"
                y="198"
                fill="#CBD5E1"
                fontSize="11"
                textAnchor="middle"
              >
                Automated Wildcard SSL / TLS 1.3
              </text>

              <rect
                x="600"
                y="175"
                width="340"
                height="36"
                rx="6"
                fill="#1E293B"
                stroke="#34D399"
              />
              <text
                x="770"
                y="198"
                fill="#34D399"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                Next.js 16 proxy.ts: Host Subdomain Resolution
              </text>

              {/* CONNECTORS */}
              <path d="M 500 225 L 500 260" stroke="#818CF8" strokeWidth="2" />

              {/* TIER 3: NESTJS BACKEND */}
              <rect
                x="30"
                y="260"
                width="940"
                height="150"
                rx="12"
                fill="#111827"
                stroke="#818CF8"
                strokeWidth="1.5"
              />
              <text
                x="50"
                y="290"
                fill="#818CF8"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="12"
                fontWeight="600"
              >
                TIER 3: CORE BACKEND & ZERO-TRUST SECURITY ENGINE (NestJS 10)
              </text>

              <rect
                x="60"
                y="305"
                width="160"
                height="85"
                rx="8"
                fill="#1E293B"
                stroke="#475569"
              />
              <text
                x="140"
                y="330"
                fill="#F8FAFC"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                Security Pipeline
              </text>
              <text
                x="140"
                y="350"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • JWT 15m / 7d Refresh
              </text>
              <text
                x="140"
                y="365"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • 5-Role RBAC Matrix
              </text>
              <text
                x="140"
                y="380"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • TenantContextGuard
              </text>

              <rect
                x="235"
                y="305"
                width="165"
                height="85"
                rx="8"
                fill="#1E293B"
                stroke="#475569"
              />
              <text
                x="317"
                y="330"
                fill="#F8FAFC"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                Concurrency Core
              </text>
              <text
                x="317"
                y="350"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • Atomic CAS Counter
              </text>
              <text
                x="317"
                y="365"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • 15-Min TTL Hold Leases
              </text>
              <text
                x="317"
                y="380"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • Idempotency Engine
              </text>

              <rect
                x="415"
                y="305"
                width="165"
                height="85"
                rx="8"
                fill="#1E293B"
                stroke="#475569"
              />
              <text
                x="497"
                y="330"
                fill="#F8FAFC"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                Domain Modules
              </text>
              <text
                x="497"
                y="350"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • Room & Housekeeping
              </text>
              <text
                x="497"
                y="365"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • Restaurant Shifts
              </text>
              <text
                x="497"
                y="380"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • Composite Orders
              </text>

              <rect
                x="595"
                y="305"
                width="165"
                height="85"
                rx="8"
                fill="#1E293B"
                stroke="#F59E0B"
              />
              <text
                x="677"
                y="330"
                fill="#F59E0B"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                Cron Automation
              </text>
              <text
                x="677"
                y="350"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • 05:30 Dispatch Runner
              </text>
              <text
                x="677"
                y="365"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • 60s Hold TTL Sweeper
              </text>
              <text
                x="677"
                y="380"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • Tour Yield Consolidator
              </text>

              <rect
                x="775"
                y="305"
                width="175"
                height="85"
                rx="8"
                fill="#1E293B"
                stroke="#A855F7"
              />
              <text
                x="862"
                y="330"
                fill="#A855F7"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                AI & Webhooks
              </text>
              <text
                x="862"
                y="350"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • n8n Webhook Bus
              </text>
              <text
                x="862"
                y="365"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • Guest Concierge RAG
              </text>
              <text
                x="862"
                y="380"
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
              >
                • WhatsApp / LINE Cards
              </text>

              {/* CONNECTORS */}
              <path d="M 315 410 L 315 450" stroke="#34D399" strokeWidth="2" />
              <path d="M 862 410 L 862 450" stroke="#A855F7" strokeWidth="2" />

              {/* TIER 4 */}
              <rect
                x="30"
                y="450"
                width="560"
                height="135"
                rx="12"
                fill="#0B151F"
                stroke="#34D399"
                strokeWidth="1.5"
              />
              <text
                x="50"
                y="480"
                fill="#34D399"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="12"
                fontWeight="600"
              >
                TIER 4A: MONGODB ATLAS MULTI-TENANT REPLICA SET
              </text>
              <text x="50" y="510" fill="#CBD5E1" fontSize="11">
                9 Core Collections with Compound Foreign Tenant Keys:{" "}
                <tspan fill="#34D399">{"{ branchId: 1, ... }"}</tspan>
              </text>
              <text x="50" y="535" fill="#94A3B8" fontSize="11">
                Collections: branches, users, rooms, restaurants, services,
                inventory_slots, inventory_holds, orders, operational_dispatches
              </text>
              <text
                x="50"
                y="560"
                fill="#38BDF8"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="10"
              >
                Multi-Document ACID Transactions • Secondary Read Preference •
                Sharding Ready
              </text>

              <rect
                x="610"
                y="450"
                width="360"
                height="135"
                rx="12"
                fill="#1A102F"
                stroke="#A855F7"
                strokeWidth="1.5"
              />
              <text
                x="630"
                y="480"
                fill="#A855F7"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="12"
                fontWeight="600"
              >
                TIER 4B: OMNI-CHANNEL DELIVERY
              </text>
              <text x="630" y="510" fill="#E2E8F0" fontSize="11">
                • WhatsApp Cloud API (Bilingual Greeting Cards)
              </text>
              <text x="630" y="530" fill="#E2E8F0" fontSize="11">
                • LINE Official Account (Frontline Driver Alerts)
              </text>
              <text x="630" y="550" fill="#E2E8F0" fontSize="11">
                • Google FCM (Native Mobile Push Notifications)
              </text>
              <text x="630" y="570" fill="#E2E8F0" fontSize="11">
                • SendGrid / Twilio (Instant Tax Invoices & SMS)
              </text>
            </svg>
            <div className="font-mono text-center text-xs text-slate-500 mt-4 tracking-wider">
              FIGURE 1.0 — MASTER TOPOLOGY: INGRESS, RUNTIME, CONCURRENCY & NOTIFICATION GRID
            </div>
          </div>
        </section>

        {/* SECTION 2: AUTHENTICATION, JWT REFRESH ROTATION */}
        <div className="page-break"></div>
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3 border-b border-slate-800 pb-3">
            <span>2.</span> Zero-Trust Authentication, JWT Rotation & RBAC
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Yoonie implements an ephemeral 15-minute access token combined with a 7-day cryptographic refresh token family. 
            All network calls flow through an automated single-flight mutex queue that intercepts HTTP 401s, silently rotates the token pair, 
            and transparently replays queued requests with zero user disruption.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <h3 className="text-lg font-bold text-sky-400 mb-2">
                Stateless Access Token Claims
              </h3>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
{`{
  "sub": "usr_kanya_99182",
  "email": "kanya@riverside-bkk.example",
  "role": "ADMIN",
  "branchIds": ["branch_bkk_01", "branch_phuket_02"],
  "defaultBranchId": "branch_bkk_01",
  "iat": 1740000000,
  "exp": 1740000900
}`}
              </pre>
              <p className="text-xs text-slate-400 mt-3">
                Held in-memory inside <code>tokenStore.ts</code> to prevent XSS vulnerability; validated on each backend controller using NestJS <code>JwtAuthGuard</code>.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <h3 className="text-lg font-bold text-sky-400 mb-2">
                5-Tier RBAC Permission Hierarchy
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="font-mono text-sky-400 font-bold">ADMIN</span>
                  <span className="text-slate-300">All property branches, billing, user provisioning, revenue CMS</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="font-mono text-emerald-400 font-bold">BRANCH_MGR</span>
                  <span className="text-slate-300">Assigned branches, inventory overrides, staff rostering</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="font-mono text-amber-400 font-bold">DISPATCHER</span>
                  <span className="text-slate-300">05:30 run-sheet, airport driver matching, tour logistics</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="font-mono text-purple-400 font-bold">STAFF</span>
                  <span className="text-slate-300">Housekeeping dirty/clean queue, driver trip status</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="font-mono text-slate-400 font-bold">GUEST</span>
                  <span className="text-slate-300">Direct booking, composite cart, stay receipts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-6 shadow-xl overflow-x-auto">
            <pre className="mermaid">
{`sequenceDiagram
    autonumber
    actor User as Client Browser / Mobile
    participant NM as NetworkManager (Single-Flight Mutex)
    participant Store as tokenStore (In-Memory)
    participant AuthAPI as NestJS AuthController (:8080)
    participant DB as MongoDB Atlas

    Note over User,AuthAPI: 1. Authoritative Sign-In (/login)
    User->>NM: login("kanya@example.com", "Password123!")
    NM->>AuthAPI: POST /api/auth/login
    AuthAPI->>DB: Verify bcrypt hash & issue token family
    DB-->>AuthAPI: User record { role: "ADMIN", branchIds: [...] }
    AuthAPI-->>NM: { accessToken (15m), refreshToken (7d), user }
    NM->>Store: Store in-memory accessToken & refreshToken
    NM-->>User: Auth Success (Redirect to /ops/dispatch)

    Note over User,AuthAPI: 2. Silent Refresh on HTTP 401 with Stampede Prevention
    User->>NM: Parallel GET /api/v1/rooms & GET /api/v1/orders
    NM->>AuthAPI: Headers: Bearer ExpiredToken
    AuthAPI-->>NM: 401 Unauthorized

    rect rgb(20, 30, 45)
        Note over NM: Mutex Activated: refreshPromise created<br/>Second call attaches to the same promise
        NM->>AuthAPI: POST /api/auth/refresh { userId, refreshToken }
        AuthAPI->>DB: Atomically rotate refresh token (Detect reuse)
        DB-->>AuthAPI: New Token Pair Issued
        AuthAPI-->>NM: { accessToken: "fresh_jwt", refreshToken: "new_refresh" }
        NM->>Store: updateTokens(fresh_jwt, new_refresh)
    end

    Note over NM,User: Replay queued requests with fresh_jwt
    NM->>AuthAPI: GET /api/v1/rooms with fresh_jwt
    AuthAPI-->>User: HTTP 200 OK`}
            </pre>
            <div className="font-mono text-center text-xs text-slate-500 mt-4 tracking-wider">
              FIGURE 2.0 — STAMPEDE-IMMUNE AUTHENTICATION & TOKEN ROTATION LIFECYCLE
            </div>
          </div>
        </section>

        {/* SECTION 3: CONCURRENCY, ATOMIC HOLDS & IDEMPOTENCY */}
        <div className="page-break"></div>
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3 border-b border-slate-800 pb-3">
            <span>3.</span> Concurrency, 15-Minute Holds & Idempotency Pipeline
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            During flash booking events, multiple guests frequently attempt to reserve the final remaining villa. 
            Yoonie completely eliminates double-booking via atomic database preconditions and temporary hold leases.
          </p>

          <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-6 shadow-xl overflow-x-auto">
            <pre className="mermaid">
{`sequenceDiagram
    autonumber
    actor Guest1 as Guest A (Bangkok)
    actor Guest2 as Guest B (London)
    participant Edge as Edge Gateway
    participant HoldService as InventoryHoldService
    participant DB as MongoDB Atlas Cluster

    Note over Guest1,Guest2: Final Deluxe Pool Villa Available (Count = 1)
    
    par Race Condition Checkout
        Guest1->>Edge: POST /api/inventory/hold<br/>Idempotency-Key: "idemp_1001"
        Guest2->>Edge: POST /api/inventory/hold<br/>Idempotency-Key: "idemp_2002"
    end

    Edge->>HoldService: Process Hold Request A
    HoldService->>DB: findOneAndUpdate({ slotId: "101", available: { $gte: 1 } }, { $inc: { available: -1 } })
    Note over DB: Atomic CAS Evaluates TRUE.<br/>Available decremented from 1 to 0.
    DB-->>HoldService: { status: "SUCCESS", slotId: "101" }
    HoldService->>DB: insertOne(inventory_holds, { expiresAt: NOW() + 15m })
    HoldService-->>Guest1: HTTP 201 Created (Hold Token: "hold_9921", Expires: 15:00)

    Edge->>HoldService: Process Hold Request B
    HoldService->>DB: findOneAndUpdate({ slotId: "101", available: { $gte: 1 } }, { $inc: { available: -1 } })
    Note over DB: Atomic CAS Evaluates FALSE.<br/>Available is 0. Operation Aborted.
    DB-->>HoldService: null (No Document Modified)
    HoldService-->>Guest2: HTTP 409 Conflict ("Inventory Sold Out")`}
            </pre>
            <div className="font-mono text-center text-xs text-slate-500 mt-4 tracking-wider">
              FIGURE 3.0 — SUB-MILLISECOND CONCURRENCY LOCK & RACE CONDITION RESOLUTION
            </div>
          </div>
        </section>

        {/* SECTION 4: CRON ENGINE & NODE SCHEDULER */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3 border-b border-slate-800 pb-3">
            <span>4.</span> Automated Cron Engine & Node Scheduler
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Eliminating manual hotel paperwork requires reliable cron workflows. 
            Yoonie runs a stateful distributed scheduler executing three critical background jobs:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="font-mono text-xs text-amber-400 mb-1">CRON: 30 5 * * *</div>
              <h3 className="text-lg font-bold text-white mb-2">05:30 Dispatch Runner</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Aggregates today’s arrivals, pairs airport flights (e.g. TG917) with driver rosters, groups shared boat tours, and writes to <code>operational_dispatches</code>.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="font-mono text-xs text-emerald-400 mb-1">CRON: * * * * *</div>
              <h3 className="text-lg font-bold text-white mb-2">60s Hold TTL Sweeper</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Finds abandoned shopping carts where <code>expiresAt &lt;= NOW()</code> and status is <code>PENDING</code>. Atomically releases slots back to the public booking engine.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="font-mono text-xs text-sky-400 mb-1">CRON: 0 */2 * * *</div>
              <h3 className="text-lg font-bold text-white mb-2">Tour Yield Optimizer</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Scans shared excursions 24h prior to departure. If bookings are below economic viability (&lt;4 pax), flags a consolidation warning to prevent vessel fuel loss.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-6 shadow-xl overflow-x-auto">
            <pre className="mermaid">
{`sequenceDiagram
    autonumber
    participant Cron as Node Scheduler (05:30 AM)
    participant Engine as DispatchSynthesisEngine
    participant DB as MongoDB Atlas
    participant N8N as n8n Webhook Bus
    participant Mobile as yoonie-mobile-staff (FCM)

    Cron->>Engine: Trigger executeMorningDispatchJob()
    Engine->>DB: Query Confirmed Orders for Today { checkIn: TODAY }
    DB-->>Engine: [ Villa Bookings, TG917 Flight Pickups, Longtail Tours ]

    rect rgb(20, 30, 45)
        Note over Engine: 1. Synthesize Airport Transfers (Match Driver Somchai with Flight TG917)<br/>2. Group Island Excursions (Check-in time & Pier Gates)<br/>3. Compute Housekeeping Turnaround Priorities by Guest Arrival ETA
        Engine->>DB: Bulk Write to operational_dispatches
    end

    Engine->>N8N: POST /webhook/morning-dispatch-ready { branchId, taskCount }
    N8N->>Mobile: Send FCM Push Notification to Drivers & Housekeepers
    Mobile-->>Engine: Staff Mobile Acknowledges Roster Sync
    Note over Engine: Dispatch run-sheet live at ops.yoonie.app/ops/dispatch`}
            </pre>
            <div className="font-mono text-center text-xs text-slate-500 mt-4 tracking-wider">
              FIGURE 4.0 — 05:30 DISPATCH SYNTHESIS & REAL-TIME STAFF ROSTERING
            </div>
          </div>
        </section>

        {/* SECTION 5: DATA-DRIVEN AI ENGINE & RAG */}
        <div className="page-break"></div>
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3 border-b border-slate-800 pb-3">
            <span>5.</span> Data-Driven AI Concierge & Autonomous Tool Engine
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            The Yoonie AI Concierge eliminates generic hallucinations by binding LLMs directly to live MongoDB operational queries. 
            When a guest asks for dining reservations or airport pickup information, the assistant invokes real-time backend tool APIs.
          </p>

          <div className="rounded-2xl border border-slate-800 bg-[#0B1120] p-6 shadow-xl overflow-x-auto">
            <pre className="mermaid">
{`sequenceDiagram
    autonumber
    actor Guest as Guest (WhatsApp / Web Chat)
    participant N8N as n8n Webhook / Router
    participant LLM as Agentic LLM Orchestrator
    participant API as Yoonie Core Backend (:8080)
    participant DB as MongoDB Atlas

    Guest->>N8N: "Can I book a table at the Riverside Terrace tonight at 7 PM for 2?"
    N8N->>LLM: Ingest User Message + Tenant Context (Sedona Hotel)
    
    Note over LLM: Evaluates intent: Dining Reservation<br/>Generates Tool Call: query_dining_availability()
    LLM->>API: POST /api/restaurant/check-availability { branchId: "sedona", date: "2026-10-27", time: "19:00", pax: 2 }
    API->>DB: Query restaurant table shifts
    DB-->>API: Available: Table 4 (Terrace Riverfront)
    API-->>LLM: { status: "AVAILABLE", tableId: "T4", shift: "EVENING" }

    Note over LLM: Formats bilingual confirmation with VIP hotel tone
    LLM-->>N8N: "I've held Table 4 on the Riverfront Terrace for 7:00 PM tonight! Shall I confirm?"
    N8N->>Guest: Deliver Instant Message via WhatsApp Cloud API`}
            </pre>
            <div className="font-mono text-center text-xs text-slate-500 mt-4 tracking-wider">
              FIGURE 5.0 — REAL-TIME AGENTIC TOOL EXECUTION & OMNI-CHANNEL DELIVERY LOOP
            </div>
          </div>
        </section>

        {/* SECTION 6: INVESTOR & TECHNICAL FLEX SUMMARY TABLE */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3 border-b border-slate-800 pb-3">
            <span>6.</span> Technical Flex & Pitch Deck Comparison
          </h2>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-200 border-b border-slate-800 font-mono text-xs uppercase">
                <tr>
                  <th className="p-4">Capability</th>
                  <th className="p-4">Legacy Hospitality Stack (Opera / SiteMinder)</th>
                  <th className="p-4 text-emerald-400">Yoonie Unified OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-4 font-bold text-white">Tenant Provisioning</td>
                  <td className="p-4 text-slate-400">Weeks of manual DNS, database migrations & IT setup.</td>
                  <td className="p-4 text-emerald-400 font-semibold">&lt; 60s via Wildcard DNS (*.yoonie.app) + Edge Rewrites</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Cart Checkout</td>
                  <td className="p-4 text-slate-400">Fragmented: Room only. Tours on Viator, dining by phone.</td>
                  <td className="p-4 text-emerald-400 font-semibold">Composite Cart: Room + Fleet + Yacht Tour + Dining in 1 transaction</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Double-Booking SLA</td>
                  <td className="p-4 text-slate-400">Periodic batch sync leading to frequent overbooking disputes.</td>
                  <td className="p-4 text-emerald-400 font-semibold">Atomic CAS Preconditions + 15-Min TTL Hold Leases</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Frontline Execution</td>
                  <td className="p-4 text-slate-400">Printed morning clipboards, two-way radios, lost tasks.</td>
                  <td className="p-4 text-emerald-400 font-semibold">05:30 Autonomous Dispatch Hub + Offline Mobile SQLite Sync</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Guest Concierge</td>
                  <td className="p-4 text-slate-400">Unconnected static FAQ chatbots with frequent hallucinations.</td>
                  <td className="p-4 text-emerald-400 font-semibold">Grounded RAG with live operational tool calling & WhatsApp sync</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-8 pb-16 text-center text-xs font-mono text-slate-500">
          CONFIDENTIAL & PROPRIETARY — YOONIE HOSPITALITY OPERATING SYSTEM (YOONIE.APP) — CTO TECHNICAL SPECIFICATION
        </div>
      </div>
    </div>
  );
}
