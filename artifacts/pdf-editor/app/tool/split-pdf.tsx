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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { downloadPdf, fetchAsArrayBuffer, formatBytes, splitPdf } from "@/utils/pdfUtils";
import { PDFDocument } from "pdf-lib";

export default function SplitPdfScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [pickedFile, setPickedFile] = useState<{ name: string; uri: string; size: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [splitAt, setSplitAt] = useState("1");
  const [partsCount, setPartsCount] = useState(0);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      const f = result.assets[0];
      setPickedFile({ name: f.name, uri: f.uri, size: f.size ?? 0 });
      setDone(false);
      // Get page count
      try {
        const buf = await fetchAsArrayBuffer(f.uri);
        const doc = await PDFDocument.load(buf);
        setTotalPages(doc.getPageCount());
      } catch { setTotalPages(0); }
    }
  };

  const split = async () => {
    if (!pickedFile) return;
    const pages = splitAt.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (pages.length === 0) { Alert.alert("ত্রুটি", "সঠিক পেজ নম্বর দিন।"); return; }
    setLoading(true);
    try {
      const buf = await fetchAsArrayBuffer(pickedFile.uri);
      const doc = await PDFDocument.load(buf);
      const total = doc.getPageCount();
      // Build ranges
      const breakpoints = [0, ...pages.filter(p => p < total), total];
      const ranges = [];
      for (let i = 0; i < breakpoints.length - 1; i++) {
        const start = breakpoints[i];
        const end = breakpoints[i + 1];
        if (start < end) {
          ranges.push(Array.from({ length: end - start }, (_, k) => start + k));
        }
      }
      const parts = await splitPdf(buf, ranges);
      parts.forEach((p, i) => {
        downloadPdf(p, pickedFile.name.replace(".pdf", "") + `_part${i + 1}.pdf`);
      });
      setPartsCount(parts.length);
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Split PDF</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {done ? (
          <View style={styles.successBox}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#00796B" />
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Split সম্পন্ন!</Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
              {partsCount}টি ফাইল তৈরি হয়েছে
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => { setDone(false); setPickedFile(null); setSplitAt("1"); }}>
              <Text style={styles.btnText}>আবার করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity style={[styles.dropZone, { borderColor: pickedFile ? colors.primary : colors.border, backgroundColor: colors.card }]} onPress={pickFile}>
              <MaterialCommunityIcons name={pickedFile ? "file-check-outline" : "file-upload-outline"} size={40} color={pickedFile ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.dropText, { color: pickedFile ? colors.foreground : colors.mutedForeground }]}>
                {pickedFile ? pickedFile.name : "PDF বেছে নিন"}
              </Text>
              {totalPages > 0 && (
                <Text style={[styles.dropSub, { color: colors.mutedForeground }]}>মোট {totalPages} পেজ</Text>
              )}
            </TouchableOpacity>

            {pickedFile && (
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  কোন পেজের পরে ভাগ করবেন? (কমা দিয়ে আলাদা করুন)
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                  value={splitAt}
                  onChangeText={setSplitAt}
                  placeholder="যেমন: 3, 6, 9"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numbers-and-punctuation"
                />
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  উদাহরণ: "3" মানে পেজ 1-3 এবং বাকি পেজ আলাদা হবে
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.splitBtn, { backgroundColor: pickedFile ? colors.primary : colors.secondary }]}
              onPress={split}
              disabled={loading || !pickedFile}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="scissors-cutting" size={22} color="#fff" />
                  <Text style={styles.splitBtnText}>Split করুন</Text>
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
  dropSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 16, padding: 16, gap: 12 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  splitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 16, gap: 10 },
  splitBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  successBox: { alignItems: "center", gap: 16, paddingTop: 60 },
  successTitle: { fontSize: 22, fontFamily: "Inter_600SemiBold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  btn: { width: "100%", borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
