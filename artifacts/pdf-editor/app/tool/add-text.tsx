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

import { useFiles } from "@/context/FilesContext";
import { useColors } from "@/hooks/useColors";
import { addTextToPdf, downloadPdf, fetchAsArrayBuffer, formatBytes } from "@/utils/pdfUtils";

const TEXT_COLORS = [
  { label: "কালো", color: [0, 0, 0] as [number, number, number], hex: "#000000" },
  { label: "লাল", color: [0.9, 0.1, 0.1] as [number, number, number], hex: "#E53935" },
  { label: "নীল", color: [0.1, 0.2, 0.8] as [number, number, number], hex: "#1565C0" },
  { label: "সবুজ", color: [0.1, 0.5, 0.1] as [number, number, number], hex: "#2E7D32" },
];

export default function AddTextScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addFile } = useFiles();
  const [pickedFile, setPickedFile] = useState<{ name: string; uri: string } | null>(null);
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState("16");
  const [posX, setPosX] = useState("72");
  const [posY, setPosY] = useState("720");
  const [pageNum, setPageNum] = useState("1");
  const [selectedColor, setSelectedColor] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      setPickedFile({ name: result.assets[0].name, uri: result.assets[0].uri });
      setDone(false);
    }
  };

  const apply = async () => {
    if (!pickedFile || !text.trim()) { Alert.alert("", "PDF এবং টেক্সট দুটোই দিন।"); return; }
    setLoading(true);
    try {
      const buf = await fetchAsArrayBuffer(pickedFile.uri);
      const bytes = await addTextToPdf(
        buf,
        text,
        parseInt(pageNum) - 1 || 0,
        parseFloat(posX) || 72,
        parseFloat(posY) || 720,
        parseInt(fontSize) || 16,
        TEXT_COLORS[selectedColor].color
      );
      const outName = pickedFile.name.replace(".pdf", "") + "_edited.pdf";
      downloadPdf(bytes, outName);
      addFile({ name: outName, size: formatBytes(bytes.length), pages: 1, date: new Date().toLocaleDateString(), isFavorite: false, color: "#00796B" });
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Add Text</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {done ? (
          <View style={styles.successBox}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#00796B" />
            <Text style={[styles.successTitle, { color: colors.foreground }]}>টেক্সট যোগ হয়েছে!</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => { setDone(false); setPickedFile(null); setText(""); }}>
              <Text style={styles.btnText}>আবার করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity style={[styles.dropZone, { borderColor: pickedFile ? "#00796B" : colors.border, backgroundColor: colors.card }]} onPress={pickFile}>
              <MaterialCommunityIcons name={pickedFile ? "file-check-outline" : "file-upload-outline"} size={40} color={pickedFile ? "#00796B" : colors.mutedForeground} />
              <Text style={[styles.dropText, { color: pickedFile ? colors.foreground : colors.mutedForeground }]}>
                {pickedFile ? pickedFile.name : "PDF বেছে নিন"}
              </Text>
            </TouchableOpacity>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>টেক্সট লিখুন</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                value={text}
                onChangeText={setText}
                placeholder="এখানে লিখুন..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>রঙ বেছে নিন</Text>
              <View style={styles.colorRow}>
                {TEXT_COLORS.map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.colorDot, { backgroundColor: c.hex, borderWidth: selectedColor === i ? 3 : 0, borderColor: "#fff" }]}
                    onPress={() => setSelectedColor(i)}
                  />
                ))}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>পজিশন সেটিংস</Text>
              <View style={styles.posRow}>
                {[
                  { label: "পেজ নং", val: pageNum, set: setPageNum },
                  { label: "X পজিশন", val: posX, set: setPosX },
                  { label: "Y পজিশন", val: posY, set: setPosY },
                  { label: "ফন্ট সাইজ", val: fontSize, set: setFontSize },
                ].map((item) => (
                  <View key={item.label} style={styles.posItem}>
                    <Text style={[styles.posLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                    <TextInput
                      style={[styles.posInput, { backgroundColor: colors.secondary, color: colors.foreground }]}
                      value={item.val}
                      onChangeText={item.set}
                      keyboardType="numeric"
                    />
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: pickedFile && text.trim() ? "#00796B" : colors.secondary }]}
              onPress={apply}
              disabled={loading || !pickedFile || !text.trim()}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="format-text" size={22} color="#fff" />
                  <Text style={styles.applyBtnText}>টেক্সট যোগ করুন</Text>
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
  textArea: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15, fontFamily: "Inter_400Regular", minHeight: 100, textAlignVertical: "top" },
  colorRow: { flexDirection: "row", gap: 12 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  posRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  posItem: { width: "47%", gap: 4 },
  posLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  posInput: { borderRadius: 8, padding: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 16, gap: 10 },
  applyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  successBox: { alignItems: "center", gap: 16, paddingTop: 60 },
  successTitle: { fontSize: 22, fontFamily: "Inter_600SemiBold" },
  btn: { width: "100%", borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
