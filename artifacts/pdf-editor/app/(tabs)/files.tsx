import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FileItem } from "@/components/FileItem";
import { useFiles, type PdfFile } from "@/context/FilesContext";
import { useColors } from "@/hooks/useColors";

type Tab = "all" | "recent" | "favorites";

export default function FilesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { files, recentFiles, favoriteFiles } = useFiles();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const isWeb = Platform.OS === "web";

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {searchVisible && (
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              marginTop: isWeb ? insets.top + 60 : 8,
            },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search files..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => {
              setSearchVisible(false);
              setSearchQuery("");
            }}
          >
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[
          styles.tabsRow,
          { marginTop: !searchVisible && isWeb ? insets.top + 60 : searchVisible ? 8 : 8 },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            {(["all", "recent", "favorites"] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && {
                    backgroundColor: colors.primary,
                  },
                  activeTab !== tab && {
                    backgroundColor: colors.card,
                  },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === tab ? "#fff" : colors.mutedForeground,
                    },
                  ]}
                >
                  {tab === "all"
                    ? "All Files"
                    : tab === "recent"
                    ? "Recent"
                    : "Favorites"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.card }]}
          onPress={() => setSearchVisible(!searchVisible)}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={18}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      {displayFiles.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="file-outline"
            size={64}
            color={colors.muted}
          />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No files found
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FileItem file={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: isWeb ? 120 : 100 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!displayFiles.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingTop: 4,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
});
