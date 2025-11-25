import ExercisesImporter from '@/components/pages/settings/sections/ExercisesImporter';
import { useState } from 'react';
import Profile from '../user/Profile';
import { Button } from '@/components/ui/button';

enum SettingsSection {
  Importer = 'importer',
  Profile = 'profile',
}

const settingsSections: {
  title: string;
  description: string;
  component: React.ReactNode;
  key: SettingsSection;
}[] = [
  {
    title: 'Profile',
    description: 'Manage your profile information.',
    component: <Profile />,
    key: SettingsSection.Profile,
  },
  {
    title: 'Importer',
    description: 'Import exercises from CSV or JSON files.',
    component: <ExercisesImporter />,
    key: SettingsSection.Importer,
  },
];

const Settings = () => {
  const [selectedSection, setSelectedSection] = useState<SettingsSection>(
    SettingsSection.Profile,
  );

  const isSelected = (key: SettingsSection) => selectedSection === key;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your application settings
        </p>
      </div>

      <div className="flex gap-4 flex-1/6">
        <div className="flex flex-col gap-2">
          {settingsSections.map((section) => (
            <Button
              variant={isSelected(section.key) ? 'default' : 'secondary'}
              onClick={() => setSelectedSection(section.key)}
            >
              {section.title}
            </Button>
          ))}
        </div>
        {settingsSections.map(
          (section) => selectedSection === section.key && section.component,
        )}
      </div>
    </div>
  );
};

export default Settings;
