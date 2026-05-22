import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Slider,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFiles } from "@/context/FilesContext";
import { useColors } from "@/hooks/useColors";
import { addWatermarkToPdf, downloadPdf, fetchAsArrayBuffer, formatBytes } from "@/utils/pdfUtils";

export default function WatermarkScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addFile } = useFiles();
  const [pickedFile, setPickedFile] = useState<{ name: string; uri: string; size: number } | null>(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.3);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      setPickedFile({ name: result.assets[0].name, uri: result.assets[0].uri, size: result.assets[0].size ?? 0 });
      setDone(false);
    }
  };

  const apply = async () => {
    if (!pickedFile || !watermarkText.trim()) return;
    setLoading(true);
    try {
      const buf = await fetchAsArrayBuffer(pickedFile.uri);
      const bytes = await addWatermarkToPdf(buf, watermarkText, opacity);
      const outName = pickedFile.name.replace(".pdf", "") + "_watermarked.pdf";
      downloadPdf(bytes, outName);
      addFile({
        name: outName,
        size: formatBytes(bytes.length),
        pages: 1,
        date: new Date().toLocaleDateString(),
        isFavorite: false,
        color: "#6A1B9A",
      });
      setDone(true);
    } catch (e: any) {
      Alert.alert("ত্রুটি", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Watermark</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {done ? (
          <View style={styles.successBox}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#6A1B9A" />
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Watermark যোগ হয়েছে!</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => { setDone(false); setPickedFile(null); }}>
              <Text style={styles.btnText}>আবার করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity style={[styles.dropZone, { borderColor: pickedFile ? "#6A1B9A" : colors.border, backgroundColor: colors.card }]} onPress={pickFile}>
              <MaterialCommunityIcons name={pickedFile ? "file-check-outline" : "file-upload-outline"} size={40} color={pickedFile ? "#6A1B9A" : colors.mutedForeground} />
              <Text style={[styles.dropText, { color: pickedFile ? colors.foreground : colors.mutedForeground }]}>
                {pickedFile ? pickedFile.name : "PDF বেছে নিন"}
              </Text>
            </TouchableOpacity>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Watermark টেক্সট</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                value={watermarkText}
                onChangeText={setWatermarkText}
                placeholder="CONFIDENTIAL"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                স্বচ্ছতা: {Math.round(opacity * 100)}%
              </Text>
              <View style={styles.sliderRow}>
                <Text style={[styles.sliderEnd, { color: colors.mutedForeground }]}>হালকা</Text>
                <View style={styles.sliderTrack}>
                  {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].map((v) => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.sliderDot, { backgroundColor: opacity >= v ? "#6A1B9A" : colors.border }]}
                      onPress={() => setOpacity(v)}
                    />
                  ))}
                </View>
                <Text style={[styles.sliderEnd, { color: colors.mutedForeground }]}>গাঢ়</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: pickedFile && watermarkText.trim() ? "#6A1B9A" : colors.secondary }]}
              onPress={apply}
              disabled={loading || !pickedFile || !watermarkText.trim()}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="watermark" size={22} color="#fff" />
                  <Text style={styles.applyBtnText}>Watermark যোগ করুন</Text>
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
  dropZone: { borderWidth: 2, borderStyle: "dashed", borderRadius: 16, padding: 28, alignItems: "center", gap: 8 },
  dropText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  card: { borderRadius: 16, padding: 16, gap: 12 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  sliderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sliderEnd: { fontSize: 11, fontFamily: "Inter_400Regular", width: 40 },
  sliderTrack: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sliderDot: { width: 28, height: 28, borderRadius: 14 },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 16, gap: 10 },
  applyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  successBox: { alignItems: "center", gap: 16, paddingTop: 60 },
  successTitle: { fontSize: 22, fontFamily: "Inter_600SemiBold" },
  btn: { width: "100%", borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
