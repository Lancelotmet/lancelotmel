import { redirect } from "next/navigation";

// Product pages now resolve to the contextual learning catalogue.
export default function RetiredMarketplaceProductPage() {
  redirect("/portal");
}
