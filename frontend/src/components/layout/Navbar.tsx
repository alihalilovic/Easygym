import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { routes } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Calendar,
  Home,
  LogIn,
  LogOut,
  Menu,
  User,
  Dumbbell,
  UserPlus,
  Mail,
  Users,
  BookOpen,
  Settings as SettingsIcon,
  UtensilsCrossed,
} from 'lucide-react';
import clsx from 'clsx';

interface NavbarLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const Navbar = () => {
  const { userId, isUserClient, isUserTrainer, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const nonAuthLinks: NavbarLink[] = [
    {
      to: routes.Home,
      label: 'Home',
      icon: <Home />,
    },
    {
      to: routes.Login,
      label: 'Login',
      icon: <LogIn />,
    },
    {
      to: routes.Register,
      label: 'Register',
      icon: <UserPlus />,
    },
  ];

  const authLinks: NavbarLink[] = [
    {
      to: routes.Workouts,
      label: 'Workouts',
      icon: <Dumbbell />,
    },
    {
      to: routes.DietPlans,
      label: 'Diet Plans',
      icon: <UtensilsCrossed />,
    },
    {
      to: routes.Exercises,
      label: 'Exercises',
      icon: <BookOpen />,
    },
    {
      to: routes.Invitations,
      label: 'Invitations',
      icon: <Mail />,
    },
    {
      to: routes.Profile,
      label: 'Profile',
      icon: <User />,
    },
    {
      to: routes.Settings,
      label: 'Settings',
      icon: <SettingsIcon />,
    },
  ];

  const clientSpecificLinks: NavbarLink[] = [
    {
      to: routes.WorkoutSessions,
      label: 'Sessions',
      icon: <Calendar />,
    },
    {
      to: routes.MyTrainer,
      label: 'My Trainer',
      icon: <User />,
    },
  ];

  const trainerSpecificLinks: NavbarLink[] = [
    {
      to: routes.MyClients,
      label: 'My Clients',
      icon: <Users />,
    },
  ];

  const allLinks: NavbarLink[] = [
    ...(!userId ? nonAuthLinks : []),
    ...(isUserClient ? clientSpecificLinks : []),
    ...(isUserTrainer ? trainerSpecificLinks : []),
    ...(userId ? authLinks : []),
    ...(userId
      ? [
          {
            to: routes.Logout,
            label: 'Logout',
            icon: <LogOut />,
            onClick: logout,
          },
        ]
      : []),
  ];

  const handleLinkClick = (link: NavbarLink) => {
    setIsOpen(false);
    if (link.onClick) link.onClick();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="flex items-center justify-between min-h-9 font-bold mb-4 mr-12">
      <NavLink to={routes.Home}>
        <h1
          onClick={() => navigate(routes.Home)}
          className="text-2xl uppercase cursor-pointer"
        >
          Easygym
        </h1>
      </NavLink>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="h-9 w-9"
        >
          <Menu />
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
            {allLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={clsx([
                  'block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                  link.label === 'Logout' ? 'text-destructive' : '',
                ])}
                onClick={() => handleLinkClick(link)}
              >
                <span className="flex items-center gap-2">
                  {link.icon} {link.label}
                </span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
