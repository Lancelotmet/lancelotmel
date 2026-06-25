import { LoginClient } from "@/components/marketplace/LoginClient";

export default function LoginPage() {
  return (
    <main className="page shell auth-page">
      <section>
        <p className="eyebrow">Account</p>
        <h1>Access your LANCELOT library and bookings.</h1>
        <p className="lead">Supabase Auth powers registration, login and sessions. Demo checkout can also run with email-only access in development.</p>
      </section>
      <LoginClient />
    </main>
  );
}
