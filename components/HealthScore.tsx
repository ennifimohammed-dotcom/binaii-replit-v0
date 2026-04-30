import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { useColors } from "@/hooks/useColors";
import { HealthScore as HealthScoreType } from "@/lib/insights";

type Props = {
  score: HealthScoreType;
  size?: number;
};

export default function HealthScore({ score, size = 96 }: Props) {
  const colors = useColors();

  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score.score / 100;

  const tone =
    score.score >= 80
      ? colors.success
      : score.score >= 60
        ? colors.accent
        : score.score >= 40
          ? colors.warning
          : colors.destructive;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="hsGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={tone} stopOpacity={1} />
            <Stop offset="1" stopColor={tone} stopOpacity={0.6} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.muted}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#hsGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${circumference * (1 - progress)}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.scoreText, { color: colors.foreground }]}>
          {score.score}
        </Text>
        <Text style={[styles.scoreSub, { color: colors.mutedForeground }]}>
          /100
        </Text>
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
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  scoreSub: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    marginTop: -2,
  },
});
