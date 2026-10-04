import { redirect } from "next/navigation";

// No landing page: the app opens straight on the Apprentice (Module 1 · Capture).
export default function Home() {
  redirect("/capture");
}
