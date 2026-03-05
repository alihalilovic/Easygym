import { useState } from 'react';
import DietPlanCard from '@/components/pages/diet-plans/DietPlanCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { routes } from '@/lib/constants';
import { PlusCircleIcon, Search, Trash2 } from 'lucide-react';
import EmptyState from '@/components/ui/widgets/EmptyState';
import { useDietPlans } from '@/hooks/useDietPlans';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAdminDietPlans } from '@/hooks/useAdminDietPlans';
import adminService from '@/api/services/adminService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const DietPlans = () => {
  const navigate = useNavigate();
  const { isUserTrainer, isUserAdmin } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 5;

  const { data: dietPlans = [], isLoading: userLoading } = useDietPlans();
  const { data: adminResponse, isLoading: adminLoading } = useAdminDietPlans(
    page,
    pageSize,
    search,
    isUserAdmin
  );

  const adminDietPlans = adminResponse?.items ?? [];
  const totalPages = Math.ceil((adminResponse?.totalCount ?? 0) / pageSize);
  const isLoading = isUserAdmin ? adminLoading : userLoading;

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateDietPlan = () => {
    navigate(routes.CreateDietPlan);
  };

  const handleDeleteDietPlan = async () => {
    if (deleteId == null) return;

    try {
      setIsDeleting(true);
      await adminService.deleteDietPlan(deleteId);
      toast.success('Diet plan deleted.');
      setDeleteId(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete diet plan.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  if (isUserAdmin) {
    const hasData = adminDietPlans.length > 0;

    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Diet Plans</h2>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by diet plan, trainer or client..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {hasData ? (
          <>
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">Diet Plan</th>
                    <th className="px-6 py-3 text-left">Trainer</th>
                    <th className="px-6 py-3 text-left">Client</th>
                    <th className="px-6 py-3 text-left">Created</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {adminDietPlans.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-medium">{d.name}</td>
                      <td className="px-6 py-4">{d.trainerName}</td>
                      <td className="px-6 py-4">{d.clientName}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Dialog
                          open={deleteId === d.id}
                          onOpenChange={(open) => setDeleteId(open ? d.id : null)}
                        >
                          <Button variant="destructive" size="sm" asChild>
                            <DialogTrigger>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DialogTrigger>
                          </Button>

                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete diet plan?</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{d.name}"? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteDietPlan}
                                disabled={isDeleting}
                              >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                              </Button>
                              <DialogClose asChild>
                                <Button variant="outline" disabled={isDeleting}>
                                  Cancel
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.max(totalPages, 1)}
              </span>

              <Button
                variant="outline"
                disabled={page >= totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <EmptyState
            title="No diet plans found"
            description="No diet plans match your search."
            buttonText=""
            buttonAction={() => {}}
            buttonIcon={undefined}
          />
        )}
      </div>
    );
  }

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

      {dietPlans.length === 0 && !userLoading && (
        <EmptyState
          title="No diet plans yet"
          description={
            isUserTrainer
              ? 'Create your first diet plan to help your clients achieve their nutrition goals.'
              : 'Your trainer has not created a diet plan for you yet.'
          }
          buttonText={isUserTrainer ? 'Create Your First Diet Plan' : ''}
          buttonAction={isUserTrainer ? handleCreateDietPlan : () => {}}
          buttonIcon={isUserTrainer ? <PlusCircleIcon className="h-4 w-4" /> : undefined}
        />
      )}
    </div>
  );
};

export default DietPlans;