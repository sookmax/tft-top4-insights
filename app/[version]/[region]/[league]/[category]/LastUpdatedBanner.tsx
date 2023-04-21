"use client";

import { useEffect, useState } from "react";
import { format } from "timeago.js";
import CloseIcon from "./CloseIcon";
import CampaignIcon from "./CampaignIcon";

const LAST_UPDATED_TS_KEY = "tft-top4-insights-last-updated-ts";
const LAST_UPDATED_SHOW_PREFERENCE =
  "tft-top4-insights-last-updated-show-preference";

export default function LastUpdatedBanner({
  lastUpdatedTS,
}: {
  lastUpdatedTS: number;
}) {
  const [show, setShow] = useState(false);
  const [timeago, setTimeago] = useState(format(lastUpdatedTS));

  useEffect(() => {
    if (show) {
      const intervalId = setInterval(() => {
        setTimeago(format(lastUpdatedTS));
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [lastUpdatedTS, show]);

  useEffect(() => {
    const tsString = window.localStorage.getItem(LAST_UPDATED_TS_KEY);
    if (tsString) {
      const ts = parseInt(tsString);
      if (lastUpdatedTS > ts) {
        window.localStorage.setItem(
          LAST_UPDATED_TS_KEY,
          lastUpdatedTS.toString()
        );
        window.localStorage.setItem(LAST_UPDATED_SHOW_PREFERENCE, String(true));
        setShow(true);
      } else {
        const showPreference = window.localStorage.getItem(
          LAST_UPDATED_SHOW_PREFERENCE
        );
        if (showPreference === null || showPreference === String(true)) {
          setShow(true);
        }
      }
    } else {
      window.localStorage.setItem(
        LAST_UPDATED_TS_KEY,
        lastUpdatedTS.toString()
      );
      setShow(true);
    }
  }, [lastUpdatedTS]);

  return show ? (
    <div className="flex justify-between items-center p-1 bg-fuchsia-500/40">
      <div className="flex items-center space-x-2">
        <div>
          <CampaignIcon className="w-7 h-7" />
        </div>
        <p className="space-x-1 text-sm">
          <span>Last Updated:</span>
          <span>{timeago}</span>
        </p>
      </div>
      <button
        onClick={() => {
          window.localStorage.setItem(
            LAST_UPDATED_TS_KEY,
            lastUpdatedTS.toString()
          );
          window.localStorage.setItem(
            LAST_UPDATED_SHOW_PREFERENCE,
            String(false)
          );
          setShow(false);
        }}
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  ) : null;
}
