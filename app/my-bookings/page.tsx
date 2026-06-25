import { formatDateTime } from "@/lib/marketplace/format";
import { listBookingsForEmail } from "@/lib/marketplace/repository";

type MyBookingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyBookingsPage({ searchParams }: MyBookingsPageProps) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const bookings = await listBookingsForEmail(email);

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">My Bookings</p>
          <h1>Live LANCELOT sessions linked to your products.</h1>
        </div>
      </div>
      {bookings.length ? (
        <div className="booking-list">
          {bookings.map((booking) => (
            <article className="booking-card" key={booking.id}>
              <div>
                <span className={`badge ${booking.status}`}>{booking.status}</span>
                <h2>{booking.product.title}</h2>
                <p>{booking.experience.title}</p>
                <dl>
                  <div><dt>Date</dt><dd>{formatDateTime(booking.startTimeUtc, booking.studentTimezone)}</dd></div>
                  <div><dt>Instructor</dt><dd>{booking.instructor.name}</dd></div>
                  <div><dt>Meeting</dt><dd>{booking.meetingUrl ?? "Generated after payment confirmation"}</dd></div>
                </dl>
              </div>
              <button className="button secondary" type="button">Contact support</button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state large">
          <strong>No bookings yet</strong>
          <span>Book a Full LANCELOT Experience from any eligible product page.</span>
        </div>
      )}
    </main>
  );
}
