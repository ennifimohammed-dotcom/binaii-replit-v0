import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import LineChart from "@/components/charts/LineChart";
import BudgetBar from "@/components/BudgetBar";
import Empty from "@/components/Empty";
import InsightCard from "@/components/InsightCard";
import SectionHeader from "@/components/SectionHeader";
import { CATEGORY_MAP } from "@/constants/categories";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  categoryBreakdown,
  dailySeries,
  generateInsights,
  monthlySeries,
} from "@/lib/insights";

type Range = "30" | "90" | "all";

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projectExpenses, projectBudgets, activeProject } = useApp();
  const [range, setRange] = useState<Range>("30");

  const days = range === "30" ? 30 : range === "90" ? 90 : 365;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const inRange = useMemo(
    () => projectExpenses.filter((e) => new Date(e.date) >= cutoff),
    [projectExpenses, days],
  );

  const total = inRange.reduce((s, e) => s + e.amount, 0);
  const avgDay = total / days;

  const monthly = useMemo(
    () => monthlySeries(projectExpenses, range === "all" ? 12 : 6),
    [projectExpenses, range],
  );
  const daily = useMemo(
    () => dailySeries(projectExpenses, Math.min(days, 30)),
    [projectExpenses, days],
  );
  const breakdown = useMemo(() => {
    const cats: Partial<Record<import("@/constants/categories").CategoryId, number>> = {};
    for (const e of inRange) {
      cats[e.category] = (cats[e.category] ?? 0) + e.amount;
    }
    return (
      Object.entries(cats) as [import("@/constants/categories").CategoryId, number][]
    )
      .map(([id, value]) => ({ id, value }))
      .sort((a, b) => b.value - a.value);
  }, [inRange]);

  const breakdownTotal = breakdown.reduce((s, c) => s + c.value, 0);

  const insights = useMemo(
    () => generateInsights(projectExpenses, projectBudgets),
    [projectExpenses, projectBudgets],
  );

  const monthlyData = monthly.map((m) => ({
    label: formatDate(`${m.month}-01`, "month").split(" ")[0] ?? "",
    value: m.value,
  }));

  const dailyData = daily.map((d, i) => {
    const date = new Date(d.date);
    return {
      label:
        i === 0 || i === daily.length - 1
          ? `${date.getDate()}/${date.getMonth() + 1}`
          : "",
      value: d.value,
    };
  });

  const headerInsetTop = Platform.OS === "web" ? 67 : insets.top;

  const donutSlices = breakdown.slice(0, 6).map((b) => ({
    label: CATEGORY_MAP[b.id]?.label ?? b.id,
    value: b.value,
    color: CATEGORY_MAP[b.id]?.color ?? colors.accent,
  }));

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
            <Text style={[styles.kicker, { color: colors.mutedForeground }]}>
              {activeProject?.name ?? "All projects"}
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Insights
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/budgets")}
            style={({ pressed }) => [
              styles.headerBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="target" size={16} color={colors.foreground} />
            <Text
              style={[styles.headerBtnText, { color: colors.foreground }]}
            >
              Budgets
            </Text>
          </Pressable>
        </View>

        <View style={styles.rangeRow}>
          {(["30", "90", "all"] as Range[]).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRange(r)}
              style={({ pressed }) => [
                styles.rangeBtn,
                {
                  backgroundColor:
                    range === r ? colors.foreground : colors.card,
                  borderColor:
                    range === r ? colors.foreground : colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.rangeBtnText,
                  {
                    color:
                      range === r ? colors.background : colors.foreground,
                  },
                ]}
              >
                {r === "all" ? "All time" : `${r} days`}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryLabel, { color: colors.mutedForeground }]}
            >
              Total spend
            </Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {formatCurrency(total, { compact: true })}
            </Text>
          </View>
          <View
            style={[
              styles.summaryDivider,
              { backgroundColor: colors.border },
            ]}
          />
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryLabel, { color: colors.mutedForeground }]}
            >
              Daily avg
            </Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {formatCurrency(avgDay, { compact: true })}
            </Text>
          </View>
          <View
            style={[
              styles.summaryDivider,
              { backgroundColor: colors.border },
            ]}
          />
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryLabel, { color: colors.mutedForeground }]}
            >
              Entries
            </Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {inRange.length}
            </Text>
          </View>
        </View>

        <SectionHeader title="Monthly trend" />
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {monthly.some((m) => m.value > 0) ? (
            <LineChart data={monthlyData} height={150} />
          ) : (
            <Empty
              icon="bar-chart-2"
              title="Not enough data"
              detail="Trend requires several months of activity."
            />
          )}
        </View>

        <SectionHeader title="Daily activity" />
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {daily.some((d) => d.value > 0) ? (
            <BarChart data={dailyData} height={130} />
          ) : (
            <Empty
              icon="activity"
              title="Quiet stretch"
              detail="No activity in this date range."
            />
          )}
        </View>

        <SectionHeader title="By category" />
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {breakdownTotal > 0 ? (
            <View style={{ gap: 16 }}>
              <View style={styles.donutRow}>
                <DonutChart
                  data={donutSlices}
                  size={150}
                  centerLabel="TOTAL"
                  centerValue={formatCurrency(breakdownTotal, {
                    compact: true,
                  })}
                />
                <View style={{ flex: 1, gap: 8 }}>
                  {donutSlices.map((s) => (
                    <View key={s.label} style={styles.legendRow}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: s.color },
                        ]}
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
              </View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.border },
                ]}
              />
              <View style={{ gap: 12 }}>
                {breakdown.map((b) => {
                  const cat = CATEGORY_MAP[b.id];
                  if (!cat) return null;
                  const pct = (b.value / breakdownTotal) * 100;
                  return (
                    <View key={b.id} style={styles.catRow}>
                      <View
                        style={[
                          styles.catIcon,
                          { backgroundColor: cat.color + "1F" },
                        ]}
                      >
                        <Feather
                          name={cat.icon}
                          size={14}
                          color={cat.color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.catTopRow}>
                          <Text
                            style={[
                              styles.catLabel,
                              { color: colors.foreground },
                            ]}
                          >
                            {cat.label}
                          </Text>
                          <Text
                            style={[
                              styles.catValue,
                              { color: colors.foreground },
                            ]}
                          >
                            {formatCurrency(b.value, { compact: true })}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.catTrack,
                            { backgroundColor: colors.muted },
                          ]}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              backgroundColor: cat.color,
                              borderRadius: 4,
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <Empty
              icon="pie-chart"
              title="No category data"
              detail="Add expenses to see category breakdown."
            />
          )}
        </View>

        {projectBudgets.length > 0 ? (
          <>
            <SectionHeader
              title="Budget tracking"
              action={{
                label: "Manage",
                onPress: () => router.push("/budgets"),
              }}
            />
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {projectBudgets.map((b, i) => {
                const monthKey = new Date().toISOString().slice(0, 7);
                const spent = projectExpenses
                  .filter((e) => e.date.slice(0, 7) === monthKey)
                  .filter((e) =>
                    b.scope === "global" ? true : e.category === b.categoryId,
                  )
                  .reduce((s, e) => s + e.amount, 0);
                const cat = b.categoryId ? CATEGORY_MAP[b.categoryId] : null;
                return (
                  <View key={b.id}>
                    <BudgetBar
                      label={
                        b.scope === "global"
                          ? "Overall budget"
                          : cat?.label ?? "Category"
                      }
                      color={
                        b.scope === "global"
                          ? colors.accent
                          : cat?.color ?? colors.accent
                      }
                      spent={spent}
                      budget={b.amount}
                    />
                    {i < projectBudgets.length - 1 ? (
                      <View
                        style={[
                          styles.budgetDivider,
                          { backgroundColor: colors.border },
                        ]}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <SectionHeader title="Budget tracking" />
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Empty
                icon="target"
                title="No budgets set"
                detail="Set monthly limits to track how you're pacing."
                action={
                  <Pressable
                    onPress={() => router.push("/budgets")}
                    style={({ pressed }) => [
                      styles.emptyBtn,
                      {
                        backgroundColor: colors.foreground,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.emptyBtnText,
                        { color: colors.background },
                      ]}
                    >
                      Set a budget
                    </Text>
                  </Pressable>
                }
              />
            </View>
          </>
        )}

        {insights.length > 0 ? (
          <>
            <SectionHeader title="Smart insights" />
            <View style={styles.insightsCol}>
              {insights.map((ins) => (
                <InsightCard key={ins.id} insight={ins} />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    gap: 8,
  },
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
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerBtnText: {
    fontSize: 12.5,
    fontFamily: "Inter_600SemiBold",
  },
  rangeRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
  },
  rangeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rangeBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryLabel: {
    fontSize: 10.5,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  summaryDivider: {
    width: 1,
    height: 28,
  },
  card: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  donutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  catTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  catValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  catTrack: {
    height: 6,
    borderRadius: 4,
    overflow: "hidden",
  },
  budgetDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  emptyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  insightsCol: {
    paddingHorizontal: 20,
    gap: 10,
  },
});
