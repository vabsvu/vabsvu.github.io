import React, { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Updated posts with actual image paths
const eventPosts = [
  {
    id: 1,
    imageUrl: "src/components/insta_photos/advocacy_event.png",
    caption: "Learning more about our culture and traditions 📰",
  },
  {
    id: 2,
    imageUrl: "src/components/insta_photos/mshaadi.png",
    caption:
      "Celebrating our vibrant South Asian culture at Mock Shaadi 2024!✨",
  },
  {
    id: 3,
    imageUrl: "src/components/insta_photos/roth_n_roll.png",
    caption: "Sharing amazing Bengali foods for all of Rothschild! 🎉",
  },
];

const OrgShowcase = ({ isVisible = true }) => {
  // Create autoplay plugin instance
  const autoPlayPlugin = Autoplay({
    delay: 4000,
    playOnInit: true,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
    rootNode: (emblaRoot) => emblaRoot.parentElement,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      slidesToScroll: 1, // Important: this ensures one slide movement at a time
      containScroll: "trimSnaps",
      dragFree: true,
    },
    [autoPlayPlugin],
  );

  // Optional: Restart autoplay when window is refocused
  const onVisibilityChange = useCallback(() => {
    if (emblaApi && document.visibilityState === "visible") {
      emblaApi.plugins().autoplay?.reset();
    }
  }, [emblaApi]);

  useEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [onVisibilityChange]);

  return (
    <div
      className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <section className="py-20 px-4 bg-gradient-to-br from-[#460b2f] to-[#9a031e]">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="p-8 backdrop-blur-sm rounded-xl bg-black/10">
            {/* Organization Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-quattrocento font-bold text-[#eae0d5] mb-8">
                Vanderbilt Association of Bengali Students
              </h1>
              <motion.div
                className="text-3xl font-['Tiro_Bangla'] text-[#eae0d5] mb-4"
                whileHover={{ scale: 1.05 }}
              >
                ভালো হৃদয়ের কোনো দোষ নেই
              </motion.div>
              <motion.div
                className="text-xl italic text-[#bf9b30]"
                whileHover={{ scale: 1.05 }}
              >
                "A good heart has no faults."
              </motion.div>
            </div>

            {/* Past Events Section */}
            <div className="mt-16">
              {/* Header */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <h2 className="text-3xl font-quattrocento font-bold text-[#eae0d5]">
                  Our Events
                </h2>
                <motion.a
                  href="https://www.instagram.com/vandy.bengalis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 rounded-full bg-[#eae0d5]/10 hover:bg-[#e36414]/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram className="w-6 h-6 text-[#eae0d5]" />
                </motion.a>
              </div>

              {/* Events Carousel */}
              <div className="relative overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6">
                  {eventPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="h-full bg-gradient-to-br from-[#992b0d]/10 to-[#e36414]/10 p-4 rounded-xl backdrop-blur-sm">
                        <div
                          className="relative rounded-lg overflow-hidden"
                          style={{ aspectRatio: "1080/1350" }}
                        >
                          <img
                            src={post.imageUrl}
                            alt={post.caption}
                            className="w-full h-full object-cover"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <p className="text-white font-quattrocento text-sm md:text-base">
                                {post.caption}
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Decorative Elements */}
              <motion.div
                className="mt-12 flex justify-center items-center gap-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-[#e2d57e] to-transparent"
                  animate={{
                    scaleX: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="w-3 h-3 rounded-full bg-[#e36414]"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-[#e2d57e] to-transparent"
                  animate={{
                    scaleX: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default OrgShowcase;
