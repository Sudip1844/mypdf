import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function PdfReaderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("");

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
      if (!result.canceled && result.assets[0]) {
        setPdfUri(result.assets[0].uri);
        setPdfName(result.assets[0].name);
      }
    } catch {
      Alert.alert(t.error, "Failed to open PDF.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => { if (pdfUri) setPdfUri(null); else router.back(); }}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {pdfName || t.pdfReader}
        </Text>
        {pdfUri && (
          <TouchableOpacity onPress={pickPdf}>
            <MaterialCommunityIcons name="folder-open-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
        )}
      </View>

      {!pdfUri ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: "#E5393520" }]}>
            <MaterialCommunityIcons name="file-pdf-box" size={64} color="#E53935" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t.openPdf}</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>{t.pickFromDevice}</Text>
          <TouchableOpacity style={[styles.openBtn, { backgroundColor: "#E53935" }]} onPress={pickPdf}>
            <MaterialCommunityIcons name="folder-open-outline" size={20} color="#fff" />
            <Text style={styles.openBtnText}>{t.pickPdfBtn}</Text>
          </TouchableOpacity>
        </View>
      ) : Platform.OS === "web" ? (
        <View style={{ flex: 1 }}>
          {/* @ts-ignore */}
          <iframe
            src={pdfUri}
            style={{ flex: 1, border: "none", width: "100%", height: "100%", minHeight: 600, backgroundColor: colors.background }}
            title={pdfName}
          />
        </View>
      ) : (
        <View style={styles.nativeView}>
          <MaterialCommunityIcons name="file-pdf-box" size={80} color="#E53935" />
          <Text style={[styles.nativeTitle, { color: colors.foreground }]}>{pdfName}</Text>
          <Text style={[styles.nativeSub, { color: colors.mutedForeground }]}>{t.pdfLoaded}</Text>
          <TouchableOpacity style={[styles.openBtn, { backgroundColor: colors.primary }]} onPress={pickPdf}>
            <Text style={styles.openBtnText}>{t.openAnother}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  emptyIcon: { width: 120, height: 120, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 22, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  openBtn: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28 },
  openBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  nativeView: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  nativeTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  nativeSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
