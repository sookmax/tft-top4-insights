"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScrollListener, { ScrollListenerCallback } from "./ScrollListener";
import Ring from "./Ring";
import { classNames } from "@/app/utils";
import ChevronUpIcon from "./ChevronUpIcon";

const ON_CLICK = () => {
  // const top =
  //   window.scrollY - window.innerHeight < 200
  //     ? 0
  //     : window.scrollY - window.innerHeight * 1.2;

  const top = Math.max(0, window.scrollY - window.innerHeight * 1.2);

  window.scrollTo({
    top,
    behavior: "smooth",
  });
};

export default function BackToTopButton() {
  const [showButton, setShowButton] = useState(false);
  const [ringProgress, setRingProgress] = useState(0);

  useEffect(() => {
    let scrollYAtDirectionChange: number | undefined;

    const callback: ScrollListenerCallback = ({
      overscrolledAtBottom,
      scrollDirection,
      prevScrollDirection,
      scrollProgress,
    }) => {
      if (scrollProgress === undefined) return;
      if (!overscrolledAtBottom) {
        if (
          (scrollDirection === "down" && prevScrollDirection === "up") ||
          (scrollDirection === "up" && prevScrollDirection === "down")
        ) {
          scrollYAtDirectionChange = window.scrollY;
        }

        const scrollDiff = scrollYAtDirectionChange
          ? Math.abs(window.scrollY - scrollYAtDirectionChange)
          : 0;

        if (scrollDiff > 100) {
          if (scrollDirection === "down") {
            setShowButton(false);
          } else if (scrollDirection === "up") {
            setShowButton(true);
          }
        }

        if (scrollDirection === "up" && scrollProgress < 0.01) {
          setShowButton(false);
        }
      }
      setRingProgress(scrollProgress);
    };

    const scrollListener = new ScrollListener();
    scrollListener.add(callback);

    return () => {
      scrollListener.remove(callback);
    };
  }, []);

  return (
    <AnimatePresence>
      {showButton && (
        <motion.button
          key="motion-button"
          className={classNames(
            "w-12 h-12 fixed bottom-5 rounded-full right-5",
            "bg-gray-900/70 text-gray-300",
            "backdrop-blur-sm",
            "z-10",
            "flex justify-center items-center"
          )}
          onClick={ON_CLICK}
          initial={{
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            scale: 0,
            opacity: 0,
          }}
        >
          <Ring
            className={classNames(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[58px] h-[58px]",
              "text-teal-200"
            )}
            stroke="#4b5563"
            strokeWidth={2}
            progress={ringProgress}
          />
          <ChevronUpIcon className="w-7 h-7" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
