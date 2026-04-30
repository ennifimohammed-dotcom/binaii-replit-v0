import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LineChart from "@/components/charts/LineChart";
import DonutChart from "@/components/charts/DonutChart";
import Empty from "@/components/Empty";
import ExpenseRow from "@/components/ExpenseRow";
import HealthScore from "@/components/HealthScore";
import InsightCard from "@/components/InsightCard";
import SectionHeader from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import { CATEGORY_MAP } from "@/constants/categories";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  categoryBreakdown,
  computeHealthScore,
  dailySeries,
  generateInsights,
  monthlySeries,
} from "@/lib/insights";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    activeProject,
    projectExpenses,
    projectBudgets,
    projects,
  } = useApp();

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const totals = useMemo(() => {
    let total = 0;
    let thisMonth = 0;
    let lastMonth = 0;
    let today = 0;
    const todayKey = now.toISOString().slice(0, 10);
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    let last30Total = 0;
    for (const e of projectExpenses) {
      total += e.amount;
      const mk = e.date.slice(0, 7);
      if (mk === thisMonthKey) thisMonth += e.amount;
      if (mk === lastMonthKey) lastMonth += e.amount;
      if (e.date.slice(0, 10) === todayKey) today += e.amount;
      if (new Date(e.date) >= last30) last30Total += e.amount;
    }
    const monthChange =
      lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    return { total, thisMonth, lastMonth, today, last30Total, monthChange };
  }, [projectExpenses, thisMonthKey, lastMonthKey]);

  const globalBudget = projectBudgets.find((b) => b.scope === "global");
  const remainingBudget = globalBudget
    ? globalBudget.amount - totals.thisMonth
    : null;

  const monthly = useMemo(() => monthlySeries(projectExpenses, 6), [
    projectExpenses,
  ]);
  const daily = useMemo(() => dailySeries(projectExpenses, 14), [
    projectExpenses,
  ]);

  const breakdown = useMemo(
    () => categoryBreakdown(projectExpenses, thisMonthKey),
    [projectExpenses, thisMonthKey],
  );
  const breakdownTotal = breakdown.reduce((s, b) => s + b.value, 0);
  const donutSlices = breakdown.slice(0, 6).map((b) => ({
    label: CATEGORY_MAP[b.categoryId].label,
    value: b.value,
    color: CATEGORY_MAP[b.categoryId].color,
  }));

  const healthScore = useMemo(
    () => computeHealthScore(projectExpenses, projectBudgets),
    [projectExpenses, projectBudgets],
  );

  const insights = useMemo(
    () => generateInsights(projectExpenses, projectBudgets),
    [projectExpenses, projectBudgets],
  );

  const recent = projectExpenses.slice(0, 5);

  const monthlyChartData = monthly.map((m) => ({
    label: formatDate(`${m.month}-01`, "month").split(" ")[0] ?? "",
    value: m.value,
  }));

  const dailyChartData = daily.map((d, i) => {
    const date = new Date(d.date);
    return {
      label:
        i === 0 || i === daily.length - 1 || date.getDay() === 1
          ? `${date.getDate()}/${date.getMonth() + 1}`
          : "",
      value: d.value,
    };
  });

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const handleAdd = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/expense/new");
  };

  const headerInsetTop = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerInsetTop + 8,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greet, { color: colors.mutedForeground }]}>
              {greeting}
            </Text>
            <Pressable
              onPress={() => router.push("/projects")}
              hitSlop={6}
              style={({ pressed }) => [
                styles.projectRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text
                style={[styles.projectName, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {activeProject?.name ?? "Select project"}
              </Text>
              <Feather
                name="chevron-down"
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
            {activeProject?.location ? (
              <Text style={[styles.subtle, { color: colors.mutedForeground }]}>
                {activeProject.location}
                {activeProject.client ? ` • ${activeProject.client}` : ""}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => router.push("/search")}
            style={({ pressed }) => [
              styles.headerBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="search" size={18} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [
              styles.headerBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="settings" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.foreground,
            },
          ]}
        >
          <View style={styles.heroHeaderRow}>
            <Text
              style={[styles.heroLabel, { color: colors.background + "AA" }]}
            >
              MONTH-TO-DATE SPEND
            </Text>
            <View
              style={[
                styles.heroBadge,
                { backgroundColor: colors.background + "1A" },
              ]}
            >
              <Feather
                name="trending-up"
                size={11}
                color={colors.background}
              />
              <Text
                style={[styles.heroBadgeText, { color: colors.background }]}
              >
                {formatDate(`${thisMonthKey}-01`, "month")}
              </Text>
            </View>
          </View>
          <Text
            style={[styles.heroValue, { color: colors.background }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {formatCurrency(totals.thisMonth)}
          </Text>
          <View style={styles.heroFooterRow}>
            <View>
              <Text
                style={[
                  styles.heroFootLabel,
                  { color: colors.background + "99" },
                ]}
              >
                Last month
              </Text>
              <Text
                style={[
                  styles.heroFootValue,
                  { color: colors.background },
                ]}
              >
                {formatCurrency(totals.lastMonth, { compact: true })}
              </Text>
            </View>
            <View
              style={[
                styles.heroDivider,
                { backgroundColor: colors.background + "22" },
              ]}
            />
            <View>
              <Text
                style={[
                  styles.heroFootLabel,
                  { color: colors.background + "99" },
                ]}
              >
                Today
              </Text>
              <Text
                style={[
                  styles.heroFootValue,
                  { color: colors.background },
                ]}
              >
                {formatCurrency(totals.today, { compact: true })}
              </Text>
            </View>
            <View
              style={[
                styles.heroDivider,
                { backgroundColor: colors.background + "22" },
              ]}
            />
            <View>
              <Text
                style={[
                  styles.heroFootLabel,
                  { color: colors.background + "99" },
                ]}
              >
                {globalBudget ? "Remaining" : "All-time"}
              </Text>
              <Text
                style={[
                  styles.heroFootValue,
                  {
                    color:
                      remainingBudget !== null && remainingBudget < 0
                        ? colors.destructive
                        : colors.background,
                  },
                ]}
              >
                {formatCurrency(
                  remainingBudget ?? totals.total,
                  { compact: true },
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="Daily avg"
            value={formatCurrency(totals.last30Total / 30, { compact: true })}
            icon="calendar"
            iconColor={colors.accent}
          />
          <StatCard
            label="vs Last mo"
            value={`${totals.monthChange >= 0 ? "+" : ""}${totals.monthChange.toFixed(0)}%`}
            icon={totals.monthChange >= 0 ? "trending-up" : "trending-down"}
            iconColor={
              totals.monthChange >= 0 ? colors.destructive : colors.success
            }
          />
        </View>

        <View
          style={[
            styles.healthCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <HealthScore score={healthScore} />
          <View style={styles.healthBody}>
            <Text style={[styles.healthLabel, { color: colors.mutedForeground }]}>
              FINANCIAL HEALTH
            </Text>
            <Text style={[styles.healthTitle, { color: colors.foreground }]}>
              {healthScore.label}
            </Text>
            <Text
              style={[styles.healthDetail, { color: colors.mutedForeground }]}
            >
              {healthScore.detail}
            </Text>
          </View>
        </View>

        <SectionHeader
          title="Monthly evolution"
          action={{
            label: "Insights",
            onPress: () => router.push("/(tabs)/analytics"),
          }}
        />
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {monthly.some((m) => m.value > 0) ? (
            <>
              <View style={styles.chartHeader}>
                <View>
                  <Text
                    style={[
                      styles.chartLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    LAST 6 MONTHS
                  </Text>
                  <Text
                    style={[styles.chartValue, { color: colors.foreground }]}
                  >
                    {formatCurrency(
                      monthly.reduce((s, m) => s + m.value, 0),
                      { compact: true },
                    )}
                  </Text>
                </View>
              </View>
              <LineChart data={monthlyChartData} height={140} />
            </>
          ) : (
            <Empty
              icon="bar-chart-2"
              title="No spending yet"
              detail="Add your first expense to see the monthly trend appear here."
            />
          )}
        </View>

        <SectionHeader title="Where it goes" />
        <View
          style={[
            styles.donutCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {breakdownTotal > 0 ? (
            <>
              <DonutChart
                data={donutSlices}
                centerLabel="THIS MONTH"
                centerValue={formatCurrency(breakdownTotal, { compact: true })}
              />
              <View style={styles.legend}>
                {donutSlices.map((s) => (
                  <View key={s.label} style={styles.legendRow}>
                    <View
                      style={[styles.legendDot, { backgroundColor: s.color }]}
                    />
                    <Text
                      style={[
                        styles.legendLabel,
                        { color: colors.foreground },
                      ]}
                      numberOfLines={1}
                    >
                      {s.label}
                    </Text>
                    <Text
                      style={[
                        styles.legendValue,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {Math.round((s.value / breakdownTotal) * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Empty
              icon="pie-chart"
              title="No category data"
              detail="Spend across categories will be visualized here."
            />
          )}
        </View>

        <SectionHeader title="Last 14 days" />
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {daily.some((d) => d.value > 0) ? (
            <LineChart
              data={dailyChartData}
              height={120}
              color={colors.accent}
              showLabels={false}
            />
          ) : (
            <Empty
              icon="activity"
              title="Quiet stretch"
              detail="No expenses recorded in the last two weeks."
            />
          )}
        </View>

        {insights.length > 0 ? (
          <>
            <SectionHeader
              title="Smart insights"
              action={{
                label: "All",
                onPress: () => router.push("/(tabs)/analytics"),
              }}
            />
            <View style={styles.insightsCol}>
              {insights.slice(0, 3).map((ins) => (
                <InsightCard key={ins.id} insight={ins} />
              ))}
            </View>
          </>
        ) : null}

        <SectionHeader
          title="Recent activity"
          action={{
            label: "See all",
            onPress: () => router.push("/(tabs)/expenses"),
          }}
        />
        <View
          style={[
            styles.listCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {recent.length > 0 ? (
            recent.map((e, i) => (
              <View key={e.id}>
                <ExpenseRow expense={e} />
                {i < recent.length - 1 ? (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                ) : null}
              </View>
            ))
          ) : (
            <Empty
              icon="inbox"
              title="No expenses yet"
              detail="Tap + to add your first expense."
            />
          )}
        </View>

        {projects.length === 0 ? (
          <View
            style={[
              styles.callout,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather
              name="briefcase"
              size={20}
              color={colors.accent}
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.calloutTitle, { color: colors.foreground }]}>
              Create your first project
            </Text>
            <Text
              style={[styles.calloutDetail, { color: colors.mutedForeground }]}
            >
              Track expenses across multiple constructions in one place.
            </Text>
            <Pressable
              onPress={() => router.push("/projects")}
              style={({ pressed }) => [
                styles.calloutBtn,
                {
                  backgroundColor: colors.foreground,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[styles.calloutBtnText, { color: colors.background }]}>
                New project
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.accent,
            bottom: insets.bottom + 90,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            shadowColor: colors.foreground,
          },
        ]}
      >
        <Feather name="plus" size={26} color={colors.accentForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  greet: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  projectName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    maxWidth: 220,
  },
  subtle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 24,
    padding: 22,
    overflow: "hidden",
  },
  heroHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.7,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  heroValue: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
    marginBottom: 18,
  },
  heroFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroFootLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroFootValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  heroDivider: {
    width: 1,
    height: 30,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  healthCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  healthBody: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.7,
  },
  healthTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  healthDetail: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    lineHeight: 17,
  },
  chartCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chartHeader: {
    marginBottom: 12,
  },
  chartLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.7,
  },
  chartValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  donutCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  legendValue: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  insightsCol: {
    paddingHorizontal: 20,
    gap: 10,
  },
  listCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  callout: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  calloutTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  calloutDetail: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginBottom: 12,
  },
  calloutBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  calloutBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});

export const unstable_settings = {
  initialRouteName: "index",
};
