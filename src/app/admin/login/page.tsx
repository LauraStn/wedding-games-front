"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useStaffLogin } from "../../../features/auth/mutations";
import { ErrorPanel } from "../../../components/ErrorPanel";

const schema = z.object({
  username: z.string().trim().min(1, "Identifiant requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useStaffLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, { onSuccess: () => router.replace("/admin") });
  });

  return (
    <div className="page page--centered">
      <div className="card">
        <h1>Espace organisateur</h1>
        <p>Connectez-vous avec votre compte staff pour accéder au back-office.</p>

        <form className="form" onSubmit={onSubmit} noValidate>
          <label htmlFor="username">Identifiant</label>
          <input
            id="username"
            autoComplete="username"
            aria-invalid={errors.username ? "true" : "false"}
            aria-describedby={errors.username ? "username-error" : undefined}
            {...register("username")}
          />
          {errors.username && (
            <p id="username-error" className="field-error" role="alert">
              {errors.username.message}
            </p>
          )}

          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" className="field-error" role="alert">
              {errors.password.message}
            </p>
          )}

          <button type="submit" className="btn btn--primary" disabled={login.isPending}>
            {login.isPending ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        {login.isError && <ErrorPanel error={login.error} title="Connexion impossible" />}
      </div>
    </div>
  );
}
