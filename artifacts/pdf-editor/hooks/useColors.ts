import colors from "@/constants/colors";

/**
 * Always returns the dark palette — this app is dark-mode by design.
 */
export function useColors() {
  return { ...colors.dark, radius: colors.radius };
}
