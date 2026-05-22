import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

interface FabActionSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function FabActionSheet({ visible, onClose }: FabActionSheetProps) {
  const colors = useColors();
  const { t } = useLanguage();

  const ACTIONS = [
    {
      id: "images",
      icon: "image-multiple-outline" as const,
      label: t.imagesToPdf,
      subtitle: t.imagesToPdfSub,
      color: "#E53935",
    },
    {
      id: "import",
      icon: "file-pdf-box" as const,
      label: t.importPdf,
      subtitle: t.importPdfSub,
      color: "#F57C00",
    },
    {
      id: "merge",
      icon: "call-merge" as const,
      label: t.mergePdfs,
      subtitle: t.mergePdfsSub,
      color: "#1565C0",
    },
    {
      id: "scan",
      icon: "camera-outline" as const,
      label: t.scanDocument,
      subtitle: t.scanDocumentSub,
      color: "#00796B",
    },
  ];

  const handleAction = (id: string) => {
    onClose();
    if (id === "images") router.push("/tool/image-to-pdf");
    else if (id === "import") router.push("/tool/pdf-reader");
    else if (id === "merge") router.push("/tool/merge-pdf");
    else if (id === "scan") router.push("/tool/image-to-pdf");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text style={[styles.title, { color: colors.foreground }]}>{t.createNew}</Text>
        {ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.row, { backgroundColor: colors.secondary }]}
            onPress={() => handleAction(action.id)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: action.color + "30" }]}>
              <MaterialCommunityIcons name={action.icon} size={28} color={action.color} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>{action.label}</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{action.subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.cancelBtn, { backgroundColor: colors.secondary }]}
          onPress={onClose}
        >
          <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>{t.cancel}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, gap: 12 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 8 },
  title: { fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 14, gap: 14 },
  iconWrap: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cancelBtn: { borderRadius: 16, padding: 14, alignItems: "center", marginTop: 4 },
  cancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
