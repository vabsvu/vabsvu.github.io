import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional context label included in console output, e.g. "events-calendar". */
  label?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const label = this.props.label ? `[${this.props.label}] ` : "";
    console.error(`${label}ErrorBoundary caught:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div className="mx-auto my-6 max-w-md rounded-xl border border-gold/30 bg-black/20 p-6 text-center">
          <p className="font-quattrocento text-almond">
            Something went wrong loading this section.
          </p>
          <p className="mt-1 font-anonymous text-xs text-gold/70">
            The rest of the page is unaffected.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
