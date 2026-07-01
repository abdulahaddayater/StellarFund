import Image, { type ImageProps } from "next/image";
import { resolveCampaignImageUrl } from "@/lib/campaign-image";

type CampaignImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
};

export function CampaignImage({ src, alt, ...props }: CampaignImageProps) {
  return (
    <Image
      {...props}
      src={resolveCampaignImageUrl(src)}
      alt={alt}
    />
  );
}
