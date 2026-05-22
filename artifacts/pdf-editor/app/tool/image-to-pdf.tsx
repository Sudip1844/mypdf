import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
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
import { downloadPdf, formatBytes, imagesToPdf } from "@/utils/pdfUtils";

const PAGE_SIZES = [
  { label: "A4", width: 595, height: 842 },
  { label: "Letter", width: 612, height: 792 },
  { label: "Image Size", width: 0, height: 0 },
];

export default function ImageToPdfScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addFile } = useFiles();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfName, setPdfName] = useState("My_Document");
  const [pageSize, setPageSize] = useState(0);
  const [done, setDone] = useState(false);
  const [resultSize, setResultSize] = useState("");

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const convert = async () => {
    if (images.length === 0) {
      Alert.alert("কোনো ছবি নেই", "অন্তত একটি ছবি বেছে নিন।");
      return;
    }
    setLoading(true);
    try {
      const bytes = await imagesToPdf(images);
      const size = formatBytes(bytes.length);
      setResultSize(size);
      const filename = pdfName.trim() + ".pdf";
      downloadPdf(bytes, filename);
      addFile({
        name: filename,
        size,
        pages: images.length,
        date: new Date().toLocaleDateString("en-GB", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", ""),
        isFavorite: false,
        color: "#E53935",
      });
      setDone(true);
    } catch (e: any) {
      Alert.alert("ত্রুটি", "PDF তৈরি করতে সমস্যা হয়েছে: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Image to PDF
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {done ? (
          <View style={styles.successBox}>
            <View style={[styles.successIcon, { backgroundColor: "#00796B30" }]}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#00796B" />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>
              PDF তৈরি সম্পন্ন!
            </Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
              {pdfName}.pdf · {resultSize} · {images.length} পেজ
            </Text>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={() => { setDone(false); setImages([]); setPdfName("My_Document"); }}
            >
              <Text style={styles.btnText}>আরেকটি PDF তৈরি করুন</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.card }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.btnText, { color: colors.foreground }]}>ফিরে যান</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>PDF-এর নাম</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                value={pdfName}
                onChangeText={setPdfName}
                placeholder="ফাইলের নাম লিখুন"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>পেজ সাইজ</Text>
              <View style={styles.pageSizeRow}>
                {PAGE_SIZES.map((ps, i) => (
                  <TouchableOpacity
                    key={ps.label}
                    style={[
                      styles.pageSizeBtn,
                      {
                        backgroundColor:
                          pageSize === i ? colors.primary : colors.secondary,
                      },
                    ]}
                    onPress={() => setPageSize(i)}
                  >
                    <Text
                      style={[
                        styles.pageSizeText,
                        { color: pageSize === i ? "#fff" : colors.mutedForeground },
                      ]}
                    >
                      {ps.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.imagesHeader}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  ছবি ({images.length} টি)
                </Text>
                <TouchableOpacity
                  style={[styles.addImgBtn, { backgroundColor: colors.primary }]}
                  onPress={pickImages}
                >
                  <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                  <Text style={styles.addImgText}>ছবি যোগ করুন</Text>
                </TouchableOpacity>
              </View>

              {images.length === 0 ? (
                <TouchableOpacity
                  style={[styles.dropZone, { borderColor: colors.border }]}
                  onPress={pickImages}
                >
                  <MaterialCommunityIcons
                    name="image-plus"
                    size={48}
                    color={colors.mutedForeground}
                  />
                  <Text style={[styles.dropText, { color: colors.mutedForeground }]}>
                    Gallery থেকে ছবি বেছে নিন
                  </Text>
                  <Text style={[styles.dropSub, { color: colors.mutedForeground }]}>
                    JPG, PNG সাপোর্টেড
                  </Text>
                </TouchableOpacity>
              ) : (
                <FlatList
                  data={images}
                  keyExtractor={(_, i) => i.toString()}
                  numColumns={3}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => (
                    <View style={styles.imgThumbWrap}>
                      <Image source={{ uri: item }} style={styles.imgThumb} />
                      <TouchableOpacity
                        style={styles.removeImg}
                        onPress={() => removeImage(index)}
                      >
                        <MaterialCommunityIcons name="close-circle" size={20} color="#E53935" />
                      </TouchableOpacity>
                      <View style={[styles.imgNum, { backgroundColor: colors.primary }]}>
                        <Text style={styles.imgNumText}>{index + 1}</Text>
                      </View>
                    </View>
                  )}
                  contentContainerStyle={styles.imgGrid}
                />
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.convertBtn,
                {
                  backgroundColor:
                    images.length > 0 ? colors.primary : colors.secondary,
                },
              ]}
              onPress={convert}
              disabled={loading || images.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="file-pdf-box" size={22} color="#fff" />
                  <Text style={styles.convertBtnText}>PDF তৈরি করুন</Text>
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
  input: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  pageSizeRow: { flexDirection: "row", gap: 10 },
  pageSizeBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  pageSizeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  imagesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  addImgBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addImgText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  dropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  dropText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  dropSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  imgGrid: { gap: 6 },
  imgThumbWrap: { flex: 1, margin: 3, position: "relative", aspectRatio: 1 },
  imgThumb: { width: "100%", height: "100%", borderRadius: 10 },
  removeImg: { position: "absolute", top: -6, right: -6 },
  imgNum: {
    position: "absolute",
    bottom: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  imgNumText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  convertBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
  },
  convertBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  successBox: { alignItems: "center", gap: 16, paddingTop: 40 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 22, fontFamily: "Inter_600SemiBold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  btn: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
