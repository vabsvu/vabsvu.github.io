// App.tsx
import React from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import OpeningSequence from "./components/OpeningSequence";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-[#992b0d] via-[#761f0a] to-[#4d1405]">
        <main className="relative z-10">
          <OpeningSequence />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;