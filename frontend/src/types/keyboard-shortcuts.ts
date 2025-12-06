export interface KeyboardShortcut {
  keys: string[];
  label: string;
  route: string;
  description?: string;
}

export interface KeySequence {
  keys: string[];
  timestamp: number;
}
