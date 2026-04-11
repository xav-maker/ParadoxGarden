interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function SapIcon({ size = 16, color = '#3ecfa5' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1 C8 1 3 7 3 10.5 C3 13 5.2 15 8 15 C10.8 15 13 13 13 10.5 C13 7 8 1 8 1Z"
        fill={color} opacity={0.8} />
      <path d="M6.5 9 Q7 7.5 8 9.5" stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function TimeIcon({ size = 16, color = '#4de8c2' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M4 1 L12 1 L10 6 L12 6 L8 15 L9 9 L6.5 9 Z"
        fill={color} opacity={0.8} />
    </svg>
  );
}

export function HarmonyIcon({ size = 16, color = '#d4a843' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const px = 8 + Math.cos(angle) * 6;
        const py = 8 + Math.sin(angle) * 6;
        const cpx = 8 + Math.cos(angle + 0.3) * 3.5;
        const cpy = 8 + Math.sin(angle + 0.3) * 3.5;
        return (
          <path key={i} d={`M8,8 Q${cpx},${cpy} ${px},${py}`}
            stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />
        );
      })}
      <circle cx={8} cy={8} r={2} fill={color} opacity={0.9} />
    </svg>
  );
}

export function SowIcon({ size = 22, color = '#3ecfa5' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M11 18 L11 10" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <path d="M11 10 Q7 6 5 2" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M11 12 Q15 8 17 4" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <ellipse cx={4.5} cy={1.5} rx={2} ry={1.3} fill={color} opacity={0.6} transform="rotate(-30,4.5,1.5)" />
      <ellipse cx={17.5} cy={3.5} rx={2} ry={1.3} fill={color} opacity={0.5} transform="rotate(30,17.5,3.5)" />
    </svg>
  );
}

export function AlterTimeIcon({ size = 22, color = '#4de8c2' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <circle cx={11} cy={11} r={8} stroke={color} strokeWidth={1.5} opacity={0.6} />
      <line x1={11} y1={5} x2={11} y2={11} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={11} y1={11} x2={15} y2={13} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M17 5 L19 3 L18 6 Z" fill={color} opacity={0.7} />
    </svg>
  );
}

export function FreezeIcon({ size = 22, color = '#a8e0f7' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <line x1={11} y1={2} x2={11} y2={20} stroke={color} strokeWidth={1.5} />
      <line x1={3} y1={6.5} x2={19} y2={15.5} stroke={color} strokeWidth={1.5} />
      <line x1={3} y1={15.5} x2={19} y2={6.5} stroke={color} strokeWidth={1.5} />
      <circle cx={11} cy={11} r={2} fill={color} opacity={0.5} />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const ex = 11 + Math.cos(rad) * 9;
        const ey = 11 + Math.sin(rad) * 9;
        return <circle key={deg} cx={ex} cy={ey} r={1.2} fill={color} opacity={0.6} />;
      })}
    </svg>
  );
}

export function HarvestIcon({ size = 22, color = '#d4a843' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M8 4 Q11 0 14 4 Q17 8 11 12 Q5 8 8 4Z" fill={color} opacity={0.7} />
      <line x1={11} y1={12} x2={11} y2={20} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <path d="M9 16 L11 14 L13 16" fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

export function RootIcon({ size = 22, color = '#2d8f5e' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <line x1={11} y1={4} x2={11} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <path d="M11 12 Q8 16 5 20" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <path d="M11 12 Q14 16 17 20" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <path d="M11 14 L11 20" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <polygon points="11,2 8.5,6 13.5,6" fill={color} opacity={0.7} />
    </svg>
  );
}

export function SpreadIcon({ size = 22, color = '#7e8bc4' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <circle cx={11} cy={11} r={4} fill={color} opacity={0.6} />
      <circle cx={11} cy={11} r={7} stroke={color} strokeWidth={0.8} opacity={0.35} strokeDasharray="2 2" />
      <circle cx={11} cy={11} r={10} stroke={color} strokeWidth={0.6} opacity={0.2} strokeDasharray="1.5 3" />
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const ex = 11 + Math.cos(rad) * 7;
        const ey = 11 + Math.sin(rad) * 7;
        return <circle key={deg} cx={ex} cy={ey} r={1.5} fill={color} opacity={0.5} />;
      })}
    </svg>
  );
}

export const SPECIES_NAMES: Record<string, string> = {
  liane: 'Liane',
  moss: 'Mousse',
  void_flower: 'Fleur-Vide',
  echo_shroom: 'Champignon d\'Echo',
};

export const TIME_STATE_NAMES: Record<string, string> = {
  accelerated: 'Accelere',
  slowed: 'Ralenti',
  reversed: 'Inverse',
};
