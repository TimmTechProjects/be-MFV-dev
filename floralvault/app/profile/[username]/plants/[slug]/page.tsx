import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { getPlantBySlug } from "@/lib/utils";

export default async function PlantDetailPage({
  params,
}: {
  params: { username: string; slug: string };
}) {
  const plant = await getPlantBySlug(params.slug);
  if (!plant || !plant.slug) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-white">
      <h1 className="text-4xl font-bold mb-2 text-[#81a308]">
        {plant.commonName || plant.botanicalName}
      </h1>
      <h2 className="text-lg italic mb-4 text-gray-400">
        {plant.botanicalName}
      </h2>

      <Image
        src={plant.images[0].url}
        alt={plant.commonName || plant.botanicalName}
        width={800}
        height={400}
        className="rounded-xl object-cover w-full max-h-[400px] mb-6"
      />

      <div className="prose prose-invert max-w-none text-base leading-relaxed mb-4">
        <div dangerouslySetInnerHTML={{ __html: `${plant.description}` }} />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {plant.tags.map((tag, i) => (
          <Badge
            key={i}
            className="text-xs px-2 py-1 bg-[#81a308]/10 text-[#81a308] border border-[#81a308]/30"
          >
            {tag.name}
          </Badge>
        ))}
      </div>

      <div className="text-sm text-gray-400 space-y-1">
        <p>Origin: {plant.origin}</p>
        <p>Family: {plant.family}</p>
        <p>Type: {plant.type}</p>
        <p>Added: {new Date(plant.createdAt).toLocaleDateString()}</p>
        <p>Views: {plant.views}</p>
      </div>
    </div>
  );
}
