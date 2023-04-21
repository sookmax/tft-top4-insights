"use client";
import { motion } from "framer-motion";

export default function VerticalPercentageBar({
  percentage,
}: {
  percentage: number;
}) {
  return (
    <div className="w-[2px] bg-black relative flex-shrink-0">
      <motion.div
        className="w-full bg-teal-200 absolute bottom-0"
        layout
        initial={{
          height: 0,
        }}
        animate={{
          height: `${percentage}%`,
        }}
        transition={{
          delay: 0.5,
        }}
        // style={{
        //   height: `${percentage}%`,
        // }}
      />
    </div>
  );
}
