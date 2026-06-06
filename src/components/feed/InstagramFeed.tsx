import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Instagram } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import type { InstagramPost, PostsData } from "../../types/events";

const fallbackPosts: InstagramPost[] = [
  {
    id: "post_advocacy",
    caption: "Learning more about our culture and traditions",
    imageUrl: "/images/insta/advocacy_event.webp",
    timestamp: "2024-11-15T18:00:00Z",
    permalink: "https://www.instagram.com/vandy.bengalis/",
  },
  {
    id: "post_mshaadi",
    caption:
      "Celebrating our vibrant South Asian culture at Mock Shaadi 2024!",
    imageUrl: "/images/insta/mshaadi.webp",
    timestamp: "2025-01-10T22:00:00Z",
    permalink: "https://www.instagram.com/vandy.bengalis/",
  },
  {
    id: "post_roth_n_roll",
    caption: "Sharing amazing Bengali foods for all of Rothschild!",
    imageUrl: "/images/insta/roth_n_roll.webp",
    timestamp: "2025-02-15T20:00:00Z",
    permalink: "https://www.instagram.com/vandy.bengalis/",
  },
];

const formatPostDate = (timestamp: string) => {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatSyncDate = (timestamp: string) => {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function InstagramFeed() {
  const sectionRef = useScrollReveal();
  const [posts, setPosts] = useState<InstagramPost[]>(fallbackPosts);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [prefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    fetch("/data/posts.json")
      .then((r) => r.json())
      .then((data: PostsData) => {
        if (data.posts && data.posts.length > 0) setPosts(data.posts);
        if (data.lastUpdated) setLastUpdated(data.lastUpdated);
      })
      .catch(() => {});
  }, []);

  // Autoplay is skipped entirely for reduced-motion users; the carousel
  // remains fully draggable.
  const plugins = useMemo(
    () =>
      prefersReducedMotion
        ? []
        : [
            Autoplay({
              delay: 4000,
              playOnInit: true,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
              rootNode: (emblaRoot: HTMLElement) => emblaRoot.parentElement!,
            }),
          ],
    [prefersReducedMotion],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      slidesToScroll: 1,
      containScroll: "trimSnaps",
      dragFree: true,
    },
    plugins,
  );

  const onVisibilityChange = useCallback(() => {
    if (emblaApi && document.visibilityState === "visible") {
      emblaApi.plugins().autoplay?.reset();
    }
  }, [emblaApi]);

  useEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [onVisibilityChange]);

  const syncedLabel = lastUpdated ? formatSyncDate(lastUpdated) : "";

  return (
    <section id="feed" className="relative py-16 md:py-20 px-4">
      {/* Section background with soft faded edges */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#460b2f] to-[#9a031e]"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      />
      <div ref={sectionRef} className="relative max-w-6xl mx-auto">
        <div data-reveal className="p-8 backdrop-blur-sm rounded-xl bg-black/10">
          {/* Header */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-quattrocento font-bold tracking-tight text-almond">
              From Our Instagram
            </h2>
            <a
              href="https://www.instagram.com/vandy.bengalis/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="VABS on Instagram"
              className="flex items-center justify-center p-2 rounded-full bg-almond/10 hover:bg-spanish/20 hover:scale-110 active:scale-95 transition-all duration-200"
            >
              <Instagram className="w-6 h-6 text-almond" />
            </a>
          </div>

          {/* Carousel */}
          <div className="relative overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 group hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="h-full bg-gradient-to-br from-[#992b0d]/10 to-[#e36414]/10 p-4 rounded-xl backdrop-blur-sm">
                    <div
                      className="relative rounded-lg overflow-hidden"
                      style={{ aspectRatio: "1080/1350" }}
                    >
                      <img
                        src={post.imageUrl}
                        alt={post.caption}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      {/* Hover caption overlay — pointer devices only */}
                      <div className="touch:hidden absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white font-quattrocento text-sm md:text-base">
                            {post.caption}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card meta: compact caption strip on touch + date */}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="hidden touch:block flex-1 min-w-0 truncate text-almond/70 text-xs font-quattrocento">
                        {post.caption}
                      </p>
                      <p className="shrink-0 ml-auto text-almond/50 text-xs font-quattrocento">
                        {formatPostDate(post.timestamp)}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Follow CTA */}
          <div className="mt-8 text-center">
            <a
              href="https://www.instagram.com/vandy.bengalis/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-spanish/20 to-gold/20 border border-gold/20 text-almond font-quattrocento text-sm hover:border-gold/40 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              Follow @vandy.bengalis
            </a>
            {syncedLabel && (
              <p className="mt-3 text-almond/40 text-xs font-quattrocento tracking-wide">
                Synced from Instagram · {syncedLabel}
              </p>
            )}
          </div>

          {/* Decorative */}
          <div className="mt-10 flex justify-center items-center gap-8">
            <div className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-gold to-transparent motion-safe:animate-pulse-line" />
            <div className="w-3 h-3 rounded-full bg-spanish motion-safe:animate-pulse-scale" />
            <div className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-gold to-transparent motion-safe:animate-pulse-line" />
          </div>
        </div>
      </div>
    </section>
  );
}
