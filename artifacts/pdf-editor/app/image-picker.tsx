import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePickerLib from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

// ── Web fallback ────────────────────────────────────────────────────────────
// expo-media-library requires native bindings unavailable on web.
// On web we show a simple file-picker that opens the OS dialog.
function WebImagePicker() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const pick = async () => {
    const result = await ImagePickerLib.launchImageLibraryAsync({
      mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.9,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      router.push({
        pathname: "/tool/image-to-pdf",
        params: { preselected: JSON.stringify(uris) },
      });
    }
  };

  return (
    <View style={[wStyles.container, { backgroundColor: colors.background }]}>
      <View style={[wStyles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[wStyles.title, { color: colors.foreground }]}>Image Selection</Text>
      </View>
      <View style={wStyles.center}>
        <View style={[wStyles.iconBox, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="image-multiple-outline" size={64} color={colors.primary} />
        </View>
        <Text style={[wStyles.label, { color: colors.foreground }]}>Select Images</Text>
        <Text style={[wStyles.sub, { color: colors.mutedForeground }]}>
          Tap below to pick images from your device
        </Text>
        <TouchableOpacity style={[wStyles.btn, { backgroundColor: colors.primary }]} onPress={pick}>
          <MaterialCommunityIcons name="folder-open-outline" size={20} color="#fff" />
          <Text style={wStyles.btnText}>Browse Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const wStyles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 4 },
  title: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", paddingLeft: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, padding: 40 },
  iconBox: { width: 120, height: 120, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 22, fontFamily: "Inter_600SemiBold" },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  btn: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14 },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});

const SCREEN_W = Dimensions.get("window").width;
const COLS = 3;
const GAP = 2;
const CELL = (SCREEN_W - GAP * (COLS + 1)) / COLS;

type Asset = MediaLibrary.Asset;
type Album = MediaLibrary.Album & { coverUri?: string };

export default function ImagePickerScreen() {
  // expo-media-library is native-only; use the simpler web picker on web
  if (Platform.OS === "web") return <WebImagePicker />;

  return <NativeImagePicker />;
}

function NativeImagePicker() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [albumsVisible, setAlbumsVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const loadingMore = useRef(false);

  // ── Request permission ──────────────────────────────────────────────────
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // ── Load photos ─────────────────────────────────────────────────────────
  const loadAssets = useCallback(
    async (album: Album | null = null, cursor?: string) => {
      if (loadingMore.current) return;
      loadingMore.current = true;
      setLoading(!cursor);
      try {
        const res = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.photo,
          album: album?.id ?? undefined,
          first: 60,
          after: cursor,
          sortBy: [MediaLibrary.SortBy.creationTime],
        });
        setAssets((prev) => (cursor ? [...prev, ...res.assets] : res.assets));
        setEndCursor(res.endCursor);
        setHasMore(res.hasNextPage);
      } finally {
        setLoading(false);
        loadingMore.current = false;
      }
    },
    []
  );

  // ── Load albums ──────────────────────────────────────────────────────────
  const loadAlbums = useCallback(async () => {
    const list = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
    const withCovers: Album[] = await Promise.all(
      list.map(async (a) => {
        try {
          const res = await MediaLibrary.getAssetsAsync({
            album: a.id,
            first: 1,
            mediaType: MediaLibrary.MediaType.photo,
          });
          return { ...a, coverUri: res.assets[0]?.uri };
        } catch {
          return { ...a };
        }
      })
    );
    setAlbums(withCovers);
  }, []);

  useEffect(() => {
    if (permission?.granted) {
      loadAssets(null);
      loadAlbums();
    }
  }, [permission?.granted]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const undo = () => setSelectedIds((prev) => prev.slice(0, -1));

  const selectAlbum = (album: Album | null) => {
    setAlbumsVisible(false);
    setActiveAlbum(album);
    setAssets([]);
    setEndCursor(undefined);
    setHasMore(true);
    loadAssets(album);
  };

  const handleImport = () => {
    const uris = assets
      .filter((a) => selectedIds.includes(a.id))
      .map((a) => a.uri);
    // also keep order of selection
    const ordered = selectedIds
      .map((id) => assets.find((a) => a.id === id)?.uri)
      .filter(Boolean) as string[];
    router.push({
      pathname: "/tool/image-to-pdf",
      params: { preselected: JSON.stringify(ordered) },
    });
  };

  const openCamera = async () => {
    const res = await ImagePickerLib.launchCameraAsync({
      mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled && res.assets[0]) {
      router.push({
        pathname: "/tool/image-to-pdf",
        params: { preselected: JSON.stringify([res.assets[0].uri]) },
      });
    }
  };

  const loadMore = () => {
    if (hasMore && !loadingMore.current) {
      loadAssets(activeAlbum, endCursor);
    }
  };

  // ── Camera cell (index 0) ────────────────────────────────────────────────
  const CameraCell = () => (
    <TouchableOpacity
      style={[styles.cameraCell, { width: CELL, height: CELL }]}
      onPress={openCamera}
      activeOpacity={0.8}
    >
      <View style={styles.cameraInner}>
        <MaterialCommunityIcons name="camera-outline" size={40} color="#fff" />
        <Text style={styles.cameraLabel}>Camera</Text>
      </View>
    </TouchableOpacity>
  );

  // ── Photo cell ───────────────────────────────────────────────────────────
  const PhotoCell = ({ item }: { item: Asset }) => {
    const idx = selectedIds.indexOf(item.id);
    const selected = idx !== -1;
    return (
      <TouchableOpacity
        style={[styles.cell, { width: CELL, height: CELL }]}
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.uri }} style={styles.cellImg} />
        {selected && <View style={styles.selectedOverlay} />}
        {/* Expand button */}
        <TouchableOpacity
          style={styles.expandBtn}
          onPress={() => setPreviewUri(item.uri)}
          hitSlop={{ top: 6, left: 6, bottom: 6, right: 6 }}
        >
          <MaterialCommunityIcons name="arrow-expand" size={14} color="#fff" />
        </TouchableOpacity>
        {/* Selection badge */}
        {selected ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{idx + 1}</Text>
          </View>
        ) : (
          <View style={styles.emptyCircle} />
        )}
      </TouchableOpacity>
    );
  };

  // ── Permission not granted ───────────────────────────────────────────────
  if (permission && !permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="image-off-outline" size={64} color={colors.mutedForeground} />
        <Text style={[styles.permTitle, { color: colors.foreground }]}>Gallery Access Required</Text>
        <Text style={[styles.permSub, { color: colors.mutedForeground }]}>
          Allow access to your photos to select images.
        </Text>
        <TouchableOpacity
          style={[styles.permBtn, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedAssets = selectedIds
    .map((id) => assets.find((a) => a.id === id))
    .filter(Boolean) as Asset[];

  const allCount = albums.reduce((s, a) => s + (a.assetCount ?? 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + (Platform.OS === "web" ? 12 : 8),
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Image Selection</Text>
        <TouchableOpacity
          style={[styles.iconBtn, { opacity: selectedIds.length ? 1 : 0.4 }]}
          onPress={undo}
          disabled={!selectedIds.length}
        >
          <MaterialCommunityIcons name="undo" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="select-all" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* ── Grid ── */}
      {loading && assets.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.id}
          numColumns={COLS}
          contentContainerStyle={{ gap: GAP, paddingBottom: selectedAssets.length > 0 ? 160 : 100 }}
          columnWrapperStyle={{ gap: GAP }}
          ListHeaderComponent={
            <View style={{ flexDirection: "row", gap: GAP }}>
              <CameraCell />
              {assets.slice(0, COLS - 1).map((item) => (
                <PhotoCell key={item.id} item={item} />
              ))}
            </View>
          }
          renderItem={({ item, index }) => {
            if (index < COLS - 1) return null; // already in header row
            return <PhotoCell item={item} />;
          }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          getItemLayout={(_, index) => ({
            length: CELL + GAP,
            offset: (CELL + GAP) * Math.floor(index / COLS),
            index,
          })}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Bottom bar ── */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        {/* Selected thumbnails strip */}
        {selectedAssets.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbStrip}
            contentContainerStyle={styles.thumbStripContent}
          >
            {selectedAssets.map((a) => (
              <View key={a.id} style={styles.thumbWrap}>
                <Image source={{ uri: a.uri }} style={styles.thumb} />
                <TouchableOpacity
                  style={styles.thumbRemove}
                  onPress={() => toggleSelect(a.id)}
                >
                  <MaterialCommunityIcons name="close" size={10} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Album picker row */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.albumBtn}
            onPress={() => setAlbumsVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.albumBtnText, { color: colors.foreground }]}>
              {activeAlbum ? activeAlbum.title : "All Images"}
            </Text>
            <MaterialCommunityIcons
              name={albumsVisible ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.foreground}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.importBtn,
              { backgroundColor: selectedIds.length > 0 ? colors.primary : colors.secondary },
            ]}
            onPress={handleImport}
            disabled={selectedIds.length === 0}
          >
            <Text style={[styles.importBtnText, { color: selectedIds.length > 0 ? "#fff" : colors.mutedForeground }]}>
              IMPORT ({selectedIds.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Album chooser modal ── */}
      <Modal
        visible={albumsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAlbumsVisible(false)}
      >
        <Pressable style={styles.albumBackdrop} onPress={() => setAlbumsVisible(false)} />
        <View style={[styles.albumSheet, { backgroundColor: colors.card }]}>
          {/* All Images row */}
          <TouchableOpacity
            style={[
              styles.albumRow,
              { borderBottomColor: colors.border },
              !activeAlbum && { backgroundColor: colors.primary + "22" },
            ]}
            onPress={() => selectAlbum(null)}
          >
            <View style={[styles.albumThumb, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name="image-multiple-outline" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.albumName, { color: colors.foreground }]}>All Images</Text>
            <Text style={[styles.albumCount, { color: colors.mutedForeground }]}>{allCount}</Text>
            {!activeAlbum && (
              <View style={[styles.albumActiveDot, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>

          <FlatList
            data={albums}
            keyExtractor={(a) => a.id}
            renderItem={({ item: album }) => (
              <TouchableOpacity
                style={[
                  styles.albumRow,
                  { borderBottomColor: colors.border },
                  activeAlbum?.id === album.id && { backgroundColor: colors.primary + "22" },
                ]}
                onPress={() => selectAlbum(album)}
              >
                {album.coverUri ? (
                  <Image source={{ uri: album.coverUri }} style={styles.albumThumb} />
                ) : (
                  <View style={[styles.albumThumb, { backgroundColor: colors.secondary }]} />
                )}
                <Text style={[styles.albumName, { color: colors.foreground }]} numberOfLines={1}>
                  {album.title}
                </Text>
                <Text style={[styles.albumCount, { color: colors.mutedForeground }]}>
                  {album.assetCount ?? 0}
                </Text>
                {activeAlbum?.id === album.id && (
                  <View style={[styles.albumActiveDot, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            )}
            style={{ maxHeight: 380 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom album bar mirrors main */}
          <View style={[styles.albumFooter, { borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TouchableOpacity style={styles.albumBtn} onPress={() => setAlbumsVisible(false)}>
              <Text style={[styles.albumBtnText, { color: colors.foreground }]}>
                {activeAlbum ? activeAlbum.title : "All Images"}
              </Text>
              <MaterialCommunityIcons name="chevron-up" size={18} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.importBtn, { backgroundColor: selectedIds.length > 0 ? colors.primary : colors.secondary }]}
              onPress={() => { setAlbumsVisible(false); handleImport(); }}
              disabled={selectedIds.length === 0}
            >
              <Text style={[styles.importBtnText, { color: selectedIds.length > 0 ? "#fff" : colors.mutedForeground }]}>
                IMPORT ({selectedIds.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Full-screen preview modal ── */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setPreviewUri(null)}>
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={styles.previewImg}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewUri(null)}>
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  iconBtn: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", paddingLeft: 4 },

  // Grid cells
  cameraCell: {
    backgroundColor: "#1565C0",
    overflow: "hidden",
  },
  cameraInner: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  cameraLabel: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },

  cell: { overflow: "hidden", position: "relative" },
  cellImg: { width: "100%", height: "100%" },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(91,95,239,0.35)",
    borderWidth: 2,
    borderColor: "#5B5FEF",
  },
  expandBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 6,
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#5B5FEF",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  emptyCircle: {
    position: "absolute",
    top: 7,
    left: 7,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    gap: 6,
  },
  thumbStrip: { maxHeight: 72 },
  thumbStripContent: { paddingHorizontal: 12, gap: 8, alignItems: "center" },
  thumbWrap: { position: "relative" },
  thumb: { width: 60, height: 60, borderRadius: 10 },
  thumbRemove: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#666",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
    paddingBottom: 4,
  },
  albumBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  albumBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  importBtn: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: "center",
  },
  importBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },

  // Album modal
  albumBackdrop: { flex: 0.35, backgroundColor: "rgba(0,0,0,0.5)" },
  albumSheet: {
    flex: 0.65,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  albumRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  albumThumb: { width: 52, height: 52, borderRadius: 8 },
  albumName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  albumCount: { fontSize: 14, fontFamily: "Inter_400Regular" },
  albumActiveDot: { width: 8, height: 8, borderRadius: 4 },
  albumFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // Preview modal
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImg: { width: "100%", height: "80%" },
  previewClose: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
  },

  // Permission screen
  permTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  permSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  permBtn: { borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  permBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
