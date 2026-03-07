import { useState } from "react";
import { useDeletedUsers, useRestoreUser } from "@/hooks/useDeletedUsers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, RotateCcw } from "lucide-react";
import Loader from "@/components/ui/widgets/Loader";

const Restore = () => {
  const { data: users = [], isLoading } = useDeletedUsers();
  const restoreMutation = useRestoreUser();

  const [confirmRestoreId, setConfirmRestoreId] = useState<number | null>(null);

  const handleRestore = () => {
    if (confirmRestoreId) {
      restoreMutation.mutate(confirmRestoreId);
      setConfirmRestoreId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Deleted Users</CardTitle>
          <CardDescription>
            Restore users that were deleted from the system
          </CardDescription>
        </CardHeader>

        <CardContent>

          {users.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No deleted users found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">

              <table className="min-w-full text-sm">

                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Deleted At</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/40">

                      <td className="px-6 py-4 font-medium">
                        {user.name}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {user.email}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {user.deletedAt
                          ? new Date(user.deletedAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="px-6 py-4 text-right">

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmRestoreId(user.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </Button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </CardContent>
      </Card>

      <Dialog open={confirmRestoreId !== null} onOpenChange={() => setConfirmRestoreId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore user?</DialogTitle>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRestoreId(null)}>
              Cancel
            </Button>

            <Button onClick={handleRestore} disabled={restoreMutation.isPending}>
              {restoreMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Restore;