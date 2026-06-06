import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Instagram,
  ChevronLeft,
  ChevronRight,
  Anchor,
  TreeDeciduous,
  Sparkles,
} from "lucide-react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { SectionHeading } from "../SectionHeading";
import { AlponaDivider } from "../AlponaDivider";
import type { InstagramPost, PostsData } from "../../types/events";

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

// Snapshot once at module load — same media query the component already
// used; reduced-motion users get no autoplay and no focal tween.
const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Focal tween ranges: centered slide is full size/opaque, neighbors gently
// recede. Gentle spotlight only — no blur (paint-expensive, and it muddied
// the photos).
const TWEEN_SCALE_RANGE = 0.07; // scale 1 -> 0.93 at the adjacent snap
const TWEEN_OPACITY_RANGE = 0.28; // opacity 1 -> 0.72 at the edges

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
      // Snap to center, but let a strong flick carry past several slides
      // and settle forward at the nearest snap (skipSnaps) instead of
      // clamping to one slide and yanking back. Longer duration gives a
      // softer, springier glide.
      dragFree: false,
      skipSnaps: true,
      duration: 30,
    },
    plugins,
  );

  // --- Focal tween (scale / opacity by distance from center) ---
  // Direct DOM style writes on each slide's inner wrapper; no React state,
  // no re-renders. Pattern follows Embla's official TweenScale example,
  // including the loop-point correction for wrapped slides. The tween runs
  // over ALL slides on every tick (no slidesInView gating) so slides being
  // repositioned by the loop never carry a stale style across the seam.
  const tweenNodes = useRef<HTMLElement[]>([]);
  const rafId = useRef(0);

  const setTweenNodes = useCallback((api: EmblaApi) => {
    tweenNodes.current = api
      .slideNodes()
      .map((slideNode) => slideNode.firstElementChild as HTMLElement);
  }, []);

  const tweenFocal = useCallback((api: EmblaApi) => {
    const engine = api.internalEngine();
    const scrollProgress = api.scrollProgress();
    const snapList = api.scrollSnapList();

    snapList.forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
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
        node.style.transform = `scale(${scale.toFixed(4)})`;
        node.style.opacity = (1 - TWEEN_OPACITY_RANGE * distance).toFixed(3);
      });
    });
  }, []);

  useEffect(() => {
    if (!emblaApi || REDUCED_MOTION) return;

    setTweenNodes(emblaApi);
    tweenFocal(emblaApi);

    // rAF-throttled: coalesce events that fire faster than frames.
    const onTween = (api: EmblaApi) => {
      if (rafId.current !== 0) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;
        tweenFocal(api);
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

  // Index of the newest post by timestamp — never assume feed order.
  const mostRecentIndex = useMemo(
    () =>
      posts.reduce(
        (best, post, i) =>
          new Date(post.timestamp).getTime() >
          new Date(posts[best].timestamp).getTime()
            ? i
            : best,
        0,
      ),
    [posts],
  );
  const scrollMostRecent = useCallback(
    () => emblaApi?.scrollTo(mostRecentIndex),
    [emblaApi, mostRecentIndex],
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
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-5 mb-10">
            <SectionHeading
              index="০২"
              label="Instagram"
              title="From Our Instagram"
              accent="Life at VABS, as we post it"
              align="left"
            />
            <div className="shrink-0 mb-1 flex flex-col items-end gap-3">
              {/* Platform links — Anchor Link · Linktree · Instagram */}
              <div className="flex items-center gap-2">
                <a
                  href="https://anchorlink.vanderbilt.edu/organization/vabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VABS on Anchor Link"
                  title="Anchor Link"
                  className="flex items-center justify-center p-2 rounded-full bg-almond/10 hover:bg-spanish/20 hover:scale-110 active:scale-95 transition-all duration-200"
                >
                  <Anchor className="w-6 h-6 text-almond" />
                </a>
                <a
                  href="https://linktr.ee/VandyBengalis"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VABS Linktree"
                  title="Linktree"
                  className="flex items-center justify-center p-2 rounded-full bg-almond/10 hover:bg-spanish/20 hover:scale-110 active:scale-95 transition-all duration-200"
                >
                  <TreeDeciduous className="w-6 h-6 text-almond" />
                </a>
                <a
                  href="https://www.instagram.com/vandy.bengalis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VABS on Instagram"
                  title="Instagram"
                  className="flex items-center justify-center p-2 rounded-full bg-almond/10 hover:bg-spanish/20 hover:scale-110 active:scale-95 transition-all duration-200"
                >
                  <Instagram className="w-6 h-6 text-almond" />
                </a>
              </div>
              <button
                type="button"
                onClick={scrollMostRecent}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gold/30 bg-gold/10 text-gold-light text-sm font-quattrocento font-bold hover:bg-gold/20 transition-colors"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Most recent
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div className="relative">
            <div
              className="overflow-hidden cursor-grab active:cursor-grabbing"
              ref={emblaRef}
            >
              {/* Embla canonical spacing: gutters live ON the slides
                  (pl-6) offset by -ml-6 on the container — a CSS gap here
                  breaks the loop's translation math and makes wrapped
                  slides visibly jump into place at the seam. */}
              <div className="flex -ml-6">
                {posts.map((post) => (
                  /* CRITICAL: no transform/transition classes on the slide
                     element itself — Embla's loop teleports wrapped slides
                     via an inline translate3d, and a CSS transition here
                     animates that teleport (cards visibly "fly in" from the
                     wrong direction at the seam). Hover scale lives on the
                     card inside instead. */
                  <a
                    key={post.id}
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-[0_0_85%] sm:flex-[0_0_46%] lg:flex-[0_0_31%] min-w-0 pl-6 group"
                  >
                    {/* Tween node — the focal effect writes transform /
                        opacity here directly (no re-renders) */}
                    <div className="h-full transform-gpu">
                      <div className="h-full bg-gradient-to-br from-[#992b0d]/10 to-[#e36414]/10 p-4 rounded-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-[1.02]">
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
                              <p className="text-white font-quattrocento text-base md:text-lg leading-relaxed">
                                {post.caption}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Card meta: compact caption strip on touch + date */}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="hidden touch:block flex-1 min-w-0 truncate text-almond/75 text-sm font-quattrocento">
                            {post.caption}
                          </p>
                          <p className="shrink-0 ml-auto text-almond/60 text-sm font-quattrocento">
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
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-spanish/20 to-gold/20 border border-gold/20 text-almond font-quattrocento text-base hover:border-gold/40 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              Follow @vandy.bengalis
            </a>
            {syncedLabel && (
              <p className="mt-3 text-almond/60 text-sm font-quattrocento tracking-wide">
                Synced from Instagram · {syncedLabel}
              </p>
            )}
          </div>

          {/* Decorative */}
          <AlponaDivider className="mx-auto mt-10 opacity-80" />
        </div>
      </div>
    </section>
  );
}
