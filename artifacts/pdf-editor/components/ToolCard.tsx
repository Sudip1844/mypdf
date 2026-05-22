import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface ToolCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  iconColor?: string;
  iconBg?: string;
  size?: "small" | "large";
  onPress?: () => void;
}

export function ToolCard({
  icon,
  label,
  iconColor = "#FFFFFF",
  iconBg,
  size = "large",
  onPress,
}: ToolCardProps) {
  const colors = useColors();
  const bg = iconBg ?? colors.card;

  if (size === "small") {
    return (
      <TouchableOpacity
        style={[styles.smallCard, { backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={[styles.smallIconWrap, { backgroundColor: bg }]}>
          <MaterialCommunityIcons name={icon} size={26} color={iconColor} />
        </View>
        <Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.largeCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.largeIconWrap, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
      </View>
      <Text
        style={[styles.largeLabel, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  largeCard: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    gap: 10,
    flex: 1,
    minHeight: 110,
  },
  largeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  largeLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  smallCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    flex: 1,
  },
  smallIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  smallLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
