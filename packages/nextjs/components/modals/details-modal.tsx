import React, { useActionState, useEffect, useState } from "react";
import CardInput from "../CardInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Loader2, Shield } from "lucide-react";
import { z } from "zod";
import { Button } from "~~/components/ui/button";
import { Input } from "~~/components/ui/input";

type TProps = {
  open: boolean;
  onClose: () => void;
  isWaiting: boolean;
  role: string;

  onRegister: ({
    name,
    institution,
    department,
    cardId,
  }: {
    name: string;
    institution: string;
    department: string;
    cardId: string;
  }) => void;
};
type FormState = {
  errors?: { name?: string[]; institution?: string[]; department?: string[]; cardId?: string[] };
  data?: {
    name?: string;
    institution?: string;
    department?: string;
    cardId?: string;
  };
  success?: boolean;
};

const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});
const DetailsModal = ({ open, onClose, role, onRegister, isWaiting }: TProps) => {
  const handleSubmission = async (prevState: FormState, formData: FormData): Promise<FormState> => {
    const data =
      role === "doctor"
        ? {
            name: formData.get("name") as string,
            institution: formData.get("institution") as string,
            department: formData.get("department") as string,
          }
        : {
            name: formData.get("name") as string,
            cardId: formData.get("cardId") as string,
          };

    // Validate with Zod
    const validated = schema.safeParse(data);

    if (!validated.success) {
      // Return errors to the hook
      return {
        errors: z.flattenError(validated.error).fieldErrors,
        data, // Return data so the form doesn't wipe on error
      };
    }

    // If valid, you would trigger your contract write here
    console.log("Valid registration:", validated.data);

    return { success: true, errors: {}, data: validated.data };
    //onSuccess call onRegistered to switch to overlay;
  };
  const [state, formAction] = useActionState(handleSubmission, {
    errors: {},
    success: false,
  });

  const schema =
    role === "doctor"
      ? baseSchema.extend({
          institution: z.string().min(2, "Institution or hospital is required"),
          department: z.string().min(2, "Department is required"),
        })
      : role === "patient"
        ? baseSchema.extend({
            cardId: z
              .string()
              .trim()
              .toUpperCase()
              .regex(/^[A-Z]{3}-\d{9}-\d{1}$/, "Invalid Ghana Card ID format. Expected format: GHA-123456789-0"),
          })
        : baseSchema;

  useEffect(() => {
    if (state.success && state.data) {
      onRegister({
        name: state.data?.name || "",
        institution: state.data?.institution || "",
        department: state.data?.department || "",
        cardId: state.data?.cardId || "",
      }); // Closes modal or switches view
    }
  }, [state.success, onRegister, state.data]);

  const [value, setValue] = useState("");

  const formatGhanaCard = (input: string) => {
    // 1. Remove everything except letters and numbers
    const clean = input.replace(/[^A-Z0-9]/gi, "").toUpperCase();

    // 2. Slice into the GHA-000000000-0 parts
    let formatted = clean;
    if (clean.length > 3) {
      formatted = `${clean.slice(0, 3)}-${clean.slice(3, 12)}`;
    }
    if (clean.length > 12) {
      formatted = `${formatted.slice(0, 13)}-${clean.slice(12, 13)}`;
    }

    return formatted.slice(0, 15); // Max length with hyphens is 15
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatGhanaCard(e.target.value);
    setValue(formatted);
  };
  //console.log(value);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-center text-lg">
            {role === "doctor" ? "Hospital/GP Sign In" : "Sign in to Your Vault"}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">Just a few more details we require..</p>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="provider-name">Provider Name</Label>
            <Input id="provider-name" name="name" placeholder="e.g. Sarah Chen" />
            {state.errors?.name && <span className="text-destructive text-xs">{state.errors.name[0]}</span>}
          </div>
          <input type="hidden" name="cardId" value={value} />
          <div className="space-y-2">
            <Label htmlFor="provider-cardId">GH CardId</Label>
            <CardInput
              name="cardId"
              placeholder="e.g. GHA-772662626-0"
              value={value}
              onChange={handleChange}
              id="provider-cardId"
            />
            {state.errors?.cardId && <span className="text-destructive text-xs">{state.errors.cardId[0]}</span>}
          </div>
          {role === "doctor" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution Name</Label>
                <Input id="institution" name="institution" placeholder="e.g. General Hospital" />
                {state.errors?.institution && (
                  <span className="text-destructive text-xs">{state.errors.institution[0]}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider-email">Department</Label>
                <Input id="provider-department" name="department" placeholder="e.g. Cardiology" />
                {state.errors?.department && (
                  <span className="text-destructive text-xs">{state.errors.department[0]}</span>
                )}
              </div>
            </>
          )}

          <Button className="w-full gap-2 h-11" disabled={isWaiting}>
            {isWaiting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : role === "doctor" ? (
              "Continue to Dashboard"
            ) : (
              "Continue to Vault"
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Protected by MediVault&apos;s zero-knowledge encryption
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModal;
