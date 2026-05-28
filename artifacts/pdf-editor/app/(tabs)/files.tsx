import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
type FileTypeFilter = "all" | "pdf" | "word" | "excel" | "ppt";

const TYPE_OPTIONS: { key: FileTypeFilter; label: string; ext: string }[] = [
  { key: "all",   label: "All",   ext: "" },
  { key: "pdf",   label: "PDF",   ext: ".pdf" },
  { key: "word",  label: "Word",  ext: ".doc" },
  { key: "excel", label: "Excel", ext: ".xls" },
  { key: "ppt",   label: "PPT",   ext: ".ppt" },
];

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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Dim backdrop — tapping outside closes */}
      <Pressable style={styles.filterBackdrop} onPress={onClose} />

      {/* Popup card — positioned top-right */}
      <View
        style={[
          styles.filterCard,
          {
            backgroundColor: colors.card,
            shadowColor: "#000",
          },
        ]}
      >
        <Text style={[styles.filterTitle, { color: colors.foreground }]}>Filter</Text>

        {TYPE_OPTIONS.map((opt, idx) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.filterRow,
              idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
            ]}
            onPress={() => { onSelect(opt.key); onClose(); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterLabel, { color: colors.foreground }]}>
              {opt.key === "all"
                ? `All (${counts.all})`
                : `${opt.label} (${counts[opt.key]})`}
            </Text>
            <View
              style={[
                styles.filterRadio,
                {
                  borderColor: filter === opt.key ? colors.primary : colors.border,
                },
              ]}
            >
              {filter === opt.key && (
                <View style={[styles.filterDot, { backgroundColor: colors.primary }]} />
              )}
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

  // Filter by type — all app files are PDF; word/excel/ppt show 0
  const typedFiles = useMemo((): PdfFile[] => {
    if (filterType === "all" || filterType === "pdf") return baseFiles;
    return []; // word/excel/ppt are not created by this app
  }, [baseFiles, filterType]);

  const sortedFiles = useMemo(() => {
    const arr = [...typedFiles];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortConfig.field === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortConfig.field === "size") {
        const toBytes = (s: string) =>
          parseFloat(s) * (s.toLowerCase().includes("mb") ? 1e6 : 1e3);
        cmp = toBytes(a.size) - toBytes(b.size);
      } else {
        // date or modified — use date string comparison
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
    ppt:   0,
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "all",       label: t.allFiles },
    { key: "recent",    label: t.recent },
    { key: "favorites", label: t.favorites },
  ];

  const isFilterActive = filterType !== "all";
  const activeTypeMeta = TYPE_OPTIONS.find((o) => o.key === filterType);
  const filterSubtitle = isFilterActive
    ? `${activeTypeMeta?.label} Files  •  ${sortedFiles.length} item${sortedFiles.length !== 1 ? "s" : ""}`
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Tab pills row + Filter + Sort icons ── */}
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

        {/* Sort icon */}
        <TouchableOpacity
          onPress={() => setSortVisible(true)}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="sort" size={22} color={colors.foreground} />
        </TouchableOpacity>

        {/* Filter funnel */}
        <TouchableOpacity
          onPress={() => setFilterVisible(true)}
          style={[
            styles.iconBtn,
            isFilterActive && { backgroundColor: colors.primary + "22" },
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

      {/* Active filter subtitle */}
      {filterSubtitle && (
        <View style={[styles.subtitleRow, { backgroundColor: colors.primary + "15" }]}>
          <MaterialCommunityIcons name="filter-check" size={14} color={colors.primary} />
          <Text style={[styles.subtitleText, { color: colors.primary }]}>
            {filterSubtitle}
          </Text>
          <TouchableOpacity onPress={() => setFilterType("all")} style={styles.clearFilter}>
            <MaterialCommunityIcons name="close-circle" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── File list ── */}
      {sortedFiles.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="file-outline" size={64} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {isFilterActive
              ? `No ${activeTypeMeta?.label} files found`
              : activeTab === "favorites"
              ? t.noFavorites
              : t.noFiles}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FileItem file={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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

  // Tabs row
  tabsRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 },
  tabPills: { flex: 1, flexDirection: "row", gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  iconBtn: { padding: 6, borderRadius: 8 },

  // Filter subtitle badge
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 10,
  },
  subtitleText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  clearFilter: { padding: 2 },

  // Filter popup
  filterBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  filterCard: {
    position: "absolute",
    top: 112,
    right: 16,
    borderRadius: 18,
    minWidth: 210,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 14,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  filterDot: { width: 10, height: 10, borderRadius: 5 },

  // List
  list: { paddingBottom: 110, paddingTop: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular", textAlign: "center" },
});
