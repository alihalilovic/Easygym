import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  createNavigationShortcuts,
  hasActiveInput,
} from '@/lib/keyboard-shortcuts';
import { KeyboardShortcut } from '@/types/keyboard-shortcuts';
import KeyboardShortcutDisplay from './KeyboardShortcutDisplay';
import ShortcutsHelp from './ShortcutsHelp';

interface KeyboardShortcutProviderProps {
  children: React.ReactNode;
}

const DISPLAY_AFTER_NAV_DURATION = 1000; // 1 second to show keys after navigation

const KeyboardShortcutProvider = ({
  children,
}: KeyboardShortcutProviderProps) => {
  const navigate = useNavigate();
  const { userId, isUserClient, isUserTrainer } = useAuth();
  const [currentKeys, setCurrentKeys] = useState<string[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showDisplay, setShowDisplay] = useState(false);
  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const shortcuts = createNavigationShortcuts(
    isUserClient,
    isUserTrainer,
    !!userId,
  );

  const clearSequence = useCallback(() => {
    setCurrentKeys([]);
    setShowDisplay(false);
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
  }, []);

  const findMatchingShortcut = useCallback(
    (keys: string[]): KeyboardShortcut | null => {
      return (
        shortcuts.find(
          (shortcut) =>
            shortcut.keys.length === keys.length &&
            shortcut.keys.every((key, index) => key === keys[index]),
        ) || null
      );
    },
    [shortcuts],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if there's an active input element
      if (hasActiveInput()) {
        return;
      }

      // Check for Shift + ? to open help
      if (event.shiftKey && event.key === '?') {
        event.preventDefault();
        setIsHelpOpen(true);
        clearSequence();
        return;
      }

      // Check for Escape to cancel sequence
      if (event.key === 'Escape' || event.key === 'Enter') {
        event.preventDefault();
        clearSequence();
        return;
      }

      // Ignore if any modifier key is pressed (except for Shift+?)
      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.key === 'Shift'
      ) {
        return;
      }

      event.preventDefault();

      const key = event.key.toLowerCase();
      const newKeys = [...currentKeys, key];

      // Update the current keys
      setCurrentKeys(newKeys);
      setShowDisplay(true);

      // Clear any existing timers
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current);
      }

      // Check for exact match
      const matchedShortcut = findMatchingShortcut(newKeys);
      if (matchedShortcut) {
        // Navigate to the matched route
        navigate(matchedShortcut.route);
      }

      // Keep the display visible for a moment after navigation
      sequenceTimerRef.current = setTimeout(() => {
        clearSequence();
      }, DISPLAY_AFTER_NAV_DURATION);
    },
    [currentKeys, clearSequence, findMatchingShortcut, navigate],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      {children}
      <KeyboardShortcutDisplay keys={currentKeys} isVisible={showDisplay} />
      <ShortcutsHelp
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        shortcuts={shortcuts}
      />
    </>
  );
};

export default KeyboardShortcutProvider;
