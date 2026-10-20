import type { Metadata } from "next";
import AuthForm from "../auth-form";

export const metadata: Metadata = {
  title: "Log in | Fieldnote",
  description: "Sign in to access your Fieldnote courses and lessons.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
