import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function CustomTabBar({ state, descriptors, navigation }: any) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const tabs = state.routes.filter((r: any) => r.name !== "fab-placeholder");

  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: bottomPad,
          height: 56 + bottomPad,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate("index")}
        activeOpacity={0.7}
      >
        <Feather
          name="home"
          size={22}
          color={
            state.index === 0 ? colors.primary : colors.mutedForeground
          }
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color:
                state.index === 0 ? colors.primary : colors.mutedForeground,
            },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fabWrap}
        onPress={() => router.push("/tools")}
        activeOpacity={0.85}
      >
        <View style={[styles.fab, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate("files")}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="file-document-multiple-outline"
          size={22}
          color={
            state.index === 1 ? colors.primary : colors.mutedForeground
          }
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color:
                state.index === 1 ? colors.primary : colors.mutedForeground,
            },
          ]}
        >
          Files
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: {
          color: colors.foreground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 22,
        },
        headerTintColor: colors.foreground,
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => router.push("/settings")}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color={colors.foreground}
            />
          </TouchableOpacity>
        ),
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen
        name="files"
        options={{
          title: "Files",
          headerRight: () => (
            <View style={styles.filesHeaderIcons}>
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="magnify"
                  size={22}
                  color={colors.foreground}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="checkbox-multiple-outline"
                  size={22}
                  color={colors.foreground}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="sort"
                  size={22}
                  color={colors.foreground}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={22}
                  color={colors.foreground}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const filesHeaderIconsColors = {};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    position: "relative",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingTop: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  fabWrap: {
    width: 80,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 0,
    marginTop: -28,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5B5FEF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  filesHeaderIcons: {
    flexDirection: "row",
    gap: 14,
    marginRight: 16,
    alignItems: "center",
  },
});
