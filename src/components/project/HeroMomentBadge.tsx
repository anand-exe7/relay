import { Flame, Star, Moon, Zap } from 'lucide-react';

interface HeroMomentBadgeProps {
  reason: string;
  className?: string;
}

export function HeroMomentBadge({ reason, className = '' }: HeroMomentBadgeProps) {
  const getIcon = () => {
    if (reason.includes('Late night')) return Moon;
    if (reason.includes('Massive')) return Star;
    if (reason.includes('Critical') || reason.includes('fix')) return Flame;
    return Zap;
  };

  const Icon = getIcon();
  const color = reason.includes('Late night')
    ? 'bg-amber/15 text-amber border-amber/30'
    : reason.includes('Massive')
    ? 'bg-coral/15 text-coral border-coral/30'
    : 'bg-terracotta/15 text-terracotta border-terracotta/30';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color} ${className}`}>
      <Icon className="w-3 h-3" />
      {reason.replace(/^[^\s]+\s/, '')}
    </span>
  );
}
