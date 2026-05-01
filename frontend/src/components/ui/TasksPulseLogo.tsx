import React from "react";
import Svg, { Rect, Line, Path } from "react-native-svg";

interface TasksPulseLogoProps {
  size?: number;
}

export const TasksPulseLogo: React.FC<TasksPulseLogoProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Rect x="2" y="2" width="60" height="60" rx="14" stroke="#2563EB" strokeWidth="4" />
    <Line x1="2" y1="18" x2="62" y2="18" stroke="#2563EB" strokeWidth="4" />
    <Path
      d="M14 40 L26 40 L34 28 L42 46 L50 40"
      stroke="#14B8A6"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
