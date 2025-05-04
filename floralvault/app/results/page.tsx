import { redirect } from "next/navigation";
import ResultsCard from "@/components/cards/ResultsCard";
import { getAllPlants } from "@/lib/utils";
import GoBackButton from "@/components/ui/GoBackButton";
import { Plant } from "@/types/plants";

const ResultsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; query?: string }>;
}) => {
  const { tag, query } = await searchParams;

  if (!tag && !query) {
    redirect("/");
  }

  const allPlants: Plant[] = await getAllPlants();

  // Filter plants based on tag or query
  const filteredResults = allPlants.filter((plant) => {
    if (tag) {
      const lowerTag = tag.toLowerCase();
      return plant.tags.some((t) => t.name.toLowerCase() === lowerTag);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      return (
        plant.commonName?.toLowerCase().includes(lowerQuery) ||
        plant.botanicalName?.toLowerCase().includes(lowerQuery) ||
        plant.description?.toLowerCase().includes(lowerQuery) ||
        plant.origin?.toLowerCase().includes(lowerQuery) ||
        plant.family?.toLowerCase().includes(lowerQuery) ||
        plant.tags?.some((t) => t.name.toLowerCase().includes(lowerQuery))
      );
    }

    return false;
  });

  return (
    <div className="flex flex-col text-white py-5 px-10 text-2xl font-semibold">
      {/* Page Heading */}
      <div className="flex py-5 items-center justify-between">
        <h1>
          Searching for:{" "}
          <span className="italic">
            {tag?.toUpperCase() || query?.toUpperCase()}
          </span>
        </h1>

        <GoBackButton />
      </div>

      {/* Results cards */}

      {filteredResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10 space-y-2">
          <p className="text-3xl">🌱</p>
          <p className="text-base">No plants matched your search.</p>
          <p className="text-sm text-muted">Try a different tag or name.</p>
        </div>
      ) : (
        <div className="flex flex-col w-full justify-center items-center ">
          {filteredResults.map((plant: Plant) => (
            <ResultsCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
