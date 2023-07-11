const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function setTheme(theme: "light" | "dark" | "auto") {
  if (theme === "auto" && prefersDark.matches) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }
}

setTheme("auto");

prefersDark.addEventListener("change", () => setTheme("auto"));
