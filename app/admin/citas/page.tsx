import AdminAppointments from "./admin-appointments";

export default function AdminCitasPage() {
  return (
    <main className="page">
      <div className="shell">
        <section className="admin-header">
          <div>
            <p className="eyebrow">Lancelot | Desde el ser para el saber</p>
            <h1>Centro de administracion</h1>
            <p className="lead">
              Control de citas, clases, sesiones, diagnosticos y consultas para la operacion
              pedagogica de Lancelot.
            </p>
          </div>
          <a className="button secondary" href="/citas">
            Nuevo encuentro
          </a>
        </section>
        <section className="panel">
          <AdminAppointments />
        </section>
      </div>
    </main>
  );
}
