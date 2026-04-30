import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Circle,
  Line as SvgLine,
} from "react-native-svg";

import { useColors } from "@/hooks/useColors";

export type LinePoint = {
  label: string;
  value: number;
};

type Props = {
  data: LinePoint[];
  height?: number;
  color?: string;
  showLabels?: boolean;
  highlightLast?: boolean;
};

export default function LineChart({
  data,
  height = 160,
  color,
  showLabels = true,
  highlightLast = true,
}: Props) {
  const colors = useColors();
  const stroke = color ?? colors.accent;

  const [width, setWidth] = React.useState(0);
  const padX = 8;
  const padY = 16;

  const usableW = Math.max(width - padX * 2, 1);
  const usableH = Math.max(height - padY * 2 - (showLabels ? 18 : 0), 1);

  const max = Math.max(...data.map((d) => d.value), 1);

  const pts = data.map((d, i) => {
    const x = padX + (data.length === 1 ? usableW / 2 : (i / (data.length - 1)) * usableW);
    const y = padY + usableH - (d.value / max) * usableH;
    return { x, y };
  });

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = pts.length
    ? `${linePath} L ${pts[pts.length - 1]!.x.toFixed(1)} ${(padY + usableH).toFixed(1)} L ${pts[0]!.x.toFixed(1)} ${(padY + usableH).toFixed(1)} Z`
    : "";

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ width: "100%" }}
    >
      {width > 0 && (
        <Svg width={width} height={height + (showLabels ? 18 : 0)}>
          <Defs>
            <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={stroke} stopOpacity={0.28} />
              <Stop offset="1" stopColor={stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {[0.25, 0.5, 0.75].map((g) => (
            <SvgLine
              key={g}
              x1={padX}
              x2={width - padX}
              y1={padY + usableH * g}
              y2={padY + usableH * g}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="3 5"
              opacity={0.5}
            />
          ))}

          {pts.length > 1 && <Path d={areaPath} fill="url(#lineGrad)" />}

          {pts.length > 1 && (
            <Path
              d={linePath}
              stroke={stroke}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {highlightLast && pts.length > 0 && (
            <>
              <Circle
                cx={pts[pts.length - 1]!.x}
                cy={pts[pts.length - 1]!.y}
                r={6}
                fill={colors.background}
                stroke={stroke}
                strokeWidth={2.5}
              />
            </>
          )}
        </Svg>
      )}
      {showLabels && (
        <View style={styles.labelsRow}>
          {data.map((d, i) =>
            i % Math.max(1, Math.floor(data.length / 5)) === 0 ||
            i === data.length - 1 ? (
              <Text
                key={`${d.label}-${i}`}
                style={[styles.label, { color: colors.mutedForeground }]}
              >
                {d.label}
              </Text>
            ) : null,
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
