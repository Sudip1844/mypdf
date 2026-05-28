import { useTheme } from "@/context/ThemeContext";
import colors from "@/constants/colors";

/**
 * Returns the palette that matches the user's chosen theme (light/dark/system).
 * Reads from ThemeContext so in-app toggling works without restarting.
 */
export function useColors() {
  const { resolvedTheme } = useTheme();
  const palette = resolvedTheme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
