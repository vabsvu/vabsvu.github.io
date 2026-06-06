import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Instagram, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import type { InstagramPost, PostsData } from "../../types/events";

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

// Snapshot once at module load — same media query the component already
// used; reduced-motion users get no autoplay and no focal tween.
const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Focal tween ranges: centered slide is full size/sharp/opaque, neighbors
// recede. Blur is paint-expensive, so the radius stays small.
const TWEEN_SCALE_RANGE = 0.12; // scale 1 -> 0.88 at the adjacent snap
const TWEEN_BLUR_MAX = 2.5; // px at the adjacent snap and beyond
const TWEEN_OPACITY_RANGE = 0.45; // opacity 1 -> 0.55 at the edges

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

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
      REDUCED_MOTION
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
    [],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      slidesToScroll: 1,
      // dragFree momentum felt jerky and never settled on a post —
      // snap to center instead, with a quick settle.
      dragFree: false,
      duration: 22,
    },
    plugins,
  );

  // --- Focal tween (scale / blur / opacity by distance from center) ---
  // Direct DOM style writes on each slide's inner wrapper; no React state,
  // no re-renders. Pattern follows Embla's official TweenScale example,
  // including the loop-point correction for wrapped slides.
  const tweenNodes = useRef<HTMLElement[]>([]);
  const rafId = useRef(0);

  const setTweenNodes = useCallback((api: EmblaApi) => {
    tweenNodes.current = api
      .slideNodes()
      .map((slideNode) => slideNode.firstElementChild as HTMLElement);
  }, []);

  const tweenFocal = useCallback((api: EmblaApi, eventName?: string) => {
    const engine = api.internalEngine();
    const scrollProgress = api.scrollProgress();
    const snapList = api.scrollSnapList();
    const slidesInView = api.slidesInView();
    const isScrollEvent = eventName === "scroll";

    snapList.forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

        // Loop edge case: a looped slide is rendered at a shifted
        // position, so measure its distance against the wrapped
        // progress instead of the raw snap point.
        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();
            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);
              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress);
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            }
          });
        }

        const node = tweenNodes.current[slideIndex];
        if (!node) return;

        // 0 at the centered snap -> 1 at the adjacent snap (clamped beyond)
        const distance = clamp(Math.abs(diffToTarget) * snapList.length, 0, 1);
        const scale = 1 - TWEEN_SCALE_RANGE * distance;
        const blur = TWEEN_BLUR_MAX * distance;
        node.style.transform = `scale(${scale.toFixed(4)})`;
        node.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
        node.style.opacity = (1 - TWEEN_OPACITY_RANGE * distance).toFixed(3);
      });
    });
  }, []);

  useEffect(() => {
    if (!emblaApi || REDUCED_MOTION) return;

    setTweenNodes(emblaApi);
    tweenFocal(emblaApi);

    // rAF-throttled: coalesce events that fire faster than frames.
    const onTween = (api: EmblaApi, eventName: string) => {
      if (rafId.current !== 0) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;
        tweenFocal(api, eventName);
      });
    };
    const onReInit = (api: EmblaApi) => {
      setTweenNodes(api);
      tweenFocal(api);
    };

    emblaApi
      .on("scroll", onTween)
      .on("select", onTween)
      .on("slideFocus", onTween)
      .on("reInit", onReInit);

    return () => {
      if (rafId.current !== 0) cancelAnimationFrame(rafId.current);
      rafId.current = 0;
      emblaApi
        .off("scroll", onTween)
        .off("select", onTween)
        .off("slideFocus", onTween)
        .off("reInit", onReInit);
    };
  }, [emblaApi, setTweenNodes, tweenFocal]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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
          <div className="relative">
            <div
              className="overflow-hidden cursor-grab active:cursor-grabbing"
              ref={emblaRef}
            >
              <div className="flex gap-6">
                {posts.map((post) => (
                  <a
                    key={post.id}
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-[0_0_85%] sm:flex-[0_0_46%] lg:flex-[0_0_31%] min-w-0 group hover:scale-[1.02] transition-transform duration-300"
                  >
                    {/* Tween node — the focal effect writes transform /
                        filter / opacity here directly (no re-renders) */}
                    <div className="h-full transform-gpu will-change-transform">
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
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Prev / next — pointer-friendly screens only */}
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous post"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-black/20 text-gold-light backdrop-blur-sm hover:bg-black/40 hover:text-almond transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next post"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-black/20 text-gold-light backdrop-blur-sm hover:bg-black/40 hover:text-almond transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
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
