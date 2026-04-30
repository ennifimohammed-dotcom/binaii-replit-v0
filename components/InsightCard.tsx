import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Insight } from "@/lib/insights";

type Props = {
  insight: Insight;
};

export default function InsightCard({ insight }: Props) {
  const colors = useColors();
  const tone =
    insight.kind === "warning"
      ? colors.destructive
      : insight.kind === "positive"
        ? colors.success
        : insight.kind === "info"
          ? colors.accent
          : colors.foreground;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: tone + "1F" }]}>
        <Feather name={insight.icon} size={18} color={tone} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {insight.title}
        </Text>
        <Text style={[styles.detail, { color: colors.mutedForeground }]}>
          {insight.detail}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  detail: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
});
