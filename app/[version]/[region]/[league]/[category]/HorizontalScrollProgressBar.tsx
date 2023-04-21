"use client";
import { classNames } from "@/app/utils";
import { useEffect, useState } from "react";
import { FOOTER_HEIGHT } from "./Footer";
import throttle from "lodash/throttle";
import debounce from "lodash/debounce";
import { motion, useScroll, useSpring } from "framer-motion";

const TIERS = [
  {
    name: "S",
    color: "#ff7f7f",
  },
  {
    name: "A",
    color: "#ffbf7f",
  },
  {
    name: "B",
    color: "#ffdf7f",
  },
  {
    name: "C",
    color: "#ffff7f",
  },
  {
    name: "D",
    color: "#bfff7f",
  },
  {
    name: "F",
    color: "#7fff7f",
  },
];

export default function HorizontalScrollProgressBar({
  className,
}: {
  className?: string;
}) {
  // const { scrollYProgress } = useScroll();
  // const progress = useSpring(scrollYProgress, {
  //   stiffness: 100,
  //   damping: 30,
  //   restDelta: 0.001,
  // });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameRequested = false;

    const scrollListener = debounce(() => {
      if (!frameRequested) {
        frameRequested = true;
        requestAnimationFrame(() => {
          const progress = Math.min(
            100,
            (document.documentElement.scrollTop /
              (document.documentElement.scrollHeight -
                document.documentElement.clientHeight -
                FOOTER_HEIGHT)) *
              100
          );

          setProgress(progress);

          frameRequested = false;
        });
      }
    }, 100);

    document.addEventListener("scroll", scrollListener);

    return () => document.removeEventListener("scroll", scrollListener);
  }, []);

  return (
    <div className={classNames(className, "w-full h-1 flex relative")}>
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className="flex-1 flex justify-center items-center"
          style={{ backgroundColor: tier.color }}
        />
      ))}
      <motion.div
        layout
        className="h-2 w-[2px] bg-gray-100 absolute top-0 -translate-x-1/2"
        style={{
          left: `${progress}%`,
        }}
      />
      {/* <div className="h-full absolute inset-0 flex">
        <motion.div
          className="w-full"
          style={{
            scaleX: progress,
            transformOrigin: "0%",
          }}
        />
        <div className="h-2 w-[2px]" />
      </div> */}
    </div>
  );
}
