import { plantData } from "@/mock/plantData";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { use } from "react";

export default function PlantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const plant = plantData.find((p) => p.slug === slug);

  if (!plant) {
    notFound(); // Optional: Can be a full 404 page
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-white">
      <h1 className="text-4xl font-bold mb-2 text-[#81a308]">
        {plant.common_name || plant.scientific_name}
      </h1>
      <h2 className="text-lg italic mb-4 text-gray-400">
        {plant.scientific_name}
      </h2>

      <Image
        src={plant.imageUrl[0]}
        alt={plant.common_name || plant.scientific_name}
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
            {tag}
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
