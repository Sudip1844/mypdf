import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePickerLib from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

// expo-image-picker works in Expo Go on both Android, iOS, and web.
// expo-media-library is NOT supported in Expo Go on Android (crashes).
export default function ImagePickerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickFromGallery = async () => {
    try {
      setLoading(true);
      const result = await ImagePickerLib.launchImageLibraryAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.92,
        orderedSelection: true,
      });
      if (!result.canceled) {
        const uris = result.assets.map((a) => a.uri);
        setSelected((prev) => {
          // Merge and deduplicate
          const merged = [...prev, ...uris.filter((u) => !prev.includes(u))];
          return merged;
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const pickFromCamera = async () => {
    try {
      setLoading(true);
      const result = await ImagePickerLib.launchCameraAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        quality: 0.92,
      });
      if (!result.canceled && result.assets[0]) {
        setSelected((prev) => [...prev, result.assets[0].uri]);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (uri: string) => {
    setSelected((prev) => prev.filter((u) => u !== uri));
  };

  const handleImport = () => {
    if (selected.length === 0) return;
    router.push({
      pathname: "/tool/image-to-pdf",
      params: { preselected: JSON.stringify(selected) },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "ios" ? 12 : 16),
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Image Selection
        </Text>
        {selected.length > 0 && (
          <TouchableOpacity onPress={() => setSelected([])} style={styles.clearBtn}>
            <Text style={[styles.clearText, { color: colors.primary }]}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Pick buttons ── */}
        <View style={styles.pickRow}>
          <TouchableOpacity
            style={[styles.pickCard, { backgroundColor: colors.card }]}
            onPress={pickFromGallery}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={[styles.pickIcon, { backgroundColor: "#5B5FEF20" }]}>
              <MaterialCommunityIcons name="image-multiple-outline" size={36} color="#5B5FEF" />
            </View>
            <Text style={[styles.pickLabel, { color: colors.foreground }]}>Gallery</Text>
            <Text style={[styles.pickSub, { color: colors.mutedForeground }]}>
              Pick multiple images
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pickCard, { backgroundColor: colors.card }]}
            onPress={pickFromCamera}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={[styles.pickIcon, { backgroundColor: "#1565C020" }]}>
              <MaterialCommunityIcons name="camera-outline" size={36} color="#1565C0" />
            </View>
            <Text style={[styles.pickLabel, { color: colors.foreground }]}>Camera</Text>
            <Text style={[styles.pickSub, { color: colors.mutedForeground }]}>
              Take a new photo
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
        )}

        {/* ── Selected images preview ── */}
        {selected.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={[styles.selectedTitle, { color: colors.foreground }]}>
              Selected ({selected.length})
            </Text>
            <View style={styles.grid}>
              {selected.map((uri, idx) => (
                <View key={uri} style={styles.thumbWrap}>
                  <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                  {/* Order badge */}
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{idx + 1}</Text>
                  </View>
                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeImage(uri)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {/* Add more button */}
              <TouchableOpacity
                style={[styles.addMore, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={pickFromGallery}
              >
                <MaterialCommunityIcons name="plus" size={28} color={colors.primary} />
                <Text style={[styles.addMoreText, { color: colors.primary }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Empty state ── */}
        {selected.length === 0 && !loading && (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="image-plus" size={64} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No images selected
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Tap Gallery to pick images or Camera to take a photo.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Import button (fixed bottom) ── */}
      {selected.length > 0 && (
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={[styles.importBtn, { backgroundColor: colors.primary }]}
            onPress={handleImport}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={22} color="#fff" />
            <Text style={styles.importBtnText}>
              Create PDF ({selected.length} image{selected.length !== 1 ? "s" : ""})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const THUMB = 100;

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold" },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  // Scroll
  scroll: { padding: 20, gap: 24, paddingBottom: 140 },

  // Pick cards
  pickRow: { flexDirection: "row", gap: 14 },
  pickCard: {
    flex: 1,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  pickIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  pickLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  pickSub: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },

  // Selected section
  selectedSection: { gap: 12 },
  selectedTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  thumbWrap: { position: "relative", width: THUMB, height: THUMB },
  thumb: { width: THUMB, height: THUMB, borderRadius: 12 },
  badge: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
  },

  // Add more tile
  addMore: {
    width: THUMB,
    height: THUMB,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addMoreText: { fontSize: 11, fontFamily: "Inter_500Medium" },

  // Empty state
  emptyBox: { alignItems: "center", gap: 12, paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 28,
    paddingVertical: 16,
  },
  importBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
