import React from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Separator } from "./ui/separator";
import { Mail } from "lucide-react";

const EmailLoginButton = ({ loginRole }: { loginRole: "patient" | "doctor" }) => {
  console.log(loginRole);
  return (
    <InputGroup className="max-w-xs">
      <InputGroupInput placeholder="Enter your email..." />
      <InputGroupAddon>
        <Mail className="w-5 h-5" />
        <Separator orientation="vertical" className="border border-red-600 h-8 w-[1px]" />
      </InputGroupAddon>
    </InputGroup>
  );
};

export default EmailLoginButton;
