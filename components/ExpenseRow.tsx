import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getCategory } from "@/constants/categories";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, relativeDay } from "@/lib/format";
import { Expense } from "@/lib/storage";

type Props = {
  expense: Expense;
  onPress?: () => void;
  showDate?: boolean;
};

export default function ExpenseRow({ expense, onPress, showDate = true }: Props) {
  const colors = useColors();
  const cat = getCategory(expense.category);

  const handlePress =
    onPress ??
    (() => router.push({ pathname: "/expense/[id]", params: { id: expense.id } }));

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? colors.muted : "transparent",
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: cat.color + "1F" }]}>
        <Feather name={cat.icon} size={18} color={cat.color} />
      </View>
      <View style={styles.middle}>
        <Text
          style={[styles.desc, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {expense.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.cat, { color: cat.color }]}>{cat.label}</Text>
          {showDate ? (
            <>
              <View
                style={[styles.dot, { backgroundColor: colors.mutedForeground }]}
              />
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {relativeDay(expense.date)}
              </Text>
            </>
          ) : null}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.foreground }]}>
          {formatCurrency(expense.amount, { compact: expense.amount >= 10000 })}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: {
    flex: 1,
  },
  desc: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  cat: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    opacity: 0.5,
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
