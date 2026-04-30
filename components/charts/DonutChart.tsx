import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

export type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
};

export default function DonutChart({
  data,
  size = 180,
  thickness = 22,
  centerLabel,
  centerValue,
}: Props) {
  const colors = useColors();
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = size / 2 - thickness / 2;
  const cx = size / 2;
  const cy = size / 2;

  let cumulative = 0;
  const slices = data.map((slice) => {
    const startAngle = (cumulative / Math.max(total, 1)) * Math.PI * 2;
    cumulative += slice.value;
    const endAngle = (cumulative / Math.max(total, 1)) * Math.PI * 2;
    return { ...slice, startAngle, endAngle };
  });

  function arcPath(sa: number, ea: number) {
    if (ea - sa <= 0) return "";
    if (ea - sa >= Math.PI * 2 - 0.001) {
      return `M ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius - 0.01} ${cy} Z`;
    }
    const x1 = cx + radius * Math.cos(sa - Math.PI / 2);
    const y1 = cy + radius * Math.sin(sa - Math.PI / 2);
    const x2 = cx + radius * Math.cos(ea - Math.PI / 2);
    const y2 = cy + radius * Math.sin(ea - Math.PI / 2);
    const large = ea - sa > Math.PI ? 1 : 0;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={colors.muted}
          strokeWidth={thickness}
          fill="none"
        />
        <G>
          {slices.map((s, i) =>
            total > 0 ? (
              <Path
                key={i}
                d={arcPath(s.startAngle, s.endAngle)}
                stroke={s.color}
                strokeWidth={thickness}
                fill="none"
                strokeLinecap="butt"
              />
            ) : null,
          )}
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {centerLabel ? (
          <Text style={[styles.centerLabel, { color: colors.mutedForeground }]}>
            {centerLabel}
          </Text>
        ) : null}
        {centerValue ? (
          <Text
            style={[styles.centerValue, { color: colors.foreground }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {centerValue}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  centerLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  centerValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
    paddingHorizontal: 8,
  },
});
