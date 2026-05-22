import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const QUICK_TOOLS = [
  {
    id: "img-to-pdf",
    icon: "file-image-outline" as const,
    label: "Image to PDF",
    iconColor: "#fff",
    bg: "#E53935",
  },
  {
    id: "smart-scan",
    icon: "scan-helper" as const,
    label: "Smart Scan",
    iconColor: "#fff",
    bg: "#1565C0",
  },
  {
    id: "import-pdf",
    icon: "folder-outline" as const,
    label: "Import PDF",
    iconColor: "#fff",
    bg: "#F57C00",
  },
  {
    id: "compress",
    icon: "archive-arrow-down-outline" as const,
    label: "Compress",
    iconColor: "#fff",
    bg: "#E53935",
  },
  {
    id: "pdf-to-jpg",
    icon: "file-jpg-box" as const,
    label: "PDF to JPG",
    iconColor: "#fff",
    bg: "#E53935",
  },
  {
    id: "merge-pdf",
    icon: "call-merge" as const,
    label: "Merge PDF",
    iconColor: "#fff",
    bg: "#F57C00",
  },
  {
    id: "docx-to-pdf",
    icon: "file-word-outline" as const,
    label: "Docx to PDF",
    iconColor: "#fff",
    bg: "#1565C0",
  },
  {
    id: "more",
    icon: "dots-grid" as const,
    label: "More",
    iconColor: "#fff",
    bg: "#5B5FEF",
  },
];

const SCAN_TYPES = [
  { icon: "image-outline" as const, label: "Image" },
  { icon: "text-box-outline" as const, label: "Note" },
  { icon: "receipt" as const, label: "Receipt" },
  { icon: "table" as const, label: "Form" },
  { icon: "card-account-details-outline" as const, label: "ID Card" },
  { icon: "certificate-outline" as const, label: "Certificate" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const handleToolPress = (id: string) => {
    if (id === "more") {
      router.push("/tools");
    }
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: isWeb ? insets.top + 60 : 8,
          paddingBottom: isWeb ? 120 : 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {QUICK_TOOLS.map((tool, i) => (
          <View key={tool.id} style={styles.gridCell}>
            <TouchableOpacity
              style={[styles.toolBtn, { backgroundColor: colors.card }]}
              onPress={() => handleToolPress(tool.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: tool.bg }]}>
                <MaterialCommunityIcons
                  name={tool.icon}
                  size={28}
                  color={tool.iconColor}
                />
              </View>
              <Text style={[styles.toolLabel, { color: colors.foreground }]}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={[styles.scanCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.scanTitle, { color: colors.mutedForeground }]}>
          Import images or scan with your camera{"\n"}to generate PDFs
        </Text>
        <View style={styles.scanGrid}>
          {SCAN_TYPES.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.scanItem}
              activeOpacity={0.7}
            >
              <View style={[styles.scanIconWrap, { backgroundColor: colors.secondary }]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={28}
                  color={colors.mutedForeground}
                />
              </View>
              <Text style={[styles.scanLabel, { color: colors.mutedForeground }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridCell: {
    width: "22%",
    flexGrow: 1,
  },
  toolBtn: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 8,
  },
  toolIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  toolLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  scanCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 20,
  },
  scanTitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  scanGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    width: "100%",
  },
  scanItem: {
    alignItems: "center",
    gap: 6,
    width: "28%",
  },
  scanIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scanLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
