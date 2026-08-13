import { redirect } from "next/navigation";

// Learning access lives in the portal. Purchase records stay available in the existing data layer.
export default function MyLibraryPage() {
  redirect("/portal");
}
