import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
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
import { formatCurrency } from "@/lib/format";

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    projects,
    activeProject,
    expenses,
    projectExpenses,
    projectBudgets,
  } = useApp();

  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
  const totalProject = projectExpenses.reduce((s, e) => s + e.amount, 0);

  const headerInsetTop = Platform.OS === "web" ? 67 : insets.top;

  const items: {
    label: string;
    icon: keyof typeof Feather.glyphMap;
    color: string;
    onPress: () => void;
    detail?: string;
  }[] = [
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
      detail: `${projectBudgets.length} configured`,
      onPress: () => router.push("/budgets"),
    },
    {
      label: "Search",
      icon: "search",
      color: "#3b82f6",
      detail: "Find any expense",
      onPress: () => router.push("/search"),
    },
    {
      label: "Settings",
      icon: "settings",
      color: "#a855f7",
      detail: "Theme, currency, data",
      onPress: () => router.push("/settings"),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerInsetTop + 8,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 20,
        }}
      >
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>
          BuildVault
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>More</Text>

        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.foreground },
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.accent + "33" },
            ]}
          >
            <Feather name="briefcase" size={22} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.profileLabel,
                { color: colors.background + "AA" },
              ]}
            >
              ACTIVE PROJECT
            </Text>
            <Text
              style={[styles.profileName, { color: colors.background }]}
              numberOfLines={1}
            >
              {activeProject?.name ?? "No project"}
            </Text>
            <Text
              style={[
                styles.profileSub,
                { color: colors.background + "99" },
              ]}
              numberOfLines={1}
            >
              {projectExpenses.length} expenses •{" "}
              {formatCurrency(totalProject, { compact: true })}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/projects")}
            style={({ pressed }) => [
              styles.switchBtn,
              {
                backgroundColor: colors.background + "1A",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="repeat" size={14} color={colors.background} />
            <Text
              style={[styles.switchBtnText, { color: colors.background }]}
            >
              Switch
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.statsRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.statCol}>
            <Text
              style={[styles.statLabel, { color: colors.mutedForeground }]}
            >
              ALL PROJECTS
            </Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {formatCurrency(totalAll, { compact: true })}
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statCol}>
            <Text
              style={[styles.statLabel, { color: colors.mutedForeground }]}
            >
              EXPENSES
            </Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {expenses.length}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.menuCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {items.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuRow,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: item.color + "1F" },
                ]}
              >
                <Feather name={item.icon} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: colors.foreground }]}>
                  {item.label}
                </Text>
                {item.detail ? (
                  <Text
                    style={[
                      styles.menuDetail,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {item.detail}
                  </Text>
                ) : null}
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
          ))}
          <View
            style={[
              styles.menuDivider,
              { backgroundColor: colors.border },
            ]}
          />
        </View>

        <View style={styles.aboutWrap}>
          <Text style={[styles.aboutTitle, { color: colors.foreground }]}>
            BuildVault
          </Text>
          <Text style={[styles.aboutDetail, { color: colors.mutedForeground }]}>
            Premium expense intelligence for builders. Made for the field, with
            the rigor of a finance desk.
          </Text>
          <Text style={[styles.version, { color: colors.mutedForeground }]}>
            v1.0.0
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
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  profileLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
  },
  profileName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  profileSub: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  switchBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  menuCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  menuDetail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  menuDivider: {
    height: 0,
  },
  aboutWrap: {
    marginTop: 28,
    alignItems: "center",
    gap: 6,
    padding: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  aboutDetail: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 17,
    maxWidth: 280,
  },
  version: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 6,
  },
});
