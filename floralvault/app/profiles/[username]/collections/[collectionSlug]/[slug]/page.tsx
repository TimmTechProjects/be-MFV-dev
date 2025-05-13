import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getPlantBySlug } from "@/lib/utils";
import PlantImageGallery from "@/components/PlantImageGallery";
import Link from "next/link";
import PlantActions from "@/components/PlantActions";

type PageProps = {
  params: Promise<{
    username: string;
    slug: string;
  }>;
};

export default async function PlantDetailPage({ params }: PageProps) {
  const { username, slug } = await params;

  const plant = await getPlantBySlug(slug, username);
  if (!plant || !plant.slug) return notFound();

  const canonicalUsername = plant.user?.username;
  if (canonicalUsername && canonicalUsername !== username) {
    redirect(
      `/profiles/${canonicalUsername}/collections/${plant.collection?.slug}/${plant.slug}`
    );
  }

  return (
    <div className="pb-10 sm:pb-0">
      {/* NAME + BOTANICAL NAME + TAGS */}
      <div className="flex flex-col px-10 pt-5">
        <h1 className="flex text-2xl md:text-4xl justify-center w-full font-bold mb-2 text-[#81a308]">
          {plant.commonName || plant.botanicalName}
        </h1>
        <h2 className="flex text-lg italic mb-4 text-gray-400 justify-center">
          {plant.botanicalName}
        </h2>
      </div>

      {/* Grid */}
      <div className="max-w-[100rem] mx-auto md:py-10 px-4 text-white grid grid-cols-1 lg:grid-cols-[2.5fr_3fr_1fr] gap-5 md:gap-12 items-start">
        {/* TAGS */}
        <div className="lg:col-span-1 lg:col-start-1 order-1 text-center lg:text-left"></div>

        {/* IMAGE GALLERY */}
        <div className="order-2 lg:order-none flex justify-center lg:block">
          <PlantImageGallery
            images={plant.images}
            alt={plant.commonName || plant.botanicalName}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="order-3 lg:order-none prose prose-invert max-w-none text-base md:text-[1.05rem] leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: `${plant.description}` }} />
        </div>

        {/* INFO COLUMN */}
        <div className="order-4 lg:order-none text-sm text-gray-400 space-y-2 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-4 border-[#444]">
          {/* <div className="">{username}</div> */}

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="font-medium">Posted by:</span>
            <Link
              href={`/profiles/${username}`}
              className="text-[#81a308] hover:underline"
            >
              {username}
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            <Badge className="text-sm bg-muted">
              🌍 {plant.origin || "unknown"}
            </Badge>
            <Badge className="text-sm bg-muted">
              Family: {plant.family || "unknown"}
            </Badge>
            <Badge className="text-sm bg-muted">
              Type: {plant.type || "unknown"}
            </Badge>
            <Badge className="text-sm bg-muted">
              Added: {new Date(plant.createdAt).toLocaleDateString()}
            </Badge>
            <Badge className="text-sm bg-muted">Views: {plant.views}</Badge>
          </div>
          <div className="flex flex-wrap justify-start gap-2 mt-5">
            {plant.tags.map((tag, i) => (
              <Link
                href={`/the-vault/results?tag=${encodeURIComponent(tag.name)}`}
                key={i}
              >
                <Badge className="text-xs px-3 py-1 break-words whitespace-nowrap bg-[#81a308]/10 text-[#81a308] border border-[#81a308]/30 hover:bg-[#81a308]/20 transition-colors">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>

          <PlantActions plantId={plant.id} />
        </div>
      </div>
    </div>
  );
}
