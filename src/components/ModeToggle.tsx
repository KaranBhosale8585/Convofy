"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { SunIcon, MoonIcon } from "lucide-react";

export default function ModeSwitch() {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  const handleChange = (checked: boolean) => {
    setIsDark(checked);
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center space-x-3">
      <SunIcon
        className={`h-5 w-5 transition-colors duration-300 ${
          isDark ? "text-muted" : "text-yellow-500"
        }`}
      />
      <Switch id="theme-mode" checked={isDark} onCheckedChange={handleChange} />
      <MoonIcon
        className={`h-5 w-5 transition-colors duration-300 ${
          isDark ? "text-blue-400" : "text-muted"
        }`}
      />
    </div>
  );
}
