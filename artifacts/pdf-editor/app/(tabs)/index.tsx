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
  { id: "image-to-pdf", icon: "file-image-outline" as const, label: "Image to PDF", bg: "#E53935" },
  { id: "smart-scan",   icon: "scan-helper" as const,        label: "Smart Scan",   bg: "#1565C0" },
  { id: "pdf-reader",   icon: "folder-outline" as const,      label: "Import PDF",   bg: "#F57C00" },
  { id: "compress",     icon: "archive-arrow-down-outline" as const, label: "Compress", bg: "#C62828" },
  { id: "pdf-to-jpg",   icon: "file-jpg-box" as const,        label: "PDF to JPG",   bg: "#E53935" },
  { id: "merge-pdf",    icon: "call-merge" as const,           label: "Merge PDF",    bg: "#F57C00" },
  { id: "add-text",     icon: "file-word-outline" as const,   label: "Add Text",     bg: "#1565C0" },
  { id: "more",         icon: "dots-grid" as const,            label: "More",         bg: "#5B5FEF" },
];

const SCAN_TYPES = [
  { icon: "image-outline" as const,                label: "Image",       route: "image-to-pdf" },
  { icon: "text-box-outline" as const,             label: "Note",        route: "add-text"     },
  { icon: "receipt" as const,                      label: "Receipt",     route: "image-to-pdf" },
  { icon: "table" as const,                        label: "Form",        route: "image-to-pdf" },
  { icon: "card-account-details-outline" as const, label: "ID Card",     route: "image-to-pdf" },
  { icon: "certificate-outline" as const,          label: "Certificate", route: "image-to-pdf" },
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
        {/* Quick tool grid */}
        <View style={styles.grid}>
          {QUICK_TOOLS.map((tool) => (
            <View key={tool.id} style={styles.gridCell}>
              <TouchableOpacity
                style={[styles.toolBtn, { backgroundColor: colors.card }]}
                onPress={() => handleTool(tool.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.toolIconWrap, { backgroundColor: tool.bg }]}>
                  <MaterialCommunityIcons name={tool.icon} size={28} color="#fff" />
                </View>
                <Text style={[styles.toolLabel, { color: colors.foreground }]}>{tool.label}</Text>
              </TouchableOpacity>
            </View>
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
                <View style={[styles.scanIconWrap, { backgroundColor: colors.secondary }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={colors.mutedForeground} />
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
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridCell: { width: "22%", flexGrow: 1 },
  toolBtn: { borderRadius: 16, alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 6, gap: 8 },
  toolIconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  toolLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  scanCard: { borderRadius: 20, padding: 20, alignItems: "center", gap: 20 },
  scanTitle: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  scanGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "center", width: "100%" },
  scanItem: { alignItems: "center", gap: 6, width: "28%" },
  scanIconWrap: { width: 60, height: 60, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  scanLabel: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
