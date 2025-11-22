import { useMemo } from 'react';
import {
  calculatePasswordStrength,
  PasswordStrength,
} from '@/lib/passwordStrength';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const strengthConfig: Record<
  PasswordStrength,
  { color: string; label: string; width: string }
> = {
  [PasswordStrength.Weak]: {
    color: 'bg-red-500',
    label: 'Weak',
    width: 'w-1/4',
  },
  [PasswordStrength.Fair]: {
    color: 'bg-orange-500',
    label: 'Fair',
    width: 'w-2/4',
  },
  [PasswordStrength.Good]: {
    color: 'bg-yellow-500',
    label: 'Good',
    width: 'w-3/4',
  },
  [PasswordStrength.Strong]: {
    color: 'bg-green-500',
    label: 'Strong',
    width: 'w-full',
  },
};

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const result = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) {
    return null;
  }

  const config = strengthConfig[result.strength];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${config.color} transition-all duration-300 ${config.width}`}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground min-w-[45px]">
          {config.label}
        </span>
      </div>

      {result.feedback.length > 0 && (
        <ul className="space-y-1">
          {result.feedback.map((item, index) => {
            const isPositive = item === 'Strong password!';
            return (
              <li
                key={index}
                className="flex items-start gap-1.5 text-xs text-muted-foreground"
              >
                {isPositive ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                )}
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
