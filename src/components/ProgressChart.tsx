import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Props = {
  values: number[];
  labels: string[];
};

export function ProgressChart({ values, labels }: Props) {
  const width = 320;
  const height = 190;
  const padding = 34;
  const min = 45;
  const max = 85;
  const points = values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / (values.length - 1);
    const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
    return { x, y, value, label: labels[index] };
  });
  const pointString = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <View style={styles.card}>
      <Text style={styles.title}>スコア推移</Text>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + line * ((height - padding * 2) / 3);
          return <Line key={line} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F4E7EE" strokeWidth="1" />;
        })}
        <Polyline points={pointString} fill="none" stroke={colors.pink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => (
          <React.Fragment key={point.label}>
            <Circle cx={point.x} cy={point.y} r="5" fill={colors.surface} stroke={colors.pink} strokeWidth="3" />
            <SvgText x={point.x} y={point.y - 12} fontSize="11" fontWeight="700" fill={colors.text} textAnchor="middle">{point.value}</SvgText>
            <SvgText x={point.x} y={height - 10} fontSize="10" fill={colors.muted} textAnchor="middle">{point.label}</SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
});
