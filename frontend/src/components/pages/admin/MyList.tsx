import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { routes } from "@/lib/constants";
import adminService from "@/api/services/adminService";
import { User } from "@/types/User";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Loader from "@/components/ui/widgets/Loader";
import { Users } from "lucide-react";

const MyList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const [inlineUserId, setInlineUserId] = useState<number | null>(null);
  const [inlineField, setInlineField] = useState<"name" | "email" | null>(null);
  const [inlineValue, setInlineValue] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedName, setSelectedName] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, trainersData] = await Promise.all([
          adminService.getClients(),
          adminService.getTrainers(),
        ]);
        setClients(clientsData);
        setTrainers(trainersData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const allUsers = useMemo(() => [...clients, ...trainers], [clients, trainers]);

  const uniqueNames = useMemo(
    () => [...new Set(allUsers.map((u) => u.name))],
    [allUsers]
  );

  const uniqueEmails = useMemo(
    () => [...new Set(allUsers.map((u) => u.email))],
    [allUsers]
  );

  const filteredUsers = useMemo(() => {
    return allUsers
      .filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(search.toLowerCase());

        const matchesRole =
          roleFilter === "all" || user.role.toLowerCase() === roleFilter;

        const matchesName =
          selectedName === "all" || user.name === selectedName;

        const matchesEmail =
          selectedEmail === "all" || user.email === selectedEmail;

        return matchesSearch && matchesRole && matchesName && matchesEmail;
      })
      .sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
  }, [allUsers, search, roleFilter, selectedName, selectedEmail, sortOrder]);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await adminService.deleteUser(id);
      setClients((prev) => prev.filter((u) => u.id !== id));
      setTrainers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      await adminService.updateUser(editingUser.id, {
        name: editName,
        email: editEmail,
      });

      setClients((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: editName, email: editEmail }
            : u
        )
      );

      setTrainers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: editName, email: editEmail }
            : u
        )
      );

      setEditingUser(null);
    } finally {
      setSaving(false);
    }
  };

  const startInlineEdit = (user: User, field: "name" | "email") => {
    setInlineUserId(user.id);
    setInlineField(field);
    setInlineValue(user[field]);
  };

  const cancelInlineEdit = () => {
    setInlineUserId(null);
    setInlineField(null);
    setInlineValue("");
  };

  const saveInlineEdit = async (user: User) => {
    if (!inlineField) return;

    const updated = {
      name: inlineField === "name" ? inlineValue : user.name,
      email: inlineField === "email" ? inlineValue : user.email,
    };

    await adminService.updateUser(user.id, updated);

    setClients((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u))
    );

    setTrainers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u))
    );

    cancelInlineEdit();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin panel</h1>
          <p className="text-sm text-muted-foreground">
            Manage trainers and clients
          </p>
        </div>
        <Button onClick={() => navigate(routes.CreateUser)}>
          Create New
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter and sort users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="trainer">Trainer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedName} onValueChange={setSelectedName}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Names</SelectItem>
                {uniqueNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmail} onValueChange={setSelectedEmail}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emails</SelectItem>
                {uniqueEmails.map((email) => (
                  <SelectItem key={email} value={email}>
                    {email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A-Z</SelectItem>
                <SelectItem value="desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Filtered users list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
            >
              <Avatar userName={user.name} size="sm" />

              <div className="flex-1 min-w-0">
                {inlineUserId === user.id && inlineField === "name" ? (
                  <Input
                    autoFocus
                    value={inlineValue}
                    onChange={(e) => setInlineValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveInlineEdit(user);
                      if (e.key === "Escape") cancelInlineEdit();
                    }}
                  />
                ) : (
                  <p
                    className="font-medium truncate cursor-pointer hover:bg-muted"
                    onDoubleClick={() => startInlineEdit(user, "name")}
                  >
                    {user.name}
                  </p>
                )}

                {inlineUserId === user.id && inlineField === "email" ? (
                  <Input
                    autoFocus
                    value={inlineValue}
                    onChange={(e) => setInlineValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveInlineEdit(user);
                      if (e.key === "Escape") cancelInlineEdit();
                    }}
                  />
                ) : (
                  <p
                    className="text-sm text-muted-foreground truncate cursor-pointer hover:bg-muted"
                    onDoubleClick={() => startInlineEdit(user, "email")}
                  >
                    {user.email}
                  </p>
                )}
              </div>

              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === user.id}
                  onClick={() => handleDelete(user.id)}
                >
                  {deletingId === user.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
            />
            <Input
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={handleUpdate}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyList;