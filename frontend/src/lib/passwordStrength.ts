export enum PasswordStrength {
  Weak = 'weak',
  Fair = 'fair',
  Good = 'good',
  Strong = 'strong',
}

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-4
  feedback: string[];
}

export function calculatePasswordStrength(
  password: string,
): PasswordStrengthResult {
  if (!password) {
    return {
      strength: PasswordStrength.Weak,
      score: 0,
      feedback: ['Enter a password'],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('At least 8 characters');
  }

  if (password.length >= 12) {
    score++;
  }

  // Contains lowercase
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add lowercase letters');
  }

  // Contains uppercase
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add uppercase letters');
  }

  // Contains numbers
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Add numbers');
  }

  // Contains special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push('Add special characters');
  }

  // Normalize score to 0-4 range
  const normalizedScore = Math.min(Math.floor(score / 1.5), 4);

  let strength: PasswordStrength;
  if (normalizedScore <= 1) {
    strength = PasswordStrength.Weak;
  } else if (normalizedScore === 2) {
    strength = PasswordStrength.Fair;
  } else if (normalizedScore === 3) {
    strength = PasswordStrength.Good;
  } else {
    strength = PasswordStrength.Strong;
  }

  return {
    strength,
    score: normalizedScore,
    feedback: feedback.length > 0 ? feedback : ['Strong password!'],
  };
}
