import { cn } from "@/lib/utils";

type LandingShotProps = {
  url: string;
  alt: string;
  caption: string;
  src: string;
  /** Lighter caption text for dark page sections. */
  dark?: boolean;
  wide?: boolean;
  className?: string;
};

/** Editor chrome around a screenshot. Tab bar is always #23274C. */
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
          "w-full overflow-hidden rounded-[14px] border border-white/[0.12] bg-white shadow-[0_18px_50px_rgba(20,20,36,0.12)]",
          dark && "shadow-[0_22px_60px_rgba(0,0,0,0.35)]",
        )}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.1] bg-[#23274C] px-3.5 py-2.5">
          <div className="flex shrink-0 items-center gap-[7px]" aria-hidden>
            <span className="h-[9px] w-[9px] rounded-full bg-[#6b6f8a]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#6b6f8a]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#6b6f8a]" />
          </div>
          <div className="min-w-0 max-w-[min(100%,520px)] truncate rounded-md border border-white/[0.1] bg-[#252841] px-3 py-1.5 font-landing-sans text-[12px] leading-none text-white/65">
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
          "mt-3 w-full font-landing-mono text-[13px] leading-[1.5]",
          dark ? "text-[rgba(196,196,210,0.72)]" : "text-landing-muted",
        )}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
