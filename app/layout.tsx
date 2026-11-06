import type { ReactNode } from "react";

export const metadata = {
  title: "NutriGuide Calorie Planner",
  description: "A public calorie, protein, food, exercise, and wellness planner.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
