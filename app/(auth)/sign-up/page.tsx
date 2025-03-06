"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { loginSchema } from "../../../lib/schema";

const Page = () => {
  const { data: session } = useSession();
  if (session) redirect("/");

  const onSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();

    const formData = new FormData(evt.target as HTMLFormElement);

    const email = formData.get("email");
    const password = formData.get("password");
    const validatedData = loginSchema.parse({ email, password });

    const response = await fetch("/api/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: validatedData.email.toLocaleLowerCase(),
        password: validatedData.password,
      }),
    });

    if (!response.ok) {
      toast.error("Error creating new user");
    } else if (response.ok) {
      redirect("/sign-in");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto gap-6">
      <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        {/* <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div> */}
      </div>

      {/* Email/Password Sign Up */}
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          name="email"
          placeholder="Email"
          type="email"
          required
          autoComplete="email"
        />
        <Input
          name="password"
          placeholder="Password"
          type="password"
          required
          autoComplete="new-password"
        />
        <Button className="w-full" type="submit">
          Sign Up
        </Button>
      </form>

      <div className="text-center">
        <Button variant="link">
          <Link href="/sign-in">Already have an account? Sign in</Link>
        </Button>
      </div>
    </div>
  );
};

export default Page;
