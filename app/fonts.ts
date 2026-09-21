import { Outfit, Plus_Jakarta_Sans } from "next/font/google";

export const headlineFont = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-headline",
});

export const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});
