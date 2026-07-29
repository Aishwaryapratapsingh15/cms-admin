"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserAction, type ActionState } from "@/lib/actions/users";
import type { Role } from "@/lib/types";

const initialState: ActionState = {};

export function CreateUserDialog({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      toast.success("User created");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            New user
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New user</DialogTitle>
          <DialogDescription>
            Creates the account directly with the password you set here — share it with them
            securely.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-fullName">Full name</Label>
            <Input id="new-fullName" name="fullName" required maxLength={150} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-email">Email</Label>
            <Input id="new-email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">Password</Label>
            <Input
              id="new-password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={72}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-role">Role</Label>
            <Select
              name="roleId"
              defaultValue={roles[0]?.id}
              items={Object.fromEntries(roles.map((role) => [role.id, role.name]))}
            >
              <SelectTrigger id="new-role" className="w-full">
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
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
