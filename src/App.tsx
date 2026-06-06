// App.tsx
import React from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import SiteLayout from "./components/layout/SiteLayout";

function AppCrashFallback() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center"
      style={{
        background:
          "linear-gradient(to bottom right, #992b0d, #761f0a, #4d1405)",
        color: "#eae0d5",
      }}
    >
      <h1
        className="font-quattrocento"
        style={{
          fontSize: "1.75rem",
          letterSpacing: "0.35em",
          textIndent: "0.35em",
          color: "#bf9b30",
          fontFamily: '"Quattrocento", Georgia, serif',
        }}
      >
        VABS
      </h1>
      <p
        className="font-quattrocento"
        style={{ maxWidth: "28rem", lineHeight: 1.6 }}
      >
        Something went wrong loading the site. A refresh usually fixes it.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="font-quattrocento"
        style={{
          marginTop: "0.5rem",
          padding: "0.6rem 1.6rem",
          borderRadius: "9999px",
          border: "1px solid #bf9b30",
          background: "rgba(191, 155, 48, 0.12)",
          color: "#bf9b30",
          cursor: "pointer",
        }}
      >
        Reload page
      </button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary label="app" fallback={<AppCrashFallback />}>
      {/* NOTE: do NOT import framer-motion (e.g. MotionConfig) here — App is
          in the eager entry chunk and would drag the framer chunk into the
          initial load. The lazy sections that use framer-motion wrap
          themselves in <MotionConfig reducedMotion="user"> instead. */}
      <div className="min-h-screen bg-gradient-to-br from-[#992b0d] via-[#761f0a] to-[#4d1405]">
        <main className="relative z-10">
          <SiteLayout />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
