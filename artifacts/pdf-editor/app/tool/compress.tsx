import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFiles } from "@/context/FilesContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";
import { compressPdf, downloadPdf, fetchAsArrayBuffer, formatBytes } from "@/utils/pdfUtils";

export default function CompressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addFile } = useFiles();
  const { t } = useLanguage();
  const [pickedFile, setPickedFile] = useState<{ name: string; uri: string; size: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
      if (!result.canceled && result.assets[0]) {
        setPickedFile({ name: result.assets[0].name, uri: result.assets[0].uri, size: result.assets[0].size ?? 0 });
        setDone(false);
      }
    } catch {
      Alert.alert(t.error, t.pickError);
    }
  };

  const compress = async () => {
    if (!pickedFile) return;
    setLoading(true);
    try {
      const buf = await fetchAsArrayBuffer(pickedFile.uri);
      const bytes = await compressPdf(buf);
      setOriginalSize(pickedFile.size);
      setCompressedSize(bytes.length);
      const outName = pickedFile.name.replace(".pdf", "") + "_compressed.pdf";
      downloadPdf(bytes, outName);
      addFile({ name: outName, size: formatBytes(bytes.length), pages: 1, date: new Date().toLocaleDateString(), isFavorite: false, color: "#C62828" });
      setDone(true);
    } catch (e: any) {
      Alert.alert(t.error, t.compressError + e.message);
    } finally {
      setLoading(false);
    }
  };

  const reduction = originalSize > 0 ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100)) : 0;

  const QUALITY_OPTIONS = [
    { key: "low" as const, label: t.low, sub: t.lowSub },
    { key: "medium" as const, label: t.medium, sub: t.mediumSub },
    { key: "high" as const, label: t.high, sub: t.highSub },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.pdfCompress}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {done ? (
          <View style={styles.successBox}>
            <View style={[styles.successIcon, { backgroundColor: "#E5393530" }]}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#E53935" />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>{t.compressDone}</Text>
            <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.originalSize}</Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{formatBytes(originalSize)}</Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={24} color={colors.primary} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.newSize}</Text>
                <Text style={[styles.statValue, { color: "#00796B" }]}>{formatBytes(compressedSize)}</Text>
              </View>
            </View>
            <View style={[styles.reductionBadge, { backgroundColor: "#00796B30" }]}>
              <Text style={[styles.reductionText, { color: "#00796B" }]}>{reduction}{t.sizeReduced}</Text>
            </View>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => { setDone(false); setPickedFile(null); }}>
              <Text style={styles.btnText}>{t.compressAnother}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.dropZone, { borderColor: pickedFile ? colors.primary : colors.border, backgroundColor: colors.card }]}
              onPress={pickFile}
            >
              <View style={[styles.dropIcon, { backgroundColor: pickedFile ? "#E5393520" : colors.secondary }]}>
                <MaterialCommunityIcons name={pickedFile ? "file-check-outline" : "file-upload-outline"} size={48} color={pickedFile ? "#E53935" : colors.mutedForeground} />
              </View>
              {pickedFile ? (
                <>
                  <Text style={[styles.fileName, { color: colors.foreground }]} numberOfLines={1}>{pickedFile.name}</Text>
                  <Text style={[styles.fileSize, { color: colors.mutedForeground }]}>{formatBytes(pickedFile.size)}</Text>
                  <Text style={[styles.changeFile, { color: colors.primary }]}>{t.changeFile}</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.dropText, { color: colors.foreground }]}>{t.pickPdf}</Text>
                  <Text style={[styles.dropSub, { color: colors.mutedForeground }]}>{t.tapToPickFile}</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>{t.qualityLevel}</Text>
              <View style={styles.qualityRow}>
                {QUALITY_OPTIONS.map((q) => (
                  <TouchableOpacity
                    key={q.key}
                    style={[styles.qualityBtn, { backgroundColor: quality === q.key ? colors.primary : colors.secondary }]}
                    onPress={() => setQuality(q.key)}
                  >
                    <Text style={[styles.qualityLabel, { color: quality === q.key ? "#fff" : colors.mutedForeground }]}>{q.label}</Text>
                    <Text style={[styles.qualitySub, { color: quality === q.key ? "#ffffffaa" : colors.mutedForeground }]}>{q.sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.compressBtn, { backgroundColor: pickedFile ? "#E53935" : colors.secondary }]}
              onPress={compress}
              disabled={loading || !pickedFile}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="archive-arrow-down-outline" size={22} color="#fff" />
                  <Text style={styles.compressBtnText}>{t.compressBtn}</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16, gap: 16, paddingBottom: 60 },
  dropZone: { borderWidth: 2, borderStyle: "dashed", borderRadius: 20, padding: 32, alignItems: "center", gap: 10 },
  dropIcon: { width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  dropText: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  dropSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  fileName: { fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  fileSize: { fontSize: 13, fontFamily: "Inter_400Regular" },
  changeFile: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 4 },
  card: { borderRadius: 16, padding: 16, gap: 12 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  qualityRow: { flexDirection: "row", gap: 8 },
  qualityBtn: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", gap: 2 },
  qualityLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  qualitySub: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  compressBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 16, gap: 10 },
  compressBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  successBox: { alignItems: "center", gap: 16, paddingTop: 40 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 22, fontFamily: "Inter_600SemiBold" },
  statsCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 20, gap: 20, width: "100%" },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  reductionBadge: { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  reductionText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  btn: { width: "100%", borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
