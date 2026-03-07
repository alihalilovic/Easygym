export const getBackups = async (): Promise<string[]> => {
  const res = await fetch("http://localhost:5000/api/admin/backups");
  return res.json();
};

export const backupDatabase = async () => {
  await fetch("http://localhost:5000/api/admin/backup", {
    method: "POST",
  });
};

export const restoreDatabase = async (file: string) => {
  await fetch(`http://localhost:5000/api/admin/restore?file=${file}`, {
    method: "POST",
  });
};