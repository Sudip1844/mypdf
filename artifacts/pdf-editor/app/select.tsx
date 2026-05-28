import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFiles, type PdfFile } from "@/context/FilesContext";
import { useColors } from "@/hooks/useColors";

function SelectableFileRow({
  file,
  selected,
  onToggle,
}: {
  file: PdfFile;
  selected: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card }]}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      {/* Thumbnail */}
      <View style={[styles.thumb, { backgroundColor: file.color }]}>
        <Text style={styles.thumbText}>PDF</Text>
        <View style={styles.pagesBadge}>
          <Text style={styles.pagesText}>{file.pages}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.fileName, { color: colors.foreground }]} numberOfLines={1}>
          {file.name}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.pBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.pBadgeText, { color: colors.mutedForeground }]}>
              {file.pages}
            </Text>
          </View>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{file.date}</Text>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{file.size}</Text>
        </View>
      </View>

      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : "transparent",
          },
        ]}
      >
        {selected && (
          <MaterialCommunityIcons name="check" size={16} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SelectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { files, deleteFile } = useFiles();
  const params = useLocalSearchParams<{ source?: string }>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Both home and files source use app files; UI title differs
  const allFiles: PdfFile[] = files;
  const selectedCount = selectedIds.size;
  const allSelected = selectedCount === allFiles.length && allFiles.length > 0;

  const toggle = (id: string) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allFiles.map((f) => f.id)));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Files",
      `Delete ${selectedCount} file${selectedCount > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            selectedIds.forEach((id) => deleteFile(id));
            router.back();
          },
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert("Share", `Sharing ${selectedCount} file${selectedCount > 1 ? "s" : ""}…`);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerBtn}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {selectedCount > 0 ? `${selectedCount} Selected` : "Select"}
        </Text>

        {/* Right actions */}
        <View style={styles.headerRight}>
          {selectedCount > 0 && (
            <>
              {/* Share */}
              <TouchableOpacity
                onPress={handleShare}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.headerBtn}
              >
                <MaterialCommunityIcons
                  name="share-outline"
                  size={22}
                  color={colors.foreground}
                />
              </TouchableOpacity>

              {/* Delete */}
              <TouchableOpacity
                onPress={handleDelete}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.headerBtn}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </>
          )}

          {/* Select All toggle */}
          <TouchableOpacity
            onPress={toggleAll}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerBtn}
          >
            <MaterialCommunityIcons
              name={allSelected ? "select-all" : "checkbox-blank-outline"}
              size={24}
              color={allSelected ? colors.primary : colors.foreground}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── File list ── */}
      {allFiles.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="file-outline" size={52} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No files yet</Text>
        </View>
      ) : (
        <FlatList
          data={allFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SelectableFileRow
              file={item}
              selected={selectedIds.has(item.id)}
              onToggle={() => toggle(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },

  // File row
  list: { paddingHorizontal: 12, paddingBottom: 40, gap: 8, paddingTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 70,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  thumbText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  pagesBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "#374151",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  pagesText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  info: { flex: 1, gap: 6 },
  fileName: { fontSize: 13, fontFamily: "Inter_500Medium" },
  meta: { flexDirection: "row", alignItems: "center", gap: 8 },
  pBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  pBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },

  // Checkbox
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular" },
});
