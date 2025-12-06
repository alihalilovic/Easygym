import { KeyboardShortcut } from '@/types/keyboard-shortcuts';
import { routes } from '@/lib/constants';

// Utility function to check if there's an active input element
export const hasActiveInput = (): boolean => {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isContentEditable = (activeElement as HTMLElement).isContentEditable;

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isContentEditable
  );
};

// Define all keyboard shortcuts for navigation
export const createNavigationShortcuts = (
  isUserClient: boolean,
  isUserTrainer: boolean,
  isAuthenticated: boolean
): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  // Non-authenticated shortcuts
  if (!isAuthenticated) {
    shortcuts.push(
      {
        keys: ['n', 'h'],
        label: 'Home',
        route: routes.Home,
        description: 'Go to Home page',
      },
      {
        keys: ['n', 'l'],
        label: 'Login',
        route: routes.Login,
        description: 'Go to Login page',
      },
      {
        keys: ['n', 'r'],
        label: 'Register',
        route: routes.Register,
        description: 'Go to Register page',
      }
    );
  }

  // Authenticated shortcuts
  if (isAuthenticated) {
    shortcuts.push(
      {
        keys: ['n', 'w'],
        label: 'Workouts',
        route: routes.Workouts,
        description: 'Go to Workouts page',
      },
      {
        keys: ['n', 'd', 'p'],
        label: 'Diet Plans',
        route: routes.DietPlans,
        description: 'Go to Diet Plans page',
      },
      {
        keys: ['n', 'e'],
        label: 'Exercises',
        route: routes.Exercises,
        description: 'Go to Exercises page',
      },
      {
        keys: ['n', 'i'],
        label: 'Invitations',
        route: routes.Invitations,
        description: 'Go to Invitations page',
      },
      {
        keys: ['n', 'p'],
        label: 'Profile',
        route: routes.Profile,
        description: 'Go to Profile page',
      },
      {
        keys: ['n', 's', 't'],
        label: 'Settings',
        route: routes.Settings,
        description: 'Go to Settings page',
      }
    );

    // Client-specific shortcuts
    if (isUserClient) {
      shortcuts.push(
        {
          keys: ['n', 's'],
          label: 'Sessions',
          route: routes.WorkoutSessions,
          description: 'Go to Workout Sessions page',
        },
        {
          keys: ['n', 'm', 't'],
          label: 'My Trainer',
          route: routes.MyTrainer,
          description: 'Go to My Trainer page',
        }
      );
    }

    // Trainer-specific shortcuts
    if (isUserTrainer) {
      shortcuts.push({
        keys: ['n', 'm', 'c'],
        label: 'My Clients',
        route: routes.MyClients,
        description: 'Go to My Clients page',
      });
    }
  }

  return shortcuts;
};

// Helper to format key sequence for display
export const formatKeySequence = (keys: string[]): string => {
  return keys.map((key) => key.toUpperCase()).join(' ');
};
