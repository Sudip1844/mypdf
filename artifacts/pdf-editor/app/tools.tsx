import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

interface Tool {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  bg: string;
  route?: string;
}

const CONVERT_TOOLS: Tool[] = [
  { id: "1",  icon: "file-image-outline",         label: "Image to PDF",  bg: "#E53935", route: "/tool/image-to-pdf" },
  { id: "2",  icon: "file-word-outline",           label: "Docx to PDF",   bg: "#1565C0" },
  { id: "3",  icon: "file-powerpoint-outline",     label: "PPT to PDF",    bg: "#E65100" },
  { id: "4",  icon: "file-jpg-box",                label: "PDF to JPG",    bg: "#C62828" },
  { id: "5",  icon: "file-word-outline",           label: "PDF to Word",   bg: "#0D47A1" },
  { id: "6",  icon: "file-powerpoint-outline",     label: "PDF to PPT",    bg: "#BF360C" },
];

const POPULAR_TOOLS: Tool[] = [
  { id: "7",  icon: "line-scan",                   label: "Smart Scan",   bg: "#1565C0", route: "/tool/image-to-pdf" },
  { id: "8",  icon: "card-account-details-outline",label: "Scan ID Card", bg: "#00796B", route: "/tool/image-to-pdf" },
  { id: "9",  icon: "folder-open-outline",         label: "Import PDF",   bg: "#E65100", route: "/tool/pdf-reader"   },
  { id: "10", icon: "printer-outline",             label: "Print PDF",    bg: "#0D47A1"                              },
];

const EDIT_TOOLS: Tool[] = [
  { id: "11", icon: "call-merge",                  label: "Merge PDF",  bg: "#E65100", route: "/tool/merge-pdf"  },
  { id: "12", icon: "archive-arrow-down-outline",  label: "Compress",   bg: "#E53935", route: "/tool/compress"   },
  { id: "13", icon: "pencil-outline",              label: "Doodle",     bg: "#6A1B9A"                            },
  { id: "14", icon: "format-text",                 label: "Add Text",   bg: "#00796B", route: "/tool/add-text"   },
  { id: "15", icon: "draw-pen",                    label: "Signature",  bg: "#4A148C"                            },
  { id: "16", icon: "lock-outline",                label: "Lock PDF",   bg: "#1A237E", route: "/tool/lock-pdf"   },
  { id: "17", icon: "lock-open-outline",           label: "Unlock PDF", bg: "#283593", route: "/tool/lock-pdf"   },
  { id: "18", icon: "watermark",                   label: "Watermark",  bg: "#6A1B9A", route: "/tool/watermark"  },
  { id: "19", icon: "scissors-cutting",            label: "Split PDF",  bg: "#00695C", route: "/tool/split-pdf"  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      activeOpacity={0.75}
      onPress={() => tool.route ? router.push(tool.route as any) : undefined}
    >
      <View style={[styles.iconWrap, { backgroundColor: tool.bg + "25" }]}>
        <MaterialCommunityIcons name={tool.icon} size={38} color={tool.bg} />
      </View>
      <Text style={[styles.cardLabel, { color: colors.foreground }]} numberOfLines={2}>
        {tool.label}
      </Text>
      {tool.route && <View style={[styles.activeDot, { backgroundColor: tool.bg }]} />}
    </TouchableOpacity>
  );
}

function ToolSection({ title, tools }: { title: string; tools: Tool[] }) {
  const rows: Tool[][] = [];
  for (let i = 0; i < tools.length; i += 3) rows.push(tools.slice(i, i + 3));

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionGrid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
            {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, i) => (
              <View key={`ph-${i}`} style={styles.cardPlaceholder} />
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
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, {
        backgroundColor: colors.background,
        paddingTop: insets.top + 12,
        borderBottomColor: colors.border,
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.tools}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Feature request banner */}
        <TouchableOpacity style={[styles.featureBanner, { backgroundColor: colors.card }]} activeOpacity={0.8}>
          <View style={[styles.featureIcon, { backgroundColor: "#1565C025" }]}>
            <MaterialCommunityIcons name="message-plus-outline" size={26} color="#1565C0" />
          </View>
          <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: colors.foreground }]}>{t.requestFeature}</Text>
            <Text style={[styles.featureSub, { color: colors.mutedForeground }]}>{t.requestFeatureSub}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        <ToolSection title={t.convert} tools={CONVERT_TOOLS} />
        <ToolSection title={t.popular} tools={POPULAR_TOOLS} />
        <ToolSection title={t.edit} tools={EDIT_TOOLS} />
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
  headerTitle: { flex: 1, fontSize: 22, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 14, gap: 24, paddingBottom: 60 },

  featureBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  featureIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  featureText: { flex: 1, gap: 3 },
  featureTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  featureSub: { fontSize: 12, fontFamily: "Inter_400Regular" },

  section: { gap: 12 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", color: "#fff" },
  sectionGrid: { gap: 10 },
  row: { flexDirection: "row", gap: 10 },

  card: {
    flex: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 8,
    gap: 10,
    minHeight: 120,
    position: "relative",
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 17,
  },
  cardPlaceholder: { flex: 1 },
  activeDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
