import { Button } from '@/components/ui/button';

const EmptyState = ({
  title,
  description,
  buttonText,
  buttonAction,
  buttonIcon,
}: {
  title: string;
  description: string;
  buttonText?: string;
  buttonAction: () => void;
  buttonIcon: React.ReactNode;
}) => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center p-8 border rounded-md text-center">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        {buttonText && (
          <Button onClick={buttonAction}>
            {buttonIcon}
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
