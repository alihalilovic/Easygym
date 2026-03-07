import { useEffect, useState } from "react";
import adminService from "@/api/services/adminService";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { DatabaseBackup, RotateCcw, Loader2 } from "lucide-react";
import Loader from "@/components/ui/widgets/Loader";

const AdminBackup = () => {
  const [backups, setBackups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  const loadBackups = async () => {
    const data = await adminService.getBackups();
    setBackups(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleBackup = async () => {
    setCreatingBackup(true);
    await adminService.backupDatabase();
    await loadBackups();
    setCreatingBackup(false);
  };

  const handleRestore = async () => {
    if (!confirmRestore) return;

    await adminService.restoreDatabase(confirmRestore);
    setConfirmRestore(null);
  };

  const formatDate = (file: string) => {
    const parts = file.split(".");
    const raw = parts[parts.length - 1];

    const year = raw.substring(0, 4);
    const month = raw.substring(4, 6);
    const day = raw.substring(6, 8);
    const hour = raw.substring(9, 11);
    const min = raw.substring(11, 13);

    return `${day}.${month}.${year} ${hour}:${min}`;
  };

  if (loading) {
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
          <CardTitle>Database Backup</CardTitle>
          <CardDescription>
            Create database backups and restore previous versions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          <Button
            onClick={handleBackup}
            disabled={creatingBackup}
          >
            {creatingBackup ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <DatabaseBackup className="h-4 w-4 mr-2" />
            )}
            Create Backup
          </Button>

          {backups.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No backups found.
            </div>
          ) : (

            <div className="overflow-x-auto rounded-lg border">

              <table className="min-w-full text-sm">

                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Backup File</th>
                    <th className="px-6 py-3 text-left">Created</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {backups.map((backup) => (

                    <tr key={backup} className="hover:bg-muted/40">

                      <td className="px-6 py-4 font-medium">
                        {backup}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(backup)}
                      </td>

                      <td className="px-6 py-4 text-right">

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmRestore(backup)}
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

      <Dialog
        open={confirmRestore !== null}
        onOpenChange={() => setConfirmRestore(null)}
      >

        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              Restore database from backup?
            </DialogTitle>
          </DialogHeader>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setConfirmRestore(null)}
            >
              Cancel
            </Button>

            <Button onClick={handleRestore}>
              Restore
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
};

export default AdminBackup;