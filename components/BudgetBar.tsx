import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/lib/format";

type Props = {
  label: string;
  spent: number;
  budget: number;
  color?: string;
  compact?: boolean;
};

export default function BudgetBar({
  label,
  spent,
  budget,
  color,
  compact,
}: Props) {
  const colors = useColors();
  const pct = budget > 0 ? Math.min(spent / budget, 1.5) : 0;
  const filled = Math.min(pct, 1);
  const overflow = Math.max(pct - 1, 0);

  const tone =
    pct >= 1
      ? colors.destructive
      : pct >= 0.85
        ? colors.warning
        : (color ?? colors.accent);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.amount, { color: colors.mutedForeground }]}>
          {formatCurrency(spent, { compact: true })} /{" "}
          {formatCurrency(budget, { compact: true })}
        </Text>
      </View>
      <View
        style={[
          styles.track,
          { backgroundColor: colors.muted, height: compact ? 8 : 10 },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${filled * 100}%`,
              backgroundColor: tone,
            },
          ]}
        />
        {overflow > 0 ? (
          <View
            style={[
              styles.overflow,
              {
                width: `${Math.min(overflow * 100, 50)}%`,
                backgroundColor: colors.destructive,
              },
            ]}
          />
        ) : null}
      </View>
      {!compact ? (
        <View style={styles.footer}>
          <Text style={[styles.pct, { color: tone }]}>
            {Math.round(pct * 100)}% used
          </Text>
          <Text style={[styles.remaining, { color: colors.mutedForeground }]}>
            {budget - spent >= 0
              ? `${formatCurrency(budget - spent, { compact: true })} left`
              : `${formatCurrency(spent - budget, { compact: true })} over`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  amount: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  track: {
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
    flexDirection: "row",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
  overflow: {
    height: "100%",
    opacity: 0.85,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  pct: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  remaining: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
