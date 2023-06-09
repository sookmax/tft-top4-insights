import { rajdhani } from "./fonts";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { classNames } from "./utils";
import { TITLE, DESCRIPTION } from "./const";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: TITLE,
  },
  keywords: ["TFT", "Teamfight Tactics", "top4", "stats"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={classNames(
        "bg-gray-950 text-white",
        // robotoCondensed.className
        // darkerGrotesque.className
        // goldman.className
        // sulphurPoint.className
        // raleway.className
        // oswald.className
        rajdhani.className
      )}
    >
      <body className="overflow-x-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
