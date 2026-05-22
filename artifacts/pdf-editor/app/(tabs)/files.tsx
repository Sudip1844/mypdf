import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { FileItem } from "@/components/FileItem";
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

  const getDisplayFiles = (): PdfFile[] => {
    let base: PdfFile[];
    if (activeTab === "recent") base = recentFiles;
    else if (activeTab === "favorites") base = favoriteFiles;
    else base = files;

    if (!searchQuery.trim()) return base;
    return base.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const displayFiles = getDisplayFiles();

  const TABS: { key: Tab; label: string }[] = [
    { key: "all", label: t.allFiles },
    { key: "recent", label: t.recent },
    { key: "favorites", label: t.favorites },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.card }]}
          onPress={() => setSearchVisible(!searchVisible)}
        >
          <MaterialCommunityIcons name="tune-variant" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {displayFiles.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="file-outline" size={64} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {activeTab === "favorites" ? t.noFavorites : t.noFiles}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FileItem file={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  tabsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  filterBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginLeft: "auto" },
  list: { paddingBottom: 110 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular" },
});
