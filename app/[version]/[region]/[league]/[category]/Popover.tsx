"use client";

import React from "react";
import * as RadixPopover from "@radix-ui/react-popover";
import CloseIcon from "./CloseIcon";
import { motion } from "framer-motion";

export type PopoverProps = {
  trigger: React.ReactNode;
  triggerAsChild?: boolean;
  content: React.ReactNode;
  closeButton?: boolean;
  side?: RadixPopover.PopperContentProps["side"];
  portal?: boolean;
};

export default function Popover({
  trigger,
  triggerAsChild,
  content,
  side,
  portal = true,
  closeButton = true,
}: PopoverProps) {
  return (
    // <AnimatePresence>
    <RadixPopover.Root>
      <RadixPopover.Trigger
        asChild={triggerAsChild}
        className="focus-visible:outline-none"
      >
        {trigger}
      </RadixPopover.Trigger>

      {/* When used, portals the content part into the body. */}
      <ContentWrapper portal={portal}>
        <RadixPopover.Content
          // The distance in pixels from the anchor.
          sideOffset={2}
          side={side}
          asChild
          forceMount
        >
          <motion.div
            className="bg-gray-950 relative z-30 focus-visible:outline-none"
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            //   exit={{
            //     opacity: 0,
            //     scale: 0,
            //   }}
            style={{
              // boxShadow: "-3px -3px 5px #4b5563, 3px 3px 5px #4b5563",
              boxShadow: "0px 0px 5px 2px #111827",
            }}
          >
            {closeButton && (
              <div className="absolute top-0 right-0">
                <RadixPopover.Close
                  aria-label="Close"
                  className="p-1 focus-visible:outline-none"
                >
                  <CloseIcon className="h-4 w-4 text-gray-500" />
                </RadixPopover.Close>
              </div>
            )}
            {content}
            <RadixPopover.Arrow className="fill-gray-950" />
          </motion.div>
        </RadixPopover.Content>
      </ContentWrapper>
    </RadixPopover.Root>
    // </AnimatePresence>
  );
}

function ContentWrapper({
  portal = true,
  children,
}: {
  portal?: boolean;
  children: React.ReactNode;
}) {
  if (portal) {
    return <RadixPopover.Portal>{children}</RadixPopover.Portal>;
  } else {
    return <>{children}</>;
  }
}
