"use client";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";

export default function ListVirtualizer({
  items,
  itemHeight,
  dynamic,
}: {
  items: any[];
  itemHeight: number;
  dynamic?: boolean;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => itemHeight,
    scrollMargin,
    // paddingEnd: 12,
  });

  const vItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (vItems.length > 0 && parentRef.current) {
      setScrollMargin(parentRef.current.offsetTop);
    }
  }, [vItems.length]);

  return (
    <div ref={parentRef} data-id="list-virtualizer-root">
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: "relative",
        }}
      >
        <div
          style={{
            // these styles are absolutely necessary. They are from the example.
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%", // without this, infinite re-render occurs
            transform: `translateY(${
              vItems[0].start - virtualizer.options.scrollMargin
            }px)`,
          }}
        >
          {vItems.map((vItem) => {
            return (
              <div
                key={vItem.key}
                data-index={vItem.index}
                ref={dynamic ? virtualizer.measureElement : null}
              >
                {items[vItem.index]}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
