import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

export type BarPoint = {
  label: string;
  value: number;
};

type Props = {
  data: BarPoint[];
  height?: number;
  color?: string;
};

export default function BarChart({ data, height = 160, color }: Props) {
  const colors = useColors();
  const fill = color ?? colors.foreground;

  const [width, setWidth] = React.useState(0);
  const padX = 4;
  const padY = 12;
  const labelH = 22;

  const usableW = Math.max(width - padX * 2, 1);
  const usableH = Math.max(height - padY * 2 - labelH, 1);

  const max = Math.max(...data.map((d) => d.value), 1);
  const slot = usableW / Math.max(data.length, 1);
  const barW = Math.max(slot * 0.55, 4);

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ width: "100%" }}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={fill} stopOpacity={1} />
              <Stop offset="1" stopColor={fill} stopOpacity={0.6} />
            </LinearGradient>
          </Defs>
          {data.map((d, i) => {
            const h = (d.value / max) * usableH;
            const x = padX + i * slot + (slot - barW) / 2;
            const y = padY + usableH - h;
            return (
              <Rect
                key={`${d.label}-${i}`}
                x={x}
                y={y}
                width={barW}
                height={Math.max(h, 2)}
                rx={4}
                fill="url(#barGrad)"
              />
            );
          })}
        </Svg>
      )}
      <View style={styles.labelsRow}>
        {data.map((d, i) => (
          <Text
            key={`${d.label}-${i}`}
            style={[
              styles.label,
              { color: colors.mutedForeground, width: width > 0 ? slot : 0 },
            ]}
            numberOfLines={1}
          >
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelsRow: {
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
});
