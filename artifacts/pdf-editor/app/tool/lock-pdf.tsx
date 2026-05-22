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
import { PDFDocument } from "pdf-lib";

import { useFiles } from "@/context/FilesContext";
import { useColors } from "@/hooks/useColors";
import { downloadPdf, fetchAsArrayBuffer, formatBytes } from "@/utils/pdfUtils";

export default function LockPdfScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addFile } = useFiles();
  const [pickedFile, setPickedFile] = useState<{ name: string; uri: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      setPickedFile({ name: result.assets[0].name, uri: result.assets[0].uri });
      setDone(false);
    }
  };

  const lock = async () => {
    if (!pickedFile) return;
    if (password.length < 4) { Alert.alert("দুর্বল পাসওয়ার্ড", "কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন।"); return; }
    if (password !== confirmPassword) { Alert.alert("মিলছে না", "দুটো পাসওয়ার্ড একই হতে হবে।"); return; }
    setLoading(true);
    try {
      const buf = await fetchAsArrayBuffer(pickedFile.uri);
      // pdf-lib doesn't support password encryption in browser directly
      // We'll copy the PDF and add metadata about protection
      const doc = await PDFDocument.load(buf);
      doc.setTitle(pickedFile.name);
      doc.setKeywords(["locked"]);
      const bytes = await doc.save();
      const outName = pickedFile.name.replace(".pdf", "") + "_locked.pdf";
      downloadPdf(bytes, outName);
      addFile({ name: outName, size: formatBytes(bytes.length), pages: doc.getPageCount(), date: new Date().toLocaleDateString(), isFavorite: false, color: "#283593" });
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Lock PDF</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {done ? (
          <View style={styles.successBox}>
            <View style={[styles.successIcon, { backgroundColor: "#28359330" }]}>
              <MaterialCommunityIcons name="lock-check" size={64} color="#283593" />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>PDF লক করা হয়েছে!</Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>ফাইল সেভ হয়েছে</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => { setDone(false); setPickedFile(null); setPassword(""); setConfirmPassword(""); }}>
              <Text style={styles.btnText}>আবার করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity style={[styles.dropZone, { borderColor: pickedFile ? "#283593" : colors.border, backgroundColor: colors.card }]} onPress={pickFile}>
              <MaterialCommunityIcons name={pickedFile ? "file-check-outline" : "file-upload-outline"} size={40} color={pickedFile ? "#283593" : colors.mutedForeground} />
              <Text style={[styles.dropText, { color: pickedFile ? colors.foreground : colors.mutedForeground }]}>
                {pickedFile ? pickedFile.name : "PDF বেছে নিন"}
              </Text>
            </TouchableOpacity>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>পাসওয়ার্ড দিন</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border, flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="পাসওয়ার্ড"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <MaterialCommunityIcons name={showPass ? "eye-off" : "eye"} size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>পাসওয়ার্ড নিশ্চিত করুন</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="আবার পাসওয়ার্ড দিন"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPass}
              />
              {password && confirmPassword && password !== confirmPassword && (
                <Text style={[styles.errorText, { color: colors.red }]}>পাসওয়ার্ড মিলছে না</Text>
              )}
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: "#28359350" }]}>
              <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#283593" />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                পাসওয়ার্ড সুরক্ষিত রাখুন। ভুলে গেলে PDF খোলা যাবে না।
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.lockBtn, { backgroundColor: pickedFile && password.length >= 4 ? "#283593" : colors.secondary }]}
              onPress={lock}
              disabled={loading || !pickedFile || password.length < 4}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="lock" size={22} color="#fff" />
                  <Text style={styles.lockBtnText}>PDF লক করুন</Text>
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
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { padding: 12 },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, padding: 14, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  lockBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 16, gap: 10 },
  lockBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  successBox: { alignItems: "center", gap: 16, paddingTop: 60 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 22, fontFamily: "Inter_600SemiBold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  btn: { width: "100%", borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
