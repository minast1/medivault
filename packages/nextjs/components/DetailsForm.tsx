import React, { useActionState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail } from "lucide-react";
import { z } from "zod";
import { Button } from "~~/components/ui/button";

type FormState = {
  errors?: { name?: string[]; institution?: string[]; department?: string[] };
  data?: {
    name?: string;
    institution?: string;
    department?: string;
  };
  success?: boolean;
};

const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});
type TProps = {
  role: "patient" | "doctor";
  // onRegistered: () => void;
};

const DetailsForm = ({ role }: TProps) => {
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
    return { success: true, errors: {} };
    //onSuccess call onRegistered to switch to overlay;
  };
  const [state, formAction, isPending] = useActionState(handleSubmission, {
    errors: {},
    success: false,
  });
  const schema =
    role === "doctor"
      ? baseSchema.extend({
          institution: z.string().min(2, "Institution or hospital is required"),
          department: z.string().min(2, "Department is required"),
        })
      : baseSchema;

  return (
    <form action={formAction} className="flex flex-col gap-4 mt-2">
      <div className="space-y-2">
        <Label htmlFor="provider-name">Provider Name</Label>
        <Input id="provider-name" name="name" placeholder="e.g. Dr. Sarah Chen" />
        {state.errors?.name && <span className="text-error text-sm mt-1">{state.errors.name[0]}</span>}
      </div>
      {role === "doctor" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="institution">Institution Name</Label>
            <Input
              id="institution"
              name="institution"
              placeholder="e.g. General Hospital"
              //value={institution}
              // onChange={(e) => setInstitution(e.target.value)}
            />
            {state.errors?.institution && (
              <span className="text-error text-sm mt-1">{state.errors.institution[0]}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider-email">Department</Label>
            <Input
              id="provider-department"
              name="department"
              placeholder="e.g. Cardiology"
              // value={email}
              // onChange={(e) => setEmail(e.target.value)}
            />
            {state.errors?.department && <span className="text-error text-sm mt-1">{state.errors.department[0]}</span>}
          </div>
        </>
      )}

      <Button className="w-full gap-2 h-11" disabled={isPending}>
        <Mail className="w-4 h-4" />
        Continue
      </Button>
    </form>
  );
};

export default DetailsForm;
