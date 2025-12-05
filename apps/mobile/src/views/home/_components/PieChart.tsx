import { Box } from '@gluestack-ui/themed';
import Svg, { Path, G } from 'react-native-svg';

const CHART_SIZE = 140;
const CHART_RADIUS = CHART_SIZE / 2;
const INNER_RADIUS = CHART_RADIUS * 0.6;

export interface PieSlice {
  color: string;
  percentage: number;
  label: string;
  amount: number;
}

interface PieChartProps {
  data: PieSlice[];
}

export function PieChart({ data }: PieChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.percentage === 0)) {
    return (
      <Box w={CHART_SIZE} h={CHART_SIZE} justifyContent="center" alignItems="center">
        <Box
          w={CHART_SIZE}
          h={CHART_SIZE}
          borderRadius={CHART_RADIUS}
          borderWidth={CHART_RADIUS - INNER_RADIUS}
          borderColor="$backgroundLight200"
          sx={{ _dark: { borderColor: '$backgroundDark700' } }}
        />
      </Box>
    );
  }

  let startAngle = -90;

  const createArcPath = (startAngleDeg: number, endAngleDeg: number, outerR: number, innerR: number) => {
    const startRad = (startAngleDeg * Math.PI) / 180;
    const endRad = (endAngleDeg * Math.PI) / 180;

    const x1 = CHART_RADIUS + outerR * Math.cos(startRad);
    const y1 = CHART_RADIUS + outerR * Math.sin(startRad);
    const x2 = CHART_RADIUS + outerR * Math.cos(endRad);
    const y2 = CHART_RADIUS + outerR * Math.sin(endRad);
    const x3 = CHART_RADIUS + innerR * Math.cos(endRad);
    const y3 = CHART_RADIUS + innerR * Math.sin(endRad);
    const x4 = CHART_RADIUS + innerR * Math.cos(startRad);
    const y4 = CHART_RADIUS + innerR * Math.sin(startRad);

    const largeArcFlag = endAngleDeg - startAngleDeg > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  const slices = data
    .filter((d) => d.percentage > 0)
    .map((slice) => {
      const angle = (slice.percentage / 100) * 360;
      const endAngle = startAngle + angle;
      const path = createArcPath(startAngle, endAngle - 0.5, CHART_RADIUS - 2, INNER_RADIUS);
      startAngle = endAngle;
      return { ...slice, path };
    });

  return (
    <Svg width={CHART_SIZE} height={CHART_SIZE}>
      <G>
        {slices.map((slice, index) => (
          <Path key={index} d={slice.path} fill={slice.color} />
        ))}
      </G>
    </Svg>
  );
}
