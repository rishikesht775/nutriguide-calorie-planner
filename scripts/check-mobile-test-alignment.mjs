import { execFileSync } from "node:child_process";

const base = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "HEAD^";
let changed = [];
try {
  changed = execFileSync("git", ["diff", "--name-only", base, "HEAD"], { encoding: "utf8" })
    .trim().split(/\r?\n/).filter(Boolean);
} catch {
  changed = [];
}
const androidSourceChanged = changed.some((path) =>
  path.startsWith("android/") &&
  !path.includes("/build/") &&
  !path.endsWith(".md")
);
const mobileTestsChanged = changed.some((path) =>
  path.startsWith("android/app/src/androidTest/") ||
  path.startsWith("android/app/src/test/")
);
const mobileDocChanged = changed.includes("docs/MOBILE-TESTING.md") ||
  changed.includes("tests/mobile/MOBILE-TEST-MATRIX.md");

if (androidSourceChanged && (!mobileTestsChanged || !mobileDocChanged)) {
  console.error("Mobile test alignment failed.");
  console.error("Android behavior changes must update android tests and the mobile test documentation in the same change.");
  console.error(changed.join("\n"));
  process.exit(1);
}
console.log("Mobile test alignment passed.");
