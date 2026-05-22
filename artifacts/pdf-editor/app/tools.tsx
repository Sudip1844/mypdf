import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface Tool {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  iconColor: string;
  bg: string;
  route?: string;
}

const CONVERT_TOOLS: Tool[] = [
  { id: "1", icon: "file-image-outline",         label: "Image to PDF",  iconColor: "#fff", bg: "#E53935", route: "/tool/image-to-pdf" },
  { id: "2", icon: "file-word-outline",           label: "Docx to PDF",   iconColor: "#fff", bg: "#1565C0" },
  { id: "3", icon: "file-powerpoint-outline",     label: "PPT to PDF",    iconColor: "#fff", bg: "#F57C00" },
  { id: "4", icon: "file-jpg-box",                label: "PDF to JPG",    iconColor: "#fff", bg: "#E53935" },
  { id: "5", icon: "file-word-box-outline",       label: "PDF to Word",   iconColor: "#fff", bg: "#1565C0" },
  { id: "6", icon: "file-powerpoint-box-outline", label: "PDF to PPT",    iconColor: "#fff", bg: "#F57C00" },
];

const POPULAR_TOOLS: Tool[] = [
  { id: "7",  icon: "scan-helper",                   label: "Smart Scan",  iconColor: "#fff", bg: "#1565C0", route: "/tool/image-to-pdf" },
  { id: "8",  icon: "card-account-details-outline",  label: "Scan ID Card",iconColor: "#fff", bg: "#00796B", route: "/tool/image-to-pdf" },
  { id: "9",  icon: "folder-outline",                label: "Import PDF",  iconColor: "#fff", bg: "#F57C00", route: "/tool/pdf-reader" },
  { id: "10", icon: "printer-outline",               label: "Print PDF",   iconColor: "#fff", bg: "#1565C0" },
];

const EDIT_TOOLS: Tool[] = [
  { id: "11", icon: "call-merge",               label: "Merge PDF",   iconColor: "#fff", bg: "#F57C00", route: "/tool/merge-pdf"   },
  { id: "12", icon: "archive-arrow-down-outline",label: "Compress",    iconColor: "#fff", bg: "#E53935", route: "/tool/compress"    },
  { id: "13", icon: "pencil-outline",           label: "Doodle",      iconColor: "#fff", bg: "#6A1B9A" },
  { id: "14", icon: "format-text",              label: "Add Text",    iconColor: "#fff", bg: "#00796B", route: "/tool/add-text"    },
  { id: "15", icon: "draw-pen",                 label: "Signature",   iconColor: "#fff", bg: "#6A1B9A" },
  { id: "16", icon: "lock-outline",             label: "Lock PDF",    iconColor: "#fff", bg: "#283593", route: "/tool/lock-pdf"    },
  { id: "17", icon: "lock-open-outline",        label: "Unlock PDF",  iconColor: "#fff", bg: "#283593", route: "/tool/lock-pdf"    },
  { id: "18", icon: "watermark",                label: "Watermark",   iconColor: "#fff", bg: "#6A1B9A", route: "/tool/watermark"   },
  { id: "19", icon: "scissors-cutting",         label: "Split PDF",   iconColor: "#fff", bg: "#00796B", route: "/tool/split-pdf"   },
];

function ToolSection({ title, tools }: { title: string; tools: Tool[] }) {
  const colors = useColors();
  const rows: Tool[][] = [];
  for (let i = 0; i < tools.length; i += 3) rows.push(tools.slice(i, i + 3));

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={styles.sectionCards}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.card, { backgroundColor: colors.card }]}
                activeOpacity={0.75}
                onPress={() => tool.route ? router.push(tool.route as any) : undefined}
              >
                <View style={[styles.iconWrap, { backgroundColor: tool.bg + "33" }]}>
                  <MaterialCommunityIcons name={tool.icon} size={32} color={tool.bg} />
                </View>
                <Text style={[styles.cardLabel, { color: colors.foreground }]}>{tool.label}</Text>
                {tool.route && (
                  <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            ))}
            {row.length < 3 &&
              Array.from({ length: 3 - row.length }).map((_, i) => (
                <View key={`e-${i}`} style={styles.cardPlaceholder} />
              ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ToolsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Tools</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.featureRequest, { backgroundColor: colors.card }]}
          activeOpacity={0.8}
          onPress={() => router.push("/tool/image-to-pdf" as any)}
        >
          <View style={[styles.featureIcon, { backgroundColor: "#1565C033" }]}>
            <MaterialCommunityIcons name="message-plus-outline" size={24} color="#1565C0" />
          </View>
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: colors.foreground }]}>Request a new feature</Text>
            <Text style={[styles.featureSub, { color: colors.mutedForeground }]}>What other features do you want?</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        <View style={[styles.hint, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.primary} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            রঙিন ডট মানে টুলটি সক্রিয় — ট্যাপ করুন!
          </Text>
        </View>

        <ToolSection title="Convert" tools={CONVERT_TOOLS} />
        <ToolSection title="Popular" tools={POPULAR_TOOLS} />
        <ToolSection title="Edit" tools={EDIT_TOOLS} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16, gap: 20, paddingBottom: 60 },
  featureRequest: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 16, gap: 14 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureText: { flex: 1, gap: 2 },
  featureTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  featureSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  hint: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, padding: 12 },
  hintText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  sectionCards: { gap: 10 },
  row: { flexDirection: "row", gap: 10 },
  card: { flex: 1, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingVertical: 18, paddingHorizontal: 8, gap: 10, minHeight: 110, position: "relative" },
  iconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  cardPlaceholder: { flex: 1 },
  activeDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
});
