import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { FileItem } from "@/components/FileItem";
import { SortBySheet, type SortConfig } from "@/components/SortBySheet";
import { useFiles, type PdfFile } from "@/context/FilesContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

type Tab = "all" | "recent" | "favorites";

export default function FilesScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const { files, recentFiles, favoriteFiles } = useFiles();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "created", order: "desc" });

  const baseFiles = useMemo((): PdfFile[] => {
    if (activeTab === "recent") return recentFiles;
    if (activeTab === "favorites") return favoriteFiles;
    return files;
  }, [activeTab, files, recentFiles, favoriteFiles]);

  const sortedFiles = useMemo(() => {
    const arr = searchQuery.trim()
      ? baseFiles.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : [...baseFiles];

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
  }, [baseFiles, searchQuery, sortConfig]);

  const TABS: { key: Tab; label: string }[] = [
    { key: "all",       label: t.allFiles },
    { key: "recent",    label: t.recent },
    { key: "favorites", label: t.favorites },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      {searchVisible && (
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder={t.searchFiles}
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity onPress={() => { setSearchVisible(false); setSearchQuery(""); }}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      {/* Tab pills */}
      <View style={styles.tabsRow}>
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

      {/* "All (N)" header row with Select All + Sort */}
      <View style={[styles.listHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.listTitle, { color: colors.foreground }]}>
          {TABS.find((t) => t.key === activeTab)?.label}{" "}
          <Text style={[styles.listCount, { color: colors.mutedForeground }]}>
            ({sortedFiles.length})
          </Text>
        </Text>
        <View style={styles.listActions}>
          <TouchableOpacity
            onPress={() => setSelectMode((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name="checkbox-multiple-outline"
              size={22}
              color={selectMode ? colors.primary : colors.foreground}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="sort" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    marginBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  listCount: { fontSize: 15, fontFamily: "Inter_400Regular" },
  listActions: { flexDirection: "row", alignItems: "center", gap: 18 },
  list: { paddingBottom: 110, paddingTop: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular" },
});
