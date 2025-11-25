import DietPlanCard from '@/components/pages/diet-plans/DietPlanCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { routes } from '@/lib/constants';
import { PlusCircleIcon } from 'lucide-react';
import EmptyState from '@/components/ui/widgets/EmptyState';
import { useDietPlans } from '@/hooks/useDietPlans';
import { useAuth } from '@/components/auth/AuthProvider';

const DietPlans = () => {
  const { data: dietPlans = [], isLoading } = useDietPlans();
  const navigate = useNavigate();
  const { isUserTrainer } = useAuth();

  const handleCreateDietPlan = () => {
    navigate(routes.CreateDietPlan);
  };

  return (
    <div className="flex flex-col gap-2">
      {dietPlans.length > 0 && (
        <div className="flex flex-col gap-2">
          {isUserTrainer && (
            <Button className="self-start" onClick={handleCreateDietPlan}>
              Create Diet Plan
            </Button>
          )}
          <div className="diet-plan-card-wrapper">
            {dietPlans.map((dietPlan) => (
              <DietPlanCard key={dietPlan.id} dietPlan={dietPlan} />
            ))}
          </div>
        </div>
      )}
      {dietPlans.length === 0 && !isLoading && (
        <EmptyState
          title="No diet plans yet"
          description={
            isUserTrainer
              ? 'Create your first diet plan to help your clients achieve their nutrition goals.'
              : 'Your trainer has not created a diet plan for you yet.'
          }
          buttonText={isUserTrainer ? 'Create Your First Diet Plan' : ''}
          buttonAction={isUserTrainer ? handleCreateDietPlan : () => {}}
          buttonIcon={
            isUserTrainer ? <PlusCircleIcon className="h-4 w-4" /> : undefined
          }
        />
      )}
    </div>
  );
};

export default DietPlans;
