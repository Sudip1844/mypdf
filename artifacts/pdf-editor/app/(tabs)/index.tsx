import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FabActionSheet } from "@/components/FabActionSheet";
import { useColors } from "@/hooks/useColors";

const QUICK_TOOLS = [
  { id: "image-to-pdf", icon: "file-image-outline" as const,          label: "Image to PDF", bg: "#E53935" },
  { id: "smart-scan",   icon: "line-scan" as const,                   label: "Smart Scan",   bg: "#1565C0" },
  { id: "pdf-reader",   icon: "folder-open-outline" as const,         label: "Import PDF",   bg: "#E65100" },
  { id: "compress",     icon: "archive-arrow-down-outline" as const,  label: "Compress",     bg: "#B71C1C" },
  { id: "pdf-to-jpg",   icon: "file-jpg-box" as const,               label: "PDF to JPG",   bg: "#C62828" },
  { id: "merge-pdf",    icon: "call-merge" as const,                  label: "Merge PDF",    bg: "#E65100" },
  { id: "add-text",     icon: "format-text" as const,                 label: "Add Text",     bg: "#0D47A1" },
  { id: "more",         icon: "apps" as const,                        label: "More",         bg: "#4527A0" },
];

const SCAN_TYPES = [
  { icon: "image-outline" as const,                label: "Image",       route: "image-to-pdf", color: "#1565C0" },
  { icon: "text-box-outline" as const,             label: "Note",        route: "add-text",     color: "#00796B" },
  { icon: "receipt" as const,                      label: "Receipt",     route: "image-to-pdf", color: "#E65100" },
  { icon: "table" as const,                        label: "Form",        route: "image-to-pdf", color: "#6A1B9A" },
  { icon: "card-account-details-outline" as const, label: "ID Card",     route: "image-to-pdf", color: "#00796B" },
  { icon: "certificate" as const,                  label: "Certificate", route: "image-to-pdf", color: "#E65100" },
];

export default function HomeScreen() {
  const colors = useColors();
  const [fabVisible, setFabVisible] = useState(false);

  const handleTool = (id: string) => {
    if (id === "more") { router.push("/tools"); return; }
    if (id === "smart-scan" || id === "pdf-to-jpg") { setFabVisible(true); return; }
    router.push(`/tool/${id}` as any);
  };

  return (
    <>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick tool grid — 4 columns, large square icon cards */}
        <View style={styles.grid}>
          {QUICK_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolCard, { backgroundColor: colors.card }]}
              onPress={() => handleTool(tool.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.toolIconBg, { backgroundColor: tool.bg + "22" }]}>
                <MaterialCommunityIcons name={tool.icon} size={36} color={tool.bg} />
              </View>
              <Text style={[styles.toolLabel, { color: colors.foreground }]}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Scan type picker */}
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
                onPress={() => router.push(`/tool/${item.route}` as any)}
              >
                <View style={[styles.scanIconWrap, { backgroundColor: item.color + "22" }]}>
                  <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
                </View>
                <Text style={[styles.scanLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <FabActionSheet visible={fabVisible} onClose={() => setFabVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 110, gap: 14 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  toolCard: {
    width: "22%",
    flexGrow: 1,
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 10,
  },
  toolIconBg: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  toolLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },

  scanCard: { borderRadius: 20, padding: 18, alignItems: "center", gap: 18 },
  scanTitle: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  scanGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, justifyContent: "center", width: "100%" },
  scanItem: { alignItems: "center", gap: 8, width: "28%" },
  scanIconWrap: { width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  scanLabel: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
