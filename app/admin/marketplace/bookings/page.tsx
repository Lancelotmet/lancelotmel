import { formatDateTime } from "@/lib/marketplace/format";
import { listAvailability, listBookingsForEmail } from "@/lib/marketplace/repository";

export default async function AdminBookingsPage() {
  const [bookings, slots] = await Promise.all([listBookingsForEmail(), listAvailability()]);

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">Admin bookings</p>
          <h1>Reservations, availability and live class operations.</h1>
        </div>
      </div>
      <section className="summary-grid">
        <div className="metric"><span>Confirmed bookings</span><strong>{bookings.filter((booking) => booking.status === "confirmed").length}</strong></div>
        <div className="metric"><span>Open slots</span><strong>{slots.length}</strong></div>
        <div className="metric"><span>No-shows</span><strong>{bookings.filter((booking) => booking.status === "no_show").length}</strong></div>
        <div className="metric"><span>Completed</span><strong>{bookings.filter((booking) => booking.status === "completed").length}</strong></div>
      </section>
      <div className="table-wrap panel">
        <table className="table">
          <thead><tr><th>Student booking</th><th>Product</th><th>Instructor</th><th>Time</th><th>Status</th><th>Meeting</th></tr></thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.product.title}</td>
                <td>{booking.instructor.name}</td>
                <td>{formatDateTime(booking.startTimeUtc, booking.studentTimezone)}</td>
                <td><span className={`badge ${booking.status}`}>{booking.status}</span></td>
                <td>{booking.meetingUrl ?? "Pending payment"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
