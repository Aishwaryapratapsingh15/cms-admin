"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserAction, deleteUserAction, type ActionState } from "@/lib/actions/users";
import type { Role, User } from "@/lib/types";

const initialState: ActionState = {};

export function UserRowActions({
  user,
  roles,
  canWrite,
  canDelete,
  isSelf,
}: {
  user: User;
  roles: Role[];
  canWrite: boolean;
  canDelete: boolean;
  isSelf: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isActive, setIsActive] = useState(user.isActive);
  const boundUpdate = updateUserAction.bind(null, user.id);
  const [state, formAction, isPending] = useActionState(boundUpdate, initialState);
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (state.success) {
      setEditOpen(false);
      toast.success("User updated successfully");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User deleted");
        setDeleteOpen(false);
      }
    });
  }

  if (!canWrite && !canDelete) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="User actions">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {canWrite && (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
          )}
          {canDelete && !isSelf && !user.isFirstAdmin && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update profile, role, and account status.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`fullName-${user.id}`}>Full name</Label>
              <Input id={`fullName-${user.id}`} name="fullName" defaultValue={user.fullName} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`email-${user.id}`}>Email</Label>
              <Input id={`email-${user.id}`} name="email" type="email" defaultValue={user.email} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`designation-${user.id}`}>Designation</Label>
              <Input
                id={`designation-${user.id}`}
                name="designation"
                defaultValue={user.designation ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`role-${user.id}`}>Role</Label>
              <Select name="roleId" defaultValue={user.roleId}>
                <SelectTrigger id={`role-${user.id}`} className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`password-${user.id}`}>New password</Label>
              <Input
                id={`password-${user.id}`}
                name="password"
                type="password"
                placeholder="Leave blank to keep current password"
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor={`isActive-${user.id}`}>Active</Label>
              <Switch
                id={`isActive-${user.id}`}
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <input type="hidden" name="isActive" value={isActive ? "on" : "off"} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {user.fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This soft-deletes the user — they will no longer be able to sign in. This action
              can only be reversed directly in the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
