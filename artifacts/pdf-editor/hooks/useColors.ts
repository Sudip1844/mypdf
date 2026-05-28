import { useColorScheme } from "react-native";

import colors from "@/constants/colors";

/**
 * Returns the palette that matches the device color scheme.
 * Follows the system dark/light mode setting automatically.
 */
export function useColors() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
