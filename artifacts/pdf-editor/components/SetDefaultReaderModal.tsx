import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const STORAGE_KEY = "@pdf_editor_default_reader_dismissed";

interface Props {
  /** Call this after a PDF is created or opened to potentially show the modal */
  trigger?: boolean;
}

export function SetDefaultReaderModal({ trigger }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    checkAndShow();
  }, [trigger]);

  const checkAndShow = async () => {
    try {
      const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        // Show with a slight delay so it doesn't appear immediately
        setTimeout(() => setVisible(true), 1200);
      }
    } catch {
      setTimeout(() => setVisible(true), 1200);
    }
  };

  const dismiss = async (permanent = false) => {
    setVisible(false);
    if (permanent) {
      try { await AsyncStorage.setItem(STORAGE_KEY, "1"); } catch {}
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => dismiss(false)}
    >
      <Pressable style={styles.backdrop} onPress={() => dismiss(false)} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom + 16, 32) },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Icon illustration */}
        <View style={styles.iconWrap}>
          <View style={[styles.bookBg, { backgroundColor: colors.primary + "20" }]}>
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={52} color={colors.primary} />
          </View>
          <View style={styles.pdfBadge}>
            <Text style={styles.pdfBadgeText}>PDF</Text>
          </View>
        </View>

        {/* Text */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          Set as Default Reader for{" "}
          <Text style={{ color: colors.primary }}>PDF</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Set our app as your default reader for faster{"\n"}and easier file access.
        </Text>

        {/* Set button */}
        <TouchableOpacity
          style={[styles.setBtn, { backgroundColor: colors.primary }]}
          onPress={() => dismiss(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.setBtnText}>Set</Text>
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity onPress={() => dismiss(false)} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 12,
    gap: 14,
  },
  handle: { width: 40, height: 4, borderRadius: 2, marginBottom: 8 },
  iconWrap: { position: "relative", marginVertical: 8 },
  bookBg: {
    width: 90,
    height: 90,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pdfBadge: {
    position: "absolute",
    bottom: -6,
    right: -10,
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  pdfBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 6,
  },
  setBtn: {
    width: "100%",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  setBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  cancelBtn: { paddingVertical: 8 },
  cancelText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
