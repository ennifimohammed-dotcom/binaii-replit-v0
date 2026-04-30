import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  detail?: string;
  action?: React.ReactNode;
};

export default function Empty({ icon = "inbox", title, detail, action }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.muted },
        ]}
      >
        <Feather name={icon} size={24} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {detail ? (
        <Text style={[styles.detail, { color: colors.mutedForeground }]}>
          {detail}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: 16 }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  detail: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 18,
  },
});
