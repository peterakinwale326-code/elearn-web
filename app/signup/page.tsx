import type { Metadata } from "next";
import AuthForm from "../auth-form";

export const metadata: Metadata = {
  title: "Create an account | Fieldnote",
  description: "Create your Fieldnote learning account and verify your email to get started.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
