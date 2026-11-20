
import { ItemDetailsDialog } from "@/components/ItemDetailsDialog";

export const instant = false;

export default async function DetailsPage({ params }) {
  const { id } = await params;

  let item = null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/item/${id}`,
      {
        cache: "no-store",
      }
    );

    if (response.ok) {
      item = await response.json();
    }
  } catch (error) {
    console.error("Failed to fetch menu item:", error);
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-zinc-50 p-10 flex items-center justify-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-100 text-center max-w-md w-full">
          <h2 className="text-lg font-bold text-zinc-900">
            Item not found
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            The menu item you requested does not exist or has been removed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <ItemDetailsDialog item={item} />
    </main>
  );
}
