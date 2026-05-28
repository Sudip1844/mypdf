import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FileItem } from "@/components/FileItem";
import { SortBySheet, type SortConfig } from "@/components/SortBySheet";
import { useFiles, type PdfFile } from "@/context/FilesContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

type Tab = "all" | "recent" | "favorites";
type FileTypeFilter = "all" | "pdf" | "word" | "excel";

// Small dropdown that appears near the filter icon
function FilterPopup({
  visible,
  onClose,
  filter,
  onSelect,
  counts,
}: {
  visible: boolean;
  onClose: () => void;
  filter: FileTypeFilter;
  onSelect: (f: FileTypeFilter) => void;
  counts: Record<FileTypeFilter, number>;
}) {
  const colors = useColors();

  const OPTIONS: { key: FileTypeFilter; label: string }[] = [
    { key: "all",   label: `All (${counts.all})` },
    { key: "pdf",   label: `PDF (${counts.pdf})` },
    { key: "word",  label: `Word (${counts.word})` },
    { key: "excel", label: `Excel (${counts.excel})` },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.filterBackdrop} onPress={onClose} />
      {/* Popup positioned top-right below the header */}
      <View style={[styles.filterPopup, { backgroundColor: colors.card, shadowColor: "#000" }]}>
        <Text style={[styles.filterTitle, { color: colors.foreground }]}>Filter</Text>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.filterRow,
              { borderBottomColor: colors.border },
            ]}
            onPress={() => { onSelect(opt.key); onClose(); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterLabel, { color: colors.foreground }]}>{opt.label}</Text>
            <View
              style={[
                styles.filterRadio,
                {
                  borderColor: filter === opt.key ? colors.primary : colors.border,
                  backgroundColor: filter === opt.key ? colors.primary : "transparent",
                },
              ]}
            >
              {filter === opt.key && <View style={styles.filterDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

export default function FilesScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const { files, recentFiles, favoriteFiles } = useFiles();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [filterType, setFilterType] = useState<FileTypeFilter>("all");
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "created", order: "desc" });

  const baseFiles = useMemo((): PdfFile[] => {
    if (activeTab === "recent") return recentFiles;
    if (activeTab === "favorites") return favoriteFiles;
    return files;
  }, [activeTab, files, recentFiles, favoriteFiles]);

  // Type filter — all app files are PDF; Word/Excel kept for UI completeness
  const typedFiles = useMemo((): PdfFile[] => {
    if (filterType === "word" || filterType === "excel") return [];
    return baseFiles; // all are PDFs
  }, [baseFiles, filterType]);

  const sortedFiles = useMemo(() => {
    const arr = [...typedFiles];
    arr.sort((a, b) => {
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
    return arr;
  }, [typedFiles, sortConfig]);

  const filterCounts: Record<FileTypeFilter, number> = {
    all:   baseFiles.length,
    pdf:   baseFiles.length,
    word:  0,
    excel: 0,
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "all",       label: t.allFiles },
    { key: "recent",    label: t.recent },
    { key: "favorites", label: t.favorites },
  ];

  const isFilterActive = filterType !== "all";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab pills row + Filter icon */}
      <View style={styles.tabsRow}>
        <View style={styles.tabPills}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                { backgroundColor: activeTab === tab.key ? colors.primary : colors.card },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? "#fff" : colors.mutedForeground },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter funnel icon — right of tabs */}
        <TouchableOpacity
          onPress={() => setFilterVisible(true)}
          style={[
            styles.filterBtn,
            isFilterActive && { backgroundColor: colors.primary + "20" },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name="filter-outline"
            size={22}
            color={isFilterActive ? colors.primary : colors.foreground}
          />
        </TouchableOpacity>
      </View>

      {/* File list */}
      {sortedFiles.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="file-outline" size={64} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {activeTab === "favorites" ? t.noFavorites : t.noFiles}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FileItem file={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterPopup
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filter={filterType}
        onSelect={setFilterType}
        counts={filterCounts}
      />

      <SortBySheet
        visible={sortVisible}
        config={sortConfig}
        onClose={() => setSortVisible(false)}
        onApply={setSortConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

  // Tabs + filter row
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  tabPills: { flex: 1, flexDirection: "row", gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  filterBtn: { padding: 6, borderRadius: 8 },

  // Filter popup
  filterBackdrop: { flex: 1 },
  filterPopup: {
    position: "absolute",
    top: 108,         // below header + tabs row
    right: 16,
    borderRadius: 16,
    minWidth: 200,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  filterLabel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  filterRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  filterDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },

  // List
  list: { paddingBottom: 110, paddingTop: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular" },
});
