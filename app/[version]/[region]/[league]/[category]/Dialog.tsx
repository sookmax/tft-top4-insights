"use client";
import * as RadixDialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import React from "react";
import CloseIcon from "./CloseIcon";

export default function Dialog({
  triggerAsChild,
  trigger,
  contentAsChild,
  content,
  open,
  onOpenChange,
}: {
  triggerAsChild?: boolean;
  trigger: React.ReactNode;
  contentAsChild?: boolean;
  content: React.ReactNode;
  open?: RadixDialog.DialogProps["open"];
  onOpenChange?: RadixDialog.DialogProps["onOpenChange"];
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Trigger
        asChild={triggerAsChild}
        className="focus:outline-none focus-visible:outline-none"
      >
        {trigger}
      </RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay asChild>
          <motion.div
            // key="modal"
            className="fixed inset-0 bg-black/90 z-20 flex flex-col justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            //   exit={{ opacity: 0, scale: 0 }}
            // transition={{
            //   type: "tween",
            //   duration: 0.15,
            // }}
          >
            <RadixDialog.Close className="absolute top-0 right-0 p-2 focus:outline-none focus-visible:outline-none">
              <CloseIcon className="w-8 h-8" />
            </RadixDialog.Close>
            <RadixDialog.Content
              asChild={contentAsChild}
              className="focus-visible:outline-none"
            >
              {content}
            </RadixDialog.Content>
          </motion.div>
        </RadixDialog.Overlay>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
