import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Empty from "@/components/Empty";
import ExpenseRow from "@/components/ExpenseRow";
import { CATEGORIES, CategoryId, getCategory } from "@/constants/categories";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDate } from "@/lib/format";
import { Expense } from "@/lib/storage";

type FilterCat = CategoryId | "all";

export default function ExpensesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projectExpenses, activeProject } = useApp();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterCat>("all");

  const filtered = useMemo(() => {
    return projectExpenses.filter((e) => {
      if (filter !== "all" && e.category !== filter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !e.description.toLowerCase().includes(q) &&
          !getCategory(e.category).label.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [projectExpenses, query, filter]);

  const sections = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    for (const e of filtered) {
      const key = e.date.slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(e);
    }
    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => ({
        title: date,
        total: items.reduce((s, e) => s + e.amount, 0),
        data: items,
      }));
  }, [filtered]);

  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);

  const handleAdd = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/expense/new");
  };

  const headerInsetTop = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBlock, { paddingTop: headerInsetTop + 8 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.mutedForeground }]}>
              {activeProject?.name ?? "All projects"}
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Activity
            </Text>
          </View>
          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [
              styles.addBtn,
              {
                backgroundColor: colors.foreground,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather name="plus" size={16} color={colors.background} />
            <Text style={[styles.addBtnText, { color: colors.background }]}>
              New
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.searchRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search description or category"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <FilterChip
            label="All"
            active={filter === "all"}
            onPress={() => setFilter("all")}
            colors={colors}
          />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              label={c.label}
              icon={c.icon}
              color={c.color}
              active={filter === c.id}
              onPress={() => setFilter(c.id)}
              colors={colors}
            />
          ))}
        </ScrollView>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </Text>
          <Text style={[styles.summaryTotal, { color: colors.foreground }]}>
            {formatCurrency(filteredTotal)}
          </Text>
        </View>
      </View>

      {sections.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Empty
            icon={query || filter !== "all" ? "search" : "inbox"}
            title={
              query || filter !== "all" ? "No matches" : "No expenses yet"
            }
            detail={
              query || filter !== "all"
                ? "Try clearing your filters or search."
                : "Tap + New to record your first expense."
            }
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 120,
          }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionDate,
                  { color: colors.mutedForeground },
                ]}
              >
                {formatDate(section.title, "long")}
              </Text>
              <Text
                style={[
                  styles.sectionTotal,
                  { color: colors.mutedForeground },
                ]}
              >
                {formatCurrency(section.total, { compact: true })}
              </Text>
            </View>
          )}
          renderItem={({ item, index, section }) => {
            const isFirst = index === 0;
            const isLast = index === section.data.length - 1;
            return (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderLeftWidth: StyleSheet.hairlineWidth,
                  borderRightWidth: StyleSheet.hairlineWidth,
                  borderTopWidth: isFirst ? StyleSheet.hairlineWidth : 0,
                  borderBottomWidth: isLast ? StyleSheet.hairlineWidth : 0,
                  borderTopLeftRadius: isFirst ? 16 : 0,
                  borderTopRightRadius: isFirst ? 16 : 0,
                  borderBottomLeftRadius: isLast ? 16 : 0,
                  borderBottomRightRadius: isLast ? 16 : 0,
                }}
              >
                <ExpenseRow expense={item} showDate={false} />
                {!isLast ? (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                ) : null}
              </View>
            );
          }}
          SectionSeparatorComponent={() => <View style={{ height: 14 }} />}
        />
      )}
    </View>
  );
}

function FilterChip({
  label,
  icon,
  color,
  active,
  onPress,
  colors,
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  color?: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? colors.foreground : colors.card,
          borderColor: active ? colors.foreground : colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {icon ? (
        <Feather
          name={icon}
          size={12}
          color={active ? colors.background : color ?? colors.foreground}
        />
      ) : null}
      <Text
        style={[
          styles.chipText,
          { color: active ? colors.background : colors.foreground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBlock: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  addBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    padding: 0,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
    paddingRight: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  summaryTotal: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  sectionDate: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTotal: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
});
