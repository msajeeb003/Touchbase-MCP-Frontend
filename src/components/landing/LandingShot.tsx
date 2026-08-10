import { cn } from "@/lib/utils";

type LandingShotProps = {
  url: string;
  alt: string;
  caption: string;
  src: string;
  dark?: boolean;
  wide?: boolean;
  className?: string;
};

/** Editor/browser chrome around a screenshot. Image is always required. */
export function LandingShot({
  url,
  alt,
  caption,
  src,
  dark = false,
  wide = false,
  className,
}: LandingShotProps) {
  return (
    <figure
      data-reveal
      className={cn(
        "mt-[22px] w-full",
        wide ? "max-w-none" : "max-w-[720px]",
        className,
      )}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-[14px] border shadow-[0_18px_50px_rgba(20,20,36,0.08)]",
          dark
            ? "border-white/[0.12] bg-[#16161f] shadow-[0_22px_60px_rgba(0,0,0,0.35)]"
            : "border-landing-line bg-white",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 border-b px-3.5 py-2.5",
            dark
              ? "border-white/[0.1] bg-[#23274C]"
              : "border-landing-line bg-[#ebebf0]",
          )}
        >
          <div className="flex shrink-0 items-center gap-[7px]" aria-hidden>
            <span
              className={cn(
                "h-[9px] w-[9px] rounded-full",
                dark ? "bg-[#6b6f8a]" : "bg-[#c5c7d4]",
              )}
            />
            <span
              className={cn(
                "h-[9px] w-[9px] rounded-full",
                dark ? "bg-[#6b6f8a]" : "bg-[#c5c7d4]",
              )}
            />
            <span
              className={cn(
                "h-[9px] w-[9px] rounded-full",
                dark ? "bg-[#6b6f8a]" : "bg-[#c5c7d4]",
              )}
            />
          </div>
          <div
            className={cn(
              "min-w-0 max-w-[min(100%,520px)] truncate rounded-md border px-3 py-1.5 font-landing-sans text-[12px] leading-none",
              dark
                ? "border-white/[0.1] bg-[#252841] text-white/65"
                : "border-black/[0.08] bg-white text-landing-muted",
            )}
          >
            {url}
          </div>
        </div>

        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full bg-white"
        />
      </div>

      <figcaption
        className={cn(
          "mt-3 w-full font-landing-sans text-[13.5px] leading-[1.5]",
          dark ? "text-[rgba(196,196,210,0.72)]" : "text-landing-muted",
        )}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
