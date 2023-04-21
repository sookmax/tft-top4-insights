"use client";

import { StatsParams } from "@/lib/data-aggregator";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

let top0Requested = false;
export function requestTopO() {
  document.documentElement.scrollTop = -100;
  top0Requested = true;
}

export default function ScrollYObserver({ debug }: { debug?: boolean }) {
  const params = useParams() as StatsParams;
  const [renderTrigger, setRenderTrigger] = useState(false);
  const windowScrollYRef = useRef(-999);
  const documentScrollTopRef = useRef(-999);

  useEffect(() => {
    if (params.category === "augments") {
      let requestId: number | undefined;
      let timeoutId: NodeJS.Timeout | undefined;

      const rAFCallback = () => {
        if (top0Requested) {
          //   window.scrollTo({ top: 0 });
          document.documentElement.scrollTop = -100;
          requestId = requestAnimationFrame(rAFCallback);

          if (window.scrollY <= 0 && document.documentElement.scrollTop <= 0) {
            top0Requested = false;
          }
        }

        if (debug) {
          setRenderTrigger((v) => !v);
          windowScrollYRef.current = window.scrollY;
          documentScrollTopRef.current = document.documentElement.scrollTop;
        }
      };

      timeoutId = setTimeout(() => {
        requestId = requestAnimationFrame(rAFCallback);
      }, 50);

      return () => {
        timeoutId && clearTimeout(timeoutId);
        requestId && cancelAnimationFrame(requestId);
      };
    }
  }, [params, debug]);

  return debug ? (
    <div className="fixed bottom-0 bg-red-500">
      <div>window.scrollY: {windowScrollYRef.current}</div>
      <div>
        document.documentElement.scrollTop: {documentScrollTopRef.current}
      </div>
    </div>
  ) : null;
}
