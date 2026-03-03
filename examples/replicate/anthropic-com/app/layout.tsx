import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anthropic — AI research and products that put safety at the frontier",
  description:
    "Anthropic homepage featuring navigation, hero, featured article, latest releases, mission links, and footer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("ds-theme")||"light";if(t==="system")t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()' ,
          }}
        />
        {children}
      </body>
    </html>
  );
}
