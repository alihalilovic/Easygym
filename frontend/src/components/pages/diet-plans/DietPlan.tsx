import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormWrapper from '@/components/ui/widgets/FormWrapper';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DietPlan, DietPlanDay, Meal } from '@/types/DietPlan';
import { routes } from '@/lib/constants';
import { useNavigate, useParams } from 'react-router';
import {
  Dialog,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  useDietPlan,
  useCreateDietPlan,
  useUpdateDietPlan,
  useDeleteDietPlan,
  useAssignDietPlan,
  useUnassignDietPlan,
  useUpdateAssignmentActive,
} from '@/hooks/useDietPlans';
import { useMyClients } from '@/hooks/useConnections';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trash2,
  Plus,
  UserPlus,
  UserMinus,
  UtensilsCrossed,
  FileText,
  StickyNote,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { MealTrackingSection } from './MealTrackingSection';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DietPlanForm = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { isUserTrainer } = useAuth();
  const { data: myClients = [] } = useMyClients();

  const dietPlanId = useMemo(() => parseInt(params.id as string), [params.id]);

  // Determine if we're in view mode (not /edit or /create)
  const isViewMode = useMemo(() => {
    const path = window.location.pathname;
    return dietPlanId && !path.includes('/edit') && !path.includes('/create');
  }, [dietPlanId]);

  // Determine if it's read-only (client viewing or view mode)
  const isReadOnly = !isUserTrainer || isViewMode;

  const formNameText = useMemo(() => {
    if (isViewMode) return 'View diet plan';
    return dietPlanId ? 'Update diet plan' : 'Create diet plan';
  }, [dietPlanId, isViewMode]);

  const createDietPlan = useCreateDietPlan();
  const updateDietPlan = useUpdateDietPlan();
  const deleteDietPlan = useDeleteDietPlan();
  const assignDietPlan = useAssignDietPlan();
  const unassignDietPlan = useUnassignDietPlan();
  const updateAssignmentActive = useUpdateAssignmentActive();

  const [days, setDays] = useState<
    (Omit<DietPlanDay, 'id'> & { meals: Omit<Meal, 'id'>[] })[]
  >(
    // Initialize all 7 days with empty meals
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      meals: [],
    })),
  );

  // For editing, fetch the diet plan by ID
  const { data: existingDietPlan } = useDietPlan(dietPlanId, !!dietPlanId);

  const mealFormSchema = z.object({
    name: z.string().min(1, { message: 'Meal name is required' }),
    description: z.string().optional(),
    mealType: z.string().min(1, { message: 'Meal type is required' }),
    notes: z.string().optional(),
  });

  const dietPlanFormSchema = z.object({
    name: z.string().min(1, { message: 'Diet plan name is required' }),
  });

  const dietPlanForm = useForm<z.infer<typeof dietPlanFormSchema>>({
    resolver: zodResolver(dietPlanFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [mealFormOpen, setMealFormOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<{
    meal: Omit<Meal, 'id'>;
    dayIndex: number;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<'plan' | 'tracking'>(
    'plan',
  );

  const mealForm = useForm<z.infer<typeof mealFormSchema>>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      name: '',
      description: '',
      mealType: 'Breakfast',
      notes: '',
    },
  });

  // Helper function to populate the form with diet plan data
  const populateFormCached = useCallback(
    (dietPlanData: DietPlan | undefined) => {
      dietPlanForm.setValue('name', dietPlanData?.name || '');

      if (dietPlanData?.days?.length) {
        const sortedDays = [...dietPlanData.days].sort(
          (a, b) => a.dayOfWeek - b.dayOfWeek,
        );
        setDays(sortedDays);
      }
    },
    [dietPlanForm],
  );

  useEffect(() => {
    if (!dietPlanId || !existingDietPlan) return;
    populateFormCached(existingDietPlan);
  }, [dietPlanId, existingDietPlan, populateFormCached]);

  const addMeal = (data: z.infer<typeof mealFormSchema>) => {
    const newDays = [...days];
    newDays[currentDayIndex].meals.push(data);
    setDays(newDays);
    mealForm.reset();
    setMealFormOpen(false);
    toast.success('Meal added');
  };

  const removeMeal = (dayIndex: number, mealIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].meals.splice(mealIndex, 1);
    setDays(newDays);
    toast.success('Meal removed');
  };

  const onSubmit = async (data: z.infer<typeof dietPlanFormSchema>) => {
    // Validate that each day has at least 1 meal and max 10 meals
    const invalidDays = days.filter(
      (day) => day.meals.length < 1 || day.meals.length > 10,
    );

    if (invalidDays.length > 0) {
      toast.error('Each day must have between 1 and 10 meals');
      return;
    }

    const dietPlanData = {
      ...data,
      days,
    };

    if (!dietPlanId) {
      await createDietPlan.mutateAsync(dietPlanData);
    } else {
      await updateDietPlan.mutateAsync({
        dietPlanId,
        dietPlan: dietPlanData,
      });
    }

    toast.success(
      `Diet plan ${dietPlanId ? 'updated' : 'created'} successfully`,
    );
    navigate(routes.DietPlans);
  };

  const handleAddMeal = (dayIndex: number) => {
    if (days[dayIndex].meals.length >= 10) {
      toast.error('Maximum 10 meals per day');
      return;
    }
    setCurrentDayIndex(dayIndex);
    setMealFormOpen(true);
  };

  const handleDeleteDietPlan = async () => {
    await deleteDietPlan.mutateAsync(dietPlanId);
    toast.success('Diet plan deleted successfully');
    navigate(routes.DietPlans);
  };

  const handleAssignToClient = async (clientId: number, isActive: boolean) => {
    if (!dietPlanId) return;

    await assignDietPlan.mutateAsync({
      dietPlanId,
      clientIds: [clientId],
      isActive,
    });

    toast.success('Diet plan assigned successfully');
  };

  const handleUnassignFromClient = async (clientId: number) => {
    if (!dietPlanId) return;

    await unassignDietPlan.mutateAsync({ dietPlanId, clientId });
    toast.success('Diet plan unassigned successfully');
  };

  const handleToggleActive = async (clientId: number, isActive: boolean) => {
    if (!dietPlanId) return;

    await updateAssignmentActive.mutateAsync({
      dietPlanId,
      clientId,
      isActive,
    });

    toast.success(
      isActive
        ? 'Diet plan activated for client'
        : 'Diet plan deactivated for client',
    );
  };

  // Only block access if trying to create or edit without being a trainer
  if (!isUserTrainer && !isViewMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          Only trainers can create and edit diet plans.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-3xl font-bold tracking-tight">{formNameText}</h2>
          <p className="text-muted-foreground mt-1">
            {isViewMode
              ? 'Review your diet plan details and meals for each day'
              : dietPlanId
              ? 'Modify your diet plan details and meals'
              : 'Create a new diet plan with meals for each day of the week'}
          </p>

          {isViewMode && (
            <div className="flex gap-2 mt-4">
              <Button
                variant={activeSection === 'plan' ? 'default' : 'outline'}
                onClick={() => setActiveSection('plan')}
              >
                Meal Plan
              </Button>
              <Button
                variant={activeSection === 'tracking' ? 'default' : 'outline'}
                onClick={() => setActiveSection('tracking')}
              >
                Track Meals
              </Button>
            </div>
          )}
        </div>

        <div className="p-6">
          {isViewMode && activeSection === 'tracking' ? (
            <MealTrackingSection readOnly={isUserTrainer} />
          ) : (
            <Form {...dietPlanForm}>
              <FormWrapper
                className="w-full space-y-6"
                onSubmit={dietPlanForm.handleSubmit(onSubmit)}
              >
                <FormField
                  control={dietPlanForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Diet Plan Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., High Protein Meal Plan"
                          className="h-11"
                          disabled={!!isReadOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6 w-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-1 bg-primary rounded-full" />
                    <h3 className="text-2xl font-bold">Weekly Meal Plan</h3>
                  </div>

                  <div className="space-y-4">
                    {days.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="group relative border-2 border-border/40 rounded-xl p-5 bg-accent/20 hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {/* Day header with gradient background */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                              {dayIndex + 1}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold tracking-tight">
                                {DAYS_OF_WEEK[dayIndex]}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {day.meals.length}{' '}
                                {day.meals.length === 1 ? 'meal' : 'meals'}
                              </p>
                            </div>
                          </div>
                          {!isReadOnly && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleAddMeal(dayIndex)}
                              disabled={day.meals.length >= 10}
                              className="shadow-sm"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Meal
                            </Button>
                          )}
                        </div>

                        {/* Meals list */}
                        {day.meals.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 px-4 rounded-lg border-2 border-dashed border-border/50 bg-background/50">
                            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground font-medium">
                              {isReadOnly
                                ? 'No meals planned for this day'
                                : 'Start by adding your first meal'}
                            </p>
                            {!isReadOnly && (
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                At least 1 meal required
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {day.meals.map((meal, mealIndex) => (
                              <div
                                key={mealIndex}
                                className="group/meal relative flex items-center gap-4 bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border/50 hover:border-primary/40 hover:bg-accent/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                                onClick={() =>
                                  setSelectedMeal({ meal, dayIndex })
                                }
                              >
                                {/* Meal icon */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                  <UtensilsCrossed className="h-6 w-6 text-primary" />
                                </div>

                                {/* Meal content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-semibold text-base truncate">
                                      {meal.name}
                                    </h5>
                                    <span className="flex-shrink-0 text-xs font-medium bg-primary/15 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                                      {meal.mealType}
                                    </span>
                                  </div>
                                  {meal.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                      {meal.description}
                                    </p>
                                  )}
                                  {meal.notes && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <StickyNote className="h-3 w-3 text-muted-foreground/60" />
                                      <p className="text-xs text-muted-foreground/80 italic line-clamp-1">
                                        {meal.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Delete button */}
                                {!isReadOnly && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="flex-shrink-0 opacity-0 group-hover/meal:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeMeal(dayIndex, mealIndex);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  {!isReadOnly && (
                    <>
                      <Button
                        type="submit"
                        disabled={
                          createDietPlan.isPending || updateDietPlan.isPending
                        }
                      >
                        {dietPlanId ? 'Update' : 'Create'} Diet Plan
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(routes.DietPlans)}
                      >
                        Cancel
                      </Button>
                      {dietPlanId && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button type="button" variant="destructive">
                              Delete Diet Plan
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Diet Plan</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this diet plan?
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteDietPlan}
                                disabled={deleteDietPlan.isPending}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </>
                  )}
                  {isReadOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(routes.DietPlans)}
                    >
                      Back to Diet Plans
                    </Button>
                  )}
                </div>
              </FormWrapper>
            </Form>
          )}
        </div>
      </div>

      {/* Assignment Management Section - Only show when editing */}
      {dietPlanId && existingDietPlan && myClients.length > 0 && (
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold tracking-tight">
              Client Assignments
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage which clients have access to this diet plan
            </p>
          </div>

          <div className="p-6 space-y-4">
            {myClients.map((clientConnection) => {
              const assignment = existingDietPlan.assignments?.find(
                (a) => a.clientId === clientConnection.client.id,
              );
              const isAssigned = !!assignment;

              return (
                <div
                  key={clientConnection.client.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-accent/10"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">
                        {clientConnection.client.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {clientConnection.client.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAssigned && (
                      <>
                        <div className="flex items-center gap-2 mr-2">
                          <Checkbox
                            id={`active-${clientConnection.client.id}`}
                            checked={assignment.isActive}
                            onCheckedChange={(checked) =>
                              handleToggleActive(
                                clientConnection.client.id,
                                checked === true,
                              )
                            }
                          />
                          <label
                            htmlFor={`active-${clientConnection.client.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            Active
                          </label>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUnassignFromClient(clientConnection.client.id)
                          }
                          disabled={unassignDietPlan.isPending}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Unassign
                        </Button>
                      </>
                    )}
                    {!isAssigned && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleAssignToClient(
                            clientConnection.client.id,
                            false,
                          )
                        }
                        disabled={assignDietPlan.isPending}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Meal Form Dialog */}
      <Dialog open={mealFormOpen} onOpenChange={setMealFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Meal - {DAYS_OF_WEEK[currentDayIndex]}
            </DialogTitle>
          </DialogHeader>
          <Form {...mealForm}>
            <form
              onSubmit={mealForm.handleSubmit(addMeal)}
              className="space-y-4"
            >
              <FormField
                control={mealForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Grilled Chicken Salad"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={mealForm.control}
                name="mealType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Breakfast">Breakfast</SelectItem>
                        <SelectItem value="Lunch">Lunch</SelectItem>
                        <SelectItem value="Dinner">Dinner</SelectItem>
                        <SelectItem value="Snack">Snack</SelectItem>
                        <SelectItem value="Pre-Workout">Pre-Workout</SelectItem>
                        <SelectItem value="Post-Workout">
                          Post-Workout
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={mealForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the meal..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={mealForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes or instructions..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMealFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Meal</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Meal Details Dialog */}
      <Dialog
        open={selectedMeal !== null}
        onOpenChange={(open) => !open && setSelectedMeal(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              {selectedMeal?.meal.name}
            </DialogTitle>
            <DialogDescription>
              {DAYS_OF_WEEK[selectedMeal?.dayIndex ?? 0]}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                {selectedMeal?.meal.mealType}
              </span>
            </div>

            {selectedMeal?.meal.description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Description
                </div>
                <p className="text-sm bg-accent/30 rounded-lg p-3">
                  {selectedMeal.meal.description}
                </p>
              </div>
            )}

            {selectedMeal?.meal.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <StickyNote className="h-4 w-4" />
                  Notes
                </div>
                <p className="text-sm bg-accent/30 rounded-lg p-3 italic">
                  {selectedMeal.meal.notes}
                </p>
              </div>
            )}

            {!selectedMeal?.meal.description && !selectedMeal?.meal.notes && (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                No additional details for this meal.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMeal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DietPlanForm;
