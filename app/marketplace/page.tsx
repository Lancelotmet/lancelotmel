import { redirect } from "next/navigation";

// The former transactional catalogue is intentionally retired from the public learning journey.
// Existing order and checkout routes remain untouched for historical purchases.
export default function MarketplacePage() {
  redirect("/portal");
}
