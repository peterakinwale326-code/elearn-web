import type { Metadata } from "next";
import AuthForm from "../auth-form";

export const metadata: Metadata = {
  title: "Log in | Fieldnote",
  description: "Log in to your Fieldnote learning account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
