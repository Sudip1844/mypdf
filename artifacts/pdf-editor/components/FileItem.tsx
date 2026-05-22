import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useFiles, type PdfFile } from "@/context/FilesContext";
import { useColors } from "@/hooks/useColors";

interface FileItemProps {
  file: PdfFile;
}

export function FileItem({ file }: FileItemProps) {
  const colors = useColors();
  const { deleteFile, renameFile, toggleFavorite } = useFiles();
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const openMenu = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuVisible(true);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert("Delete File", `Delete "${file.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteFile(file.id),
      },
    ]);
  };

  const handleRename = () => {
    setMenuVisible(false);
    setNewName(file.name);
    setRenameVisible(true);
  };

  const confirmRename = () => {
    if (newName.trim()) {
      renameFile(file.id, newName.trim());
    }
    setRenameVisible(false);
  };

  const handleFavorite = () => {
    toggleFavorite(file.id);
    setMenuVisible(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.card }]}
        onPress={() => {}}
        onLongPress={openMenu}
        activeOpacity={0.8}
      >
        <View style={[styles.thumbnail, { backgroundColor: file.color }]}>
          <Text style={styles.thumbText}>PDF</Text>
          <View style={styles.pagesBadge}>
            <Text style={styles.pagesText}>{file.pages}</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text
            style={[styles.name, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {file.name}
          </Text>
          <View style={styles.meta}>
            <View style={[styles.pagesBadge2, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.pagesText2, { color: colors.mutedForeground }]}>
                {file.pages}
              </Text>
            </View>
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {file.date}
            </Text>
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {file.size}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleFavorite}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name={file.isFavorite ? "star" : "share-outline"}
              size={18}
              color={file.isFavorite ? "#F59E0B" : colors.mutedForeground}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openMenu}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={[styles.sheetThumb, { backgroundColor: file.color }]}>
              <Text style={styles.thumbText}>PDF</Text>
            </View>
            <View style={styles.sheetInfo}>
              <Text
                style={[styles.sheetName, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {file.name}
              </Text>
              <Text style={[styles.sheetMeta, { color: colors.mutedForeground }]}>
                {file.pages} pages · {file.date} · {file.size}
              </Text>
            </View>
            <TouchableOpacity onPress={handleFavorite}>
              <MaterialCommunityIcons
                name={file.isFavorite ? "star" : "star-outline"}
                size={22}
                color={file.isFavorite ? "#F59E0B" : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />

          <View style={styles.quickActions}>
            {[
              { icon: "trash-can-outline", label: "Delete", action: handleDelete },
              { icon: "pencil-outline", label: "Rename", action: handleRename },
              { icon: "share-outline", label: "Share", action: () => setMenuVisible(false) },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.quickBtn, { backgroundColor: colors.secondary }]}
                onPress={item.action}
              >
                <MaterialCommunityIcons
                  name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={22}
                  color={colors.foreground}
                />
                <Text style={[styles.quickLabel, { color: colors.foreground }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />

          {[
            { icon: "call-merge", label: "Merge PDF" },
            { icon: "archive-arrow-down-outline", label: "Compress" },
            { icon: "printer-outline", label: "Print PDF" },
            { icon: "file-word-outline", label: "PDF to Word" },
            { icon: "file-powerpoint-outline", label: "PDF to PPT" },
            { icon: "open-in-new", label: "Open With" },
            { icon: "lock-outline", label: "Set Password" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.sheetRow}
              onPress={() => setMenuVisible(false)}
            >
              <MaterialCommunityIcons
                name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={20}
                color={colors.mutedForeground}
              />
              <Text style={[styles.sheetRowLabel, { color: colors.foreground }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal
        visible={renameVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameVisible(false)}
      >
        <View style={styles.renameBackdrop}>
          <View style={[styles.renameBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.renameTitle, { color: colors.foreground }]}>
              Rename File
            </Text>
            <TextInput
              style={[
                styles.renameInput,
                { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border },
              ]}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              selectTextOnFocus
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.renameButtons}>
              <TouchableOpacity
                style={[styles.renameBtn, { backgroundColor: colors.secondary }]}
                onPress={() => setRenameVisible(false)}
              >
                <Text style={[styles.renameBtnText, { color: colors.mutedForeground }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.renameBtn, { backgroundColor: colors.primary }]}
                onPress={confirmRename}
              >
                <Text style={[styles.renameBtnText, { color: "#fff" }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    marginBottom: 10,
    padding: 12,
    gap: 12,
  },
  thumbnail: {
    width: 56,
    height: 70,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  thumbText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
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
  pagesText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pagesBadge2: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pagesText2: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#444",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sheetThumb: {
    width: 48,
    height: 58,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetInfo: {
    flex: 1,
    gap: 4,
  },
  sheetName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  sheetMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  sheetDivider: {
    height: 1,
    marginVertical: 8,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quickBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  sheetRowLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  renameBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  renameBox: {
    borderRadius: 16,
    padding: 20,
    width: "100%",
    gap: 16,
  },
  renameTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  renameInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  renameButtons: {
    flexDirection: "row",
    gap: 10,
  },
  renameBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  renameBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
