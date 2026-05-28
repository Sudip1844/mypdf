import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFiles, type PdfFile } from "@/context/FilesContext";
import { useColors } from "@/hooks/useColors";

// Highlights the portion of `text` that matches `query` with primary color background
function HighlightText({
  text,
  query,
  textStyle,
  highlightColor,
}: {
  text: string;
  query: string;
  textStyle: object;
  highlightColor: string;
}) {
  if (!query.trim()) {
    return <Text style={textStyle}>{text}</Text>;
  }

  const lower = text.toLowerCase();
  const lowerQ = query.toLowerCase();
  const idx = lower.indexOf(lowerQ);

  if (idx === -1) {
    return <Text style={textStyle}>{text}</Text>;
  }

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return (
    <Text style={textStyle}>
      {before}
      <Text style={[textStyle, { color: highlightColor, fontFamily: "Inter_600SemiBold" }]}>
        {match}
      </Text>
      {after}
    </Text>
  );
}

// Slim file row for search results — just thumbnail, highlighted name, metadata
function SearchResultItem({
  file,
  query,
}: {
  file: PdfFile;
  query: string;
}) {
  const colors = useColors();

  return (
    <View style={[styles.resultRow, { backgroundColor: colors.card }]}>
      {/* Thumbnail */}
      <View style={[styles.thumb, { backgroundColor: file.color }]}>
        <Text style={styles.thumbText}>PDF</Text>
        <View style={styles.pagesBadge}>
          <Text style={styles.pagesText}>{file.pages}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <HighlightText
          text={file.name}
          query={query}
          textStyle={[styles.fileName, { color: colors.foreground }]}
          highlightColor={colors.primary}
        />
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

      {/* Actions */}
      <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <MaterialCommunityIcons name="share-outline" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
      <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { files } = useFiles();
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  const results = useMemo<PdfFile[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* ── Search header ── */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={[styles.inputWrap, { backgroundColor: colors.card }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Search"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            clearButtonMode="never"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); inputRef.current?.focus(); }}>
              <View style={[styles.clearBtn, { backgroundColor: colors.mutedForeground }]}>
                <Feather name="x" size={12} color={colors.card} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Results count (only when query present) ── */}
      {hasQuery && (
        <Text style={[styles.countText, { color: colors.foreground }]}>
          {results.length} {results.length === 1 ? "item" : "items"}
        </Text>
      )}

      {/* ── Results list ── */}
      {results.length === 0 && hasQuery ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="file-search-outline" size={52} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            No PDF found matching "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SearchResultItem file={item} query={query} />
          )}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
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
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: { padding: 4 },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  clearBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  // Count label
  countText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  // File row
  list: { paddingHorizontal: 12, paddingBottom: 40, gap: 8 },
  resultRow: {
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

  // Empty
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
