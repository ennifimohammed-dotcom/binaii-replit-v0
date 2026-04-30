import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  title: string;
  action?: { label: string; onPress: () => void };
};

export default function SectionHeader({ title, action }: Props) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={[styles.action, { color: colors.accent }]}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  action: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
