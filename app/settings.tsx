import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { resetWithSeed, clearAllData, projects, expenses } = useApp();

  const handleReset = () => {
    Alert.alert(
      "Reset with sample data?",
      "This replaces everything with the demo dataset (3 projects + history).",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetWithSeed();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            }
            Alert.alert("Done", "Sample data restored.");
          },
        },
      ],
    );
  };

  const handleClear = () => {
    Alert.alert(
      "Clear all data?",
      "All projects, expenses, and budgets will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete everything",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            }
          },
        },
      ],
    );
  };

  type Item = {
    label: string;
    detail?: string;
    icon: keyof typeof Feather.glyphMap;
    color: string;
    onPress: () => void;
    destructive?: boolean;
  };

  const sections: { title: string; items: Item[] }[] = [
    {
      title: "Workspace",
      items: [
        {
          label: "Projects",
          icon: "briefcase",
          color: colors.accent,
          detail: `${projects.length} active`,
          onPress: () => router.push("/projects"),
        },
        {
          label: "Budgets",
          icon: "target",
          color: "#10b981",
          detail: "Per-project monthly limits",
          onPress: () => router.push("/budgets"),
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          label: "Theme",
          icon: "moon",
          color: "#a855f7",
          detail: "Follows your device theme automatically",
          onPress: () =>
            Alert.alert(
              "Theme",
              "BuildVault adapts to your device's light or dark mode automatically.",
            ),
        },
        {
          label: "Currency",
          icon: "dollar-sign",
          color: "#f59e0b",
          detail: "Moroccan Dirham (MAD)",
          onPress: () =>
            Alert.alert(
              "Currency",
              "MAD is the only supported currency in this build.",
            ),
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          label: "Reset with sample data",
          icon: "refresh-cw",
          color: "#3b82f6",
          detail: `Currently ${expenses.length} expenses`,
          onPress: handleReset,
        },
        {
          label: "Clear all data",
          icon: "trash-2",
          color: colors.destructive,
          detail: "Permanently delete everything",
          onPress: handleClear,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>
          BUILDVAULT
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Settings
        </Text>

        {sections.map((section) => (
          <View key={section.title} style={{ marginTop: 24 }}>
            <Text
              style={[styles.sectionLabel, { color: colors.mutedForeground }]}
            >
              {section.title.toUpperCase()}
            </Text>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {section.items.map((item, i) => (
                <View key={item.label}>
                  <Pressable
                    onPress={item.onPress}
                    style={({ pressed }) => [
                      styles.row,
                      { opacity: pressed ? 0.6 : 1 },
                    ]}
                  >
                    <View
                      style={[
                        styles.icon,
                        { backgroundColor: item.color + "1F" },
                      ]}
                    >
                      <Feather
                        name={item.icon}
                        size={16}
                        color={item.color}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.rowLabel,
                          {
                            color: item.destructive
                              ? colors.destructive
                              : colors.foreground,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.detail ? (
                        <Text
                          style={[
                            styles.rowDetail,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {item.detail}
                        </Text>
                      ) : null}
                    </View>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </Pressable>
                  {i < section.items.length - 1 ? (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.about}>
          <Text style={[styles.aboutTitle, { color: colors.foreground }]}>
            BuildVault v1.0.0
          </Text>
          <Text style={[styles.aboutDetail, { color: colors.mutedForeground }]}>
            Premium expense intelligence for builders.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kicker: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.7,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  rowDetail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
  about: {
    marginTop: 32,
    alignItems: "center",
    gap: 4,
  },
  aboutTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  aboutDetail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
