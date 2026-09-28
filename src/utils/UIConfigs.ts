import { TextStyle } from "react-native";
import { LayoutConfig } from "../types/section";

export const getTitleStyle = (
  layoutConfig?: LayoutConfig
): TextStyle => {
  const title = layoutConfig?.title;
  const hasBackground = !!title?.backgroundColor;

  return {
    fontSize: title?.fontSize ?? 18,
    fontWeight: title?.fontWeight ?? "700",
    color: title?.color ?? "#121212",
    textAlign: title?.align ?? "left",
    marginBottom: title?.marginBottom ?? 12,
    marginHorizontal: title?.marginHorizontal ?? 16,
    textTransform: title?.textTransform ?? "none",

    // ✅ Advanced (safe defaults)
    // Apply only if provided
    ...(title?.backgroundColor && {
      backgroundColor: title.backgroundColor,
    }),

    // Padding only if background exists (important UX rule)
    ...(hasBackground && {
      padding: title?.padding ?? 8,
    }),

    // Border radius only if background exists
    ...(hasBackground && {
      borderRadius: title?.borderRadius ?? 6,
    }),

    // Letter spacing with safe default
    ...(title?.letterSpacing !== undefined && {
      letterSpacing: title.letterSpacing ?? 0.5,
    }),
  };
};