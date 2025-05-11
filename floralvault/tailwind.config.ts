import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        invert: {
          css: {
            color: "#fff",
            a: { color: "#81a308" },
            strong: { color: "#fff" },
            "ul > li::marker": { color: "#81a308" },
            "--tw-prose-body": theme("colors.gray.300"),
            "--tw-prose-headings": theme("colors.white"),
            "--tw-prose-bullets": theme("colors.primary"),
            "--tw-prose-links": theme("colors.primary"),
          },
        },
      }),
    },
  },

  plugins: [typography],
};

export default withUt(config);
