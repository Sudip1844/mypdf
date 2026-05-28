import { Feather } from "@expo/vector-icons";
import { reloadAppAsync } from "expo";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ErrorFallback is intentionally self-contained with NO context dependencies.
// If it relied on ThemeContext/FilesContext/etc. it would crash again when
// those providers fail, making the error unrecoverable.
const DARK = {
  background: "#12141f",
  card: "#1e2030",
  foreground: "#FFFFFF",
  muted: "#8890a4",
  primary: "#5B5FEF",
  border: "#2a2d3e",
};
const LIGHT = {
  background: "#f5f5f5",
  card: "#ffffff",
  foreground: "#0a0a0a",
  muted: "#737373",
  primary: "#5B5FEF",
  border: "#e5e5e5",
};

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const scheme = useColorScheme();
  const c = scheme === "dark" ? DARK : LIGHT;
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch {
      resetError();
    }
  };

  const monoFont = Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  });

  const errorText = `Error: ${error?.message ?? "Unknown error"}\n\n${error?.stack ?? ""}`;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {__DEV__ && (
        <Pressable
          onPress={() => setIsModalVisible(true)}
          style={({ pressed }) => [
            styles.topButton,
            { top: insets.top + 16, backgroundColor: c.card, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="alert-circle" size={20} color={c.foreground} />
        </Pressable>
      )}

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: c.card }]}>
          <Feather name="alert-triangle" size={36} color="#EF4444" />
        </View>

        <Text style={[styles.title, { color: c.foreground }]}>Something went wrong</Text>

        <Text style={[styles.message, { color: c.muted }]}>
          An unexpected error occurred. Please restart the app.
        </Text>

        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>Restart App</Text>
        </Pressable>

        <Pressable onPress={resetError} style={styles.secondaryBtn}>
          <Text style={[styles.secondaryText, { color: c.muted }]}>Try without restart</Text>
        </Pressable>
      </View>

      {__DEV__ && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: c.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
                <Text style={[styles.modalTitle, { color: c.foreground }]}>Error Details</Text>
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Feather name="x" size={24} color={c.foreground} />
                </Pressable>
              </View>
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
                showsVerticalScrollIndicator
              >
                <View style={[styles.errorContainer, { backgroundColor: c.card }]}>
                  <Text
                    style={[styles.errorText, { color: c.foreground, fontFamily: monoFont }]}
                    selectable
                  >
                    {errorText}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  topButton: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    width: "100%",
    maxWidth: 600,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 28,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryBtn: { paddingVertical: 8 },
  secondaryText: { fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    height: "90%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: "600" },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  modalScrollView: { flex: 1 },
  errorContainer: { borderRadius: 8, overflow: "hidden", padding: 16 },
  errorText: { fontSize: 12, lineHeight: 18 },
});
