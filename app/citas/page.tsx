import BookingForm from "./booking-form";

export default function CitasPage() {
  return (
    <main className="page">
      <div className="shell hero">
        <section className="hero-copy">
          <p className="eyebrow">Lancelot | Desde el ser para el saber</p>
          <h1>Agenda encuentros pedagogicos con Lancelot.</h1>
          <p className="lead">
            Reserva citas, clases, sesiones, diagnosticos o consultas con nuestros expertos en
            metodologias de aprendizaje y orientacion pedagogica.
          </p>
          <div className="actions">
            <a className="button" href="#reserva">
              Agendar encuentro
            </a>
            <a className="button secondary" href="/admin/citas">
              Centro administrativo
            </a>
          </div>
          <div className="features">
            <article className="feature">
              <h3>Agenda centralizada</h3>
              <p>Los encuentros confirmados bloquean el horario para evitar cruces.</p>
            </article>
            <article className="feature">
              <h3>Equipo Lancelot</h3>
              <p>El calendario puede invitar a las personas internas responsables.</p>
            </article>
            <article className="feature">
              <h3>Procesos pedagogicos</h3>
              <p>Cada reserva queda clasificada por tipo de encuentro y servicio.</p>
            </article>
          </div>
        </section>
        <section className="panel booking-panel" id="reserva" aria-label="Formulario de reserva">
          <div className="panel-title">
            <h2>Nuevo encuentro</h2>
            <span className="pill">America/Bogota</span>
          </div>
          <BookingForm />
        </section>
      </div>
    </main>
  );
}
