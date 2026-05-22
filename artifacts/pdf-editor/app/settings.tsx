import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LANGUAGES, useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

interface SettingRowProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
}

function SettingRow({ icon, label, value, toggle, toggleValue, onToggle, onPress, isLast }: SettingRowProps) {
  const colors = useColors();
  return (
    <>
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={toggle ? 1 : 0.7}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.mutedForeground} style={{ width: 24 }} />
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        {value !== undefined && (
          <View style={styles.valueRow}>
            <Text style={[styles.valueText, { color: colors.primary }]}>{value}</Text>
            <MaterialCommunityIcons name="chevron-down" size={16} color={colors.primary} />
          </View>
        )}
        {toggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: "#374151", true: colors.primary }}
            thumbColor="#fff"
            ios_backgroundColor="#374151"
          />
        )}
        {value === undefined && !toggle && (
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.mutedForeground} />
        )}
      </TouchableOpacity>
      {!isLast && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
    </>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, lang, setLang } = useLanguage();
  const [securityQ, setSecurityQ] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === lang);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.settings}</Text>
        <TouchableOpacity style={styles.likeBtn}>
          <MaterialCommunityIcons name="thumb-up-outline" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow icon="share-variant-outline" label={t.shareApp} onPress={() => {}} isLast />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow icon="cancel" label={t.removeAds} onPress={() => {}} />
          <SettingRow icon="crop-free" label={t.scanSettings} onPress={() => {}} />
          <SettingRow
            icon="shield-check-outline"
            label={t.securityQuestion}
            toggle
            toggleValue={securityQ}
            onToggle={setSecurityQ}
          />
          <SettingRow
            icon="web"
            label={t.language}
            value={`${currentLang?.flag} ${currentLang?.nativeLabel}`}
            onPress={() => setLangModalVisible(true)}
          />
          <SettingRow
            icon="weather-night"
            label={t.darkMode}
            toggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
            isLast
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow icon="chat-outline" label={t.feedback} onPress={() => {}} />
          <SettingRow icon="send-outline" label={t.requestNewFeature} onPress={() => {}} />
          <SettingRow icon="shield-outline" label={t.privacyPolicy} onPress={() => {}} />
          <SettingRow icon="information-outline" label={t.version} value="1.0.0" isLast />
        </View>
      </ScrollView>

      {/* Language picker modal */}
      <Modal visible={langModalVisible} transparent animationType="slide" onRequestClose={() => setLangModalVisible(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setLangModalVisible(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{t.language}</Text>

          {LANGUAGES.map((language) => {
            const isSelected = language.code === lang;
            return (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.langRow,
                  { backgroundColor: isSelected ? colors.primary + "20" : colors.secondary },
                  isSelected && { borderWidth: 1, borderColor: colors.primary },
                ]}
                onPress={() => {
                  setLang(language.code);
                  setLangModalVisible(false);
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.langFlag}>{language.flag}</Text>
                <View style={styles.langText}>
                  <Text style={[styles.langLabel, { color: colors.foreground }]}>{language.label}</Text>
                  <Text style={[styles.langNative, { color: colors.mutedForeground }]}>{language.nativeLabel}</Text>
                </View>
                {isSelected && (
                  <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: colors.secondary }]}
            onPress={() => setLangModalVisible(false)}
          >
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>{t.cancel}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontFamily: "Inter_600SemiBold" },
  likeBtn: { padding: 4 },
  scroll: { padding: 16, gap: 16, paddingBottom: 60 },
  card: { borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  valueText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
  // Modal
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 44, gap: 10 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 8 },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  langFlag: { fontSize: 28 },
  langText: { flex: 1, gap: 2 },
  langLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  langNative: { fontSize: 13, fontFamily: "Inter_400Regular" },
  cancelBtn: { borderRadius: 14, padding: 14, alignItems: "center", marginTop: 4 },
  cancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
