import { cn } from "@/lib/utils";

type LandingShotProps = {
  url: string;
  alt: string;
  caption: string;
  src: string;
  wide?: boolean;
  /** Centre the caption under the screenshot. */
  centerCaption?: boolean;
  className?: string;
};

/** Browser chrome around a product screenshot. */
export function LandingShot({
  url,
  alt,
  caption,
  src,
  wide = false,
  centerCaption = false,
  className,
}: LandingShotProps) {
  return (
    <figure
      data-reveal
      className={cn(
        "m-0 mt-[22px] w-full",
        wide ? "max-w-none" : "max-w-[720px]",
        className,
      )}
    >
      <div className="w-full overflow-hidden rounded-2xl border border-landing-line bg-white shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3 border-b border-landing-line bg-landing-steel-3 px-3.5 py-2.5">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-landing-fog/25" />
            <span className="h-2 w-2 rounded-full bg-landing-fog/25" />
            <span className="h-2 w-2 rounded-full bg-landing-fog/25" />
          </div>
          <div className="min-w-0 max-w-[min(100%,520px)] truncate rounded-md border border-landing-line bg-white/5 px-3 py-1 font-landing-mono text-[11px] leading-[1.4] text-landing-fog/60">
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
          "mt-3 w-full font-landing-mono text-[12.5px] leading-[1.5] text-landing-fog/45",
          centerCaption && "text-center",
        )}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
