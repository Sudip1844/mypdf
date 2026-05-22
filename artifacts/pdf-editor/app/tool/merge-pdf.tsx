import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFiles } from "@/context/FilesContext";
import { useColors } from "@/hooks/useColors";
import { downloadPdf, fetchAsArrayBuffer, formatBytes, mergePdfs } from "@/utils/pdfUtils";

interface PickedPdf {
  name: string;
  uri: string;
  size: number;
}

export default function MergePdfScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addFile } = useFiles();
  const [pdfs, setPdfs] = useState<PickedPdf[]>([]);
  const [loading, setLoading] = useState(false);
  const [outputName, setOutputName] = useState("Merged_Document");
  const [done, setDone] = useState(false);
  const [resultSize, setResultSize] = useState("");

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        const newPdfs = result.assets.map((a) => ({
          name: a.name,
          uri: a.uri,
          size: a.size ?? 0,
        }));
        setPdfs((prev) => [...prev, ...newPdfs]);
      }
    } catch (e) {
      Alert.alert("ত্রুটি", "ফাইল বেছে নিতে সমস্যা হয়েছে।");
    }
  };

  const removePdf = (idx: number) => {
    setPdfs((prev) => prev.filter((_, i) => i !== idx));
  };

  const merge = async () => {
    if (pdfs.length < 2) {
      Alert.alert("কম ফাইল", "মার্জ করতে কমপক্ষে ২টি PDF দরকার।");
      return;
    }
    setLoading(true);
    try {
      const buffers = await Promise.all(pdfs.map((p) => fetchAsArrayBuffer(p.uri)));
      const bytes = await mergePdfs(buffers);
      const size = formatBytes(bytes.length);
      setResultSize(size);
      downloadPdf(bytes, outputName + ".pdf");
      addFile({
        name: outputName + ".pdf",
        size,
        pages: pdfs.length * 3,
        date: new Date().toLocaleDateString(),
        isFavorite: false,
        color: "#F57C00",
      });
      setDone(true);
    } catch (e: any) {
      Alert.alert("ত্রুটি", "Merge করতে সমস্যা হয়েছে: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.background, paddingTop: insets.top + 12, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Merge PDF</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {done ? (
          <View style={styles.successBox}>
            <View style={[styles.successIcon, { backgroundColor: "#F57C0030" }]}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#F57C00" />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Merge সম্পন্ন!</Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
              {outputName}.pdf · {resultSize}
            </Text>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={() => { setDone(false); setPdfs([]); setOutputName("Merged_Document"); }}
            >
              <Text style={styles.btnText}>আবার করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>আউটপুট ফাইলের নাম</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                value={outputName}
                onChangeText={setOutputName}
                placeholder="ফাইলের নাম"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.rowHeader}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  PDF ফাইলসমূহ ({pdfs.length} টি)
                </Text>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: colors.primary }]}
                  onPress={pickPdf}
                >
                  <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                  <Text style={styles.addBtnText}>PDF যোগ করুন</Text>
                </TouchableOpacity>
              </View>

              {pdfs.length === 0 ? (
                <TouchableOpacity
                  style={[styles.dropZone, { borderColor: colors.border }]}
                  onPress={pickPdf}
                >
                  <MaterialCommunityIcons name="file-pdf-box" size={48} color={colors.mutedForeground} />
                  <Text style={[styles.dropText, { color: colors.mutedForeground }]}>
                    PDF ফাইল বেছে নিন
                  </Text>
                </TouchableOpacity>
              ) : (
                pdfs.map((pdf, i) => (
                  <View
                    key={i}
                    style={[styles.pdfRow, { backgroundColor: colors.secondary }]}
                  >
                    <View style={[styles.pdfIcon, { backgroundColor: "#E5393530" }]}>
                      <MaterialCommunityIcons name="file-pdf-box" size={28} color="#E53935" />
                    </View>
                    <View style={styles.pdfInfo}>
                      <Text style={[styles.pdfName, { color: colors.foreground }]} numberOfLines={1}>
                        {pdf.name}
                      </Text>
                      <Text style={[styles.pdfSize, { color: colors.mutedForeground }]}>
                        {formatBytes(pdf.size)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removePdf(i)}>
                      <MaterialCommunityIcons name="close" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {pdfs.length >= 2 && (
              <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                  {pdfs.length}টি PDF মার্জ হবে উপরের ক্রম অনুযায়ী
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.mergeBtn, { backgroundColor: pdfs.length >= 2 ? "#F57C00" : colors.secondary }]}
              onPress={merge}
              disabled={loading || pdfs.length < 2}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="call-merge" size={22} color="#fff" />
                  <Text style={styles.mergeBtnText}>Merge করুন</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16, gap: 16, paddingBottom: 60 },
  card: { borderRadius: 16, padding: 16, gap: 12 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  rowHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  dropZone: { borderWidth: 2, borderStyle: "dashed", borderRadius: 16, padding: 32, alignItems: "center", gap: 8 },
  dropText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  pdfRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, gap: 12 },
  pdfIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pdfInfo: { flex: 1, gap: 2 },
  pdfName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  pdfSize: { fontSize: 12, fontFamily: "Inter_400Regular" },
  infoBox: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, padding: 12, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  mergeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 16, gap: 10 },
  mergeBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  successBox: { alignItems: "center", gap: 16, paddingTop: 40 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 22, fontFamily: "Inter_600SemiBold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  btn: { width: "100%", borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
