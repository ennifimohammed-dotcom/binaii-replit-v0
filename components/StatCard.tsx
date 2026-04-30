import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  icon?: keyof typeof Feather.glyphMap;
  iconColor?: string;
  style?: ViewStyle;
};

export default function StatCard({
  label,
  value,
  delta,
  icon,
  iconColor,
  style,
}: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        {icon ? (
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: (iconColor ?? colors.accent) + "22" },
            ]}
          >
            <Feather
              name={icon}
              size={14}
              color={iconColor ?? colors.accent}
            />
          </View>
        ) : null}
      </View>
      <Text
        style={[styles.value, { color: colors.foreground }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {delta ? (
        <View style={styles.deltaRow}>
          <Feather
            name={delta.positive ? "arrow-up-right" : "arrow-down-right"}
            size={12}
            color={delta.positive ? colors.destructive : colors.success}
          />
          <Text
            style={[
              styles.delta,
              {
                color: delta.positive ? colors.destructive : colors.success,
              },
            ]}
          >
            {delta.value}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 120,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 10,
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  delta: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
