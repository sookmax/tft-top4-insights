"use client";
import { classNames } from "@/app/utils";
import Link from "next/link";
import React, { useState } from "react";
import Ring from "./Ring";
import { StatsParams } from "@/lib/data-aggregator";
import { CATEGORIES, Category } from "@/lib/shared-const";

export default function NavBarLinks({ params }: { params: StatsParams }) {
  const basePath = `/${params.version}/${params.region}/${params.league}`;
  const [clickedCategory, setClickedCategory] = useState<Category | null>(null);

  return (
    <div className="flex flex-col space-y-2 text-gray-300">
      {CATEGORIES.map((category) => {
        let label = "";
        switch (category) {
          case Category.units:
            label = "Units".toUpperCase();
            break;
          case Category.traits:
            label = "Traits".toUpperCase();
            break;
          case Category.augments:
            label = "Augments".toUpperCase();
            break;
        }

        const className = classNames(
          "text-center text-2xl font-[500]",
          category === params.category &&
            "underline underline-offset-4 text-teal-200"
        );

        return clickedCategory === null ? (
          <Link
            key={category}
            href={`${basePath}/${category}`}
            className={className}
            onClick={() => {
              setClickedCategory(category);
              // requestTopO();
            }}
          >
            {label}
          </Link>
        ) : (
          <span
            key={category}
            className={classNames(
              className,
              category === clickedCategory && "text-orange-500"
            )}
          >
            <span className="relative">
              <span>{label}</span>
              {category === clickedCategory && (
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2">
                  <Ring
                    className="w-6 h-6 animate-spin"
                    strokeWidth={8}
                    stroke="#374151"
                  />
                </span>
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
}
