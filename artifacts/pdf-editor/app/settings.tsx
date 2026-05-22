import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

function SettingRow({
  icon,
  label,
  value,
  toggle,
  toggleValue,
  onToggle,
  onPress,
  isLast,
}: SettingRowProps) {
  const colors = useColors();
  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={toggle ? 1 : 0.7}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.mutedForeground}
          style={{ width: 24 }}
        />
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        {value && (
          <View style={styles.valueRow}>
            <Text style={[styles.valueText, { color: colors.primary }]}>
              {value}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={16}
              color={colors.primary}
            />
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
        {!value && !toggle && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={colors.mutedForeground}
          />
        )}
      </TouchableOpacity>
      {!isLast && (
        <View
          style={[styles.divider, { backgroundColor: colors.border }]}
        />
      )}
    </>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [securityQ, setSecurityQ] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

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
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.foreground}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Settings
        </Text>
        <TouchableOpacity style={styles.likeBtn}>
          <MaterialCommunityIcons
            name="thumb-up-outline"
            size={22}
            color={colors.foreground}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow
            icon="share-variant-outline"
            label="Share App"
            onPress={() => {}}
            isLast
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow icon="cancel" label="Remove Ads" onPress={() => {}} />
          <SettingRow
            icon="crop-free"
            label="Scan Settings"
            onPress={() => {}}
          />
          <SettingRow
            icon="shield-check-outline"
            label="Security Question"
            toggle
            toggleValue={securityQ}
            onToggle={setSecurityQ}
          />
          <SettingRow
            icon="web"
            label="Language Options"
            value="Default"
            onPress={() => {}}
          />
          <SettingRow
            icon="weather-night"
            label="Dark Mode"
            toggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
            isLast
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow
            icon="chat-outline"
            label="Feedback"
            onPress={() => {}}
          />
          <SettingRow
            icon="send-outline"
            label="Request a new feature"
            onPress={() => {}}
          />
          <SettingRow
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <SettingRow
            icon="information-outline"
            label="Version"
            value="1.0.0"
            isLast
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  likeBtn: {
    padding: 4,
  },
  scroll: {
    padding: 16,
    gap: 16,
    paddingBottom: 60,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  valueText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
});
