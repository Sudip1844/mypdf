import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export type SortField = "size" | "name" | "created" | "modified";
export type SortOrder = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

interface SortBySheetProps {
  visible: boolean;
  config: SortConfig;
  onClose: () => void;
  onApply: (config: SortConfig) => void;
}

const SORT_FIELDS: { key: SortField; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: "size",     label: "File Size",     icon: "format-size" },
  { key: "name",     label: "Name",          icon: "file-outline" },
  { key: "created",  label: "Created Date",  icon: "calendar-outline" },
  { key: "modified", label: "Modified Date", icon: "pencil-box-outline" },
];

const SORT_ORDERS: { key: SortOrder; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: "asc",  label: "Ascending",  icon: "sort-ascending" },
  { key: "desc", label: "Descending", icon: "sort-descending" },
];

export function SortBySheet({ visible, config, onClose, onApply }: SortBySheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<SortConfig>(config);

  const handleOpen = () => setDraft(config);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text style={[styles.title, { color: colors.foreground }]}>Sort By</Text>

        {/* Field options */}
        {SORT_FIELDS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() => setDraft((d) => ({ ...d, field: item.key }))}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={item.icon} size={22} color={colors.mutedForeground} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
            <View
              style={[
                styles.radio,
                {
                  borderColor: draft.field === item.key ? colors.primary : colors.border,
                  backgroundColor: draft.field === item.key ? colors.primary : "transparent",
                },
              ]}
            >
              {draft.field === item.key && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Order options */}
        {SORT_ORDERS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() => setDraft((d) => ({ ...d, order: item.key }))}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={item.icon} size={22} color={colors.mutedForeground} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
            <View
              style={[
                styles.radio,
                {
                  borderColor: draft.order === item.key ? colors.primary : colors.border,
                  backgroundColor: draft.order === item.key ? colors.primary : "transparent",
                },
              ]}
            >
              {draft.order === item.key && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: colors.primary }]}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.okBtn, { backgroundColor: colors.primary }]}
            onPress={() => { onApply(draft); onClose(); }}
          >
            <Text style={styles.okText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  divider: { height: 6, marginVertical: 4 },
  buttons: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
  },
  cancelText: { fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  okBtn: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  okText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
});
