import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Empty from "@/components/Empty";
import ExpenseRow from "@/components/ExpenseRow";
import { CATEGORIES, getCategory } from "@/constants/categories";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/lib/format";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { expenses, projects } = useApp();

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"active" | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return expenses
      .filter((e) => {
        if (
          !e.description.toLowerCase().includes(q) &&
          !getCategory(e.category).label.toLowerCase().includes(q) &&
          !(e.notes ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, query, scope]);

  const total = results.reduce((s, e) => s + e.amount, 0);

  const suggestions = ["cement", "steel", "labor", "electric", "permit"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerWrap}>
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
            placeholder="Search expenses, notes, categories"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!query ? (
        <View style={{ padding: 20 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            TRY SEARCHING FOR
          </Text>
          <View style={styles.suggRow}>
            {suggestions.map((s) => (
              <Pressable
                key={s}
                onPress={() => setQuery(s)}
                style={({ pressed }) => [
                  styles.suggChip,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.6 : 1,
                  },
                ]}
              >
                <Feather name="search" size={12} color={colors.mutedForeground} />
                <Text
                  style={[styles.suggText, { color: colors.foreground }]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text
            style={[
              styles.label,
              { color: colors.mutedForeground, marginTop: 24 },
            ]}
          >
            BROWSE BY CATEGORY
          </Text>
          <View style={styles.suggRow}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setQuery(c.label.toLowerCase())}
                style={({ pressed }) => [
                  styles.catChip,
                  {
                    backgroundColor: c.color + "1F",
                    opacity: pressed ? 0.6 : 1,
                  },
                ]}
              >
                <Feather name={c.icon} size={12} color={c.color} />
                <Text style={[styles.suggText, { color: c.color }]}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : results.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Empty
            icon="search"
            title="No results"
            detail={`Nothing matches "${query}".`}
          />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 40,
          }}
          ListHeaderComponent={
            <View style={styles.summaryRow}>
              <Text
                style={[styles.summary, { color: colors.mutedForeground }]}
              >
                {results.length} match{results.length === 1 ? "" : "es"}
              </Text>
              <Text style={[styles.summaryTotal, { color: colors.foreground }]}>
                {formatCurrency(total, { compact: true })}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const projectName = projects.find(
              (p) => p.id === item.projectId,
            )?.name;
            return (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderLeftWidth: StyleSheet.hairlineWidth,
                  borderRightWidth: StyleSheet.hairlineWidth,
                  borderTopWidth:
                    index === 0 ? StyleSheet.hairlineWidth : 0,
                  borderBottomWidth:
                    index === results.length - 1
                      ? StyleSheet.hairlineWidth
                      : 0,
                  borderTopLeftRadius: index === 0 ? 16 : 0,
                  borderTopRightRadius: index === 0 ? 16 : 0,
                  borderBottomLeftRadius:
                    index === results.length - 1 ? 16 : 0,
                  borderBottomRightRadius:
                    index === results.length - 1 ? 16 : 0,
                }}
              >
                <ExpenseRow expense={item} />
                {projectName ? (
                  <Text
                    style={[
                      styles.projectTag,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    in {projectName}
                  </Text>
                ) : null}
                {index < results.length - 1 ? (
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
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
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    padding: 0,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  suggRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  suggText: {
    fontSize: 12.5,
    fontFamily: "Inter_600SemiBold",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  summary: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  summaryTotal: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  projectTag: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    paddingHorizontal: 14,
    paddingBottom: 8,
    marginTop: -4,
  },
});
