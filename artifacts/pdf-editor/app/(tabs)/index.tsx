import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FileItem } from "@/components/FileItem";
import { SortBySheet, type SortConfig } from "@/components/SortBySheet";
import { useFiles } from "@/context/FilesContext";
import { useColors } from "@/hooks/useColors";

const QUICK_TOOLS = [
  { id: "image-to-pdf", icon: "file-image-outline" as const,         label: "Image to PDF", bg: "#E53935" },
  { id: "smart-scan",   icon: "line-scan" as const,                  label: "Smart Scan",   bg: "#1565C0" },
  { id: "pdf-reader",   icon: "folder-open-outline" as const,        label: "Import PDF",   bg: "#E65100" },
  { id: "compress",     icon: "archive-arrow-down-outline" as const, label: "Compress",     bg: "#B71C1C" },
  { id: "pdf-to-jpg",   icon: "file-jpg-box" as const,              label: "PDF to JPG",   bg: "#C62828" },
  { id: "merge-pdf",    icon: "call-merge" as const,                 label: "Merge PDF",    bg: "#E65100" },
  { id: "add-text",     icon: "format-text" as const,               label: "Add Text",     bg: "#0D47A1" },
  { id: "more",         icon: "apps" as const,                       label: "More",         bg: "#4527A0" },
];

export default function HomeScreen() {
  const colors = useColors();
  const { files } = useFiles();
  const [sortVisible, setSortVisible] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "created", order: "desc" });

  const sortedFiles = useMemo(() => {
    const sorted = [...files];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortConfig.field === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortConfig.field === "size") {
        const toBytes = (s: string) => parseFloat(s) * (s.includes("MB") ? 1e6 : 1e3);
        cmp = toBytes(a.size) - toBytes(b.size);
      } else {
        cmp = a.date.localeCompare(b.date);
      }
      return sortConfig.order === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [files, sortConfig]);

  const handleTool = (id: string) => {
    if (id === "more") { router.push("/tools"); return; }
    router.push(`/tool/${id}` as any);
  };

  return (
    <>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Quick tool grid — 4 columns, circular icons ── */}
        <View style={styles.grid}>
          {QUICK_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCell}
              onPress={() => handleTool(tool.id)}
              activeOpacity={0.75}
            >
              {/* Perfect circle icon */}
              <View style={[styles.toolCircle, { backgroundColor: tool.bg + "1a" }]}>
                <MaterialCommunityIcons name={tool.icon} size={32} color={tool.bg} />
              </View>
              <Text style={[styles.toolLabel, { color: colors.foreground }]} numberOfLines={2}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Files section ── */}
        <View style={styles.filesSection}>
          {/* Header row: "All (N)" + Select All + Sort */}
          <View style={styles.filesHeader}>
            <Text style={[styles.filesTitle, { color: colors.foreground }]}>
              All{" "}
              <Text style={[styles.filesCount, { color: colors.mutedForeground }]}>
                ({files.length})
              </Text>
            </Text>
            <View style={styles.filesActions}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/select", params: { source: "home" } })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name="checkbox-multiple-outline"
                  size={22}
                  color={colors.foreground}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSortVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name="sort"
                  size={22}
                  color={colors.foreground}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* File list */}
          {sortedFiles.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="file-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No files yet — create your first PDF!
              </Text>
            </View>
          ) : (
            <FlatList
              data={sortedFiles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <FileItem file={item} />}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 2 }}
            />
          )}
        </View>
      </ScrollView>

      <SortBySheet
        visible={sortVisible}
        config={sortConfig}
        onClose={() => setSortVisible(false)}
        onApply={setSortConfig}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 20 },

  // Tool grid — 4 equal columns
  grid: { flexDirection: "row", flexWrap: "wrap" },
  toolCell: {
    width: "25%",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 8,
  },
  toolCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,       // perfect circle
    alignItems: "center",
    justifyContent: "center",
  },
  toolLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 15,
  },

  // Files section
  filesSection: { gap: 12 },
  filesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filesTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  filesCount: { fontSize: 16, fontFamily: "Inter_400Regular" },
  filesActions: { flexDirection: "row", alignItems: "center", gap: 16 },

  emptyBox: { alignItems: "center", gap: 10, paddingVertical: 32 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
