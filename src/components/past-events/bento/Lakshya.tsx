import React from "react";

export const Lakshya = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible md:-translate-y-2 -translate-y-5">
      <div className="w-full max-w-[400px] h-[140px] md:h-[200px] translate-y-1 md:-translate-y-2">
        <img
          src="/images/lakshya.svg"
          alt="Lakshya"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
};
