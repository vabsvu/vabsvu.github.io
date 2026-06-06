import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Instagram, Users } from "lucide-react";
import type { CalendarEvent } from "../../types/events";
import { formatTime } from "./formatters";

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

function formatDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function EventModal({ event, onClose }: EventModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape + lock body scroll while open
  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [event, onClose]);

  // Focus management: move focus into the dialog on open, trap Tab inside
  // the panel, and restore focus to the invoking element on close.
  useEffect(() => {
    if (!event) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (active && !panelRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [event]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel — capped to the viewport and scrollable inside, since
              body scroll is locked while the modal is open */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-gradient-to-br from-[#460b2f] to-[#9a031e] border border-gold/20 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Close button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close event details"
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-almond/70 hover:text-almond transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            {event.imageUrl && (
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {/* Category badge */}
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-quattrocento text-almond/80 bg-gold/15 border border-gold/20 mb-3 capitalize">
                {event.category}
              </span>

              <h3
                id="event-modal-title"
                className="text-2xl font-quattrocento font-bold text-almond mb-4"
              >
                {event.title}
              </h3>

              <div className="space-y-2 mb-4">
                {/* Date */}
                <div className="flex items-center gap-2 text-almond/70">
                  <Clock className="w-4 h-4 text-gold" aria-hidden="true" />
                  <span className="text-sm font-quattrocento">
                    {formatDate(event.date)}
                    {event.startTime && `, ${formatTime(event.startTime)}`}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </span>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-2 text-almond/70">
                    <MapPin className="w-4 h-4 text-gold" aria-hidden="true" />
                    <span className="text-sm font-quattrocento">
                      {event.location}
                    </span>
                  </div>
                )}

                {/* Host */}
                {event.host && (
                  <div className="flex items-center gap-2 text-almond/70">
                    <Users className="w-4 h-4 text-gold" aria-hidden="true" />
                    <span className="text-sm font-quattrocento">
                      Hosted by {event.host}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-almond/60 text-sm font-quattrocento leading-relaxed mb-4">
                  {event.description}
                </p>
              )}

              {/* Instagram link */}
              {event.instagramPermalink && (
                <a
                  href={event.instagramPermalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold-light hover:text-spanish text-sm font-quattrocento transition-colors"
                >
                  <Instagram className="w-4 h-4" aria-hidden="true" />
                  View on Instagram
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
