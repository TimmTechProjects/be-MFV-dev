import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SetAsCoverButtonProps {
  collectionId: string;
  imageId: string;
  disabled?: boolean;
}

const SetAsCoverButton = ({
  collectionId,
  imageId,
  disabled,
}: SetAsCoverButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_FLORAL_VAULT_API_URL;

  const handleClick = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/collections/${collectionId}/set-thumbnail`,

        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ imageId }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to set cover image");
        return;
      }

      toast.success("Cover image updated successfully!");
      router.refresh();
    } catch (err) {
      toast.error("Unexpected error while setting cover image");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSaving || disabled}
      className={`text-xs bg-white text-black rounded px-3 py-1 border border-gray-400 hover:bg-gray-100 disabled:opacity-50 ${
        isSaving || disabled ? "" : "cursor-pointer"
      }`}
    >
      {disabled ? "Cover Image ✓" : isSaving ? "Saving..." : "Set as Cover"}
    </button>
  );
};

export default SetAsCoverButton;
