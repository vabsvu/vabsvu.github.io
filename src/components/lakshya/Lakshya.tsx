import React from "react";
import { LakshyaSVG } from "./LakshyaSVG";

export const Lakshya = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible md:-translate-y-2 -translate-y-5">
      <div className="w-full max-w-[400px] h-[140px] md:h-[200px] translate-y-1 md:-translate-y-2">
        <LakshyaSVG />
      </div>
    </div>
  );
};
