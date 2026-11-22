import Image from "next/image";
import Link from "next/link";
import { MapPin, Store } from "lucide-react";

const isExternalUrl = (url) => typeof url === "string" && url.startsWith("http");

const DishCard = ({
  id,
  name,
  desc,
  price,
  img,
  href = `/Browse-Menu/${id}`,
  cta = "View Details",
  category,
  location,
  vendor,
  onCtaClick,
}) => {
  const hasMeta = Boolean(category || location || vendor);

  return (
    <article
      className={`group relative mx-auto w-full max-w-[280px] ${
        hasMeta ? "h-[372px]" : "h-[290px]"
      }`}
    >
      {/* Card body (starts below the top of the plate) */}
      <div className="absolute inset-x-0 bottom-0 top-24 rounded-[40px] bg-gradient-to-b from-zinc-200/80 via-zinc-100/90 to-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-white/60">
        <div className="flex h-full flex-col justify-between px-7 pb-6 pt-[88px]">
          <div>
            <h3 className="font-poppins text-[17px] font-medium text-zinc-900">
              {name}
            </h3>
            <p
              className="mt-2 text-[13px] text-zinc-700"
              style={{
                display: hasMeta ? "-webkit-box" : "block",
                WebkitBoxOrient: hasMeta ? "vertical" : undefined,
                WebkitLineClamp: hasMeta ? 2 : undefined,
                overflow: hasMeta ? "hidden" : undefined,
              }}
            >
              {desc}
            </p>
            {category && (
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-brand">
                {category}
              </p>
            )}
            {(location || vendor) && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-zinc-500">
                {location && (
                  <>
                    <MapPin className="size-3.5 shrink-0" />
                    {location}
                  </>
                )}
                {location && vendor && <span className="text-zinc-400">·</span>}
                {vendor && (
                  <>
                    <Store className="size-3.5 shrink-0" />
                    {vendor}
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold text-zinc-900">{price}</p>
            <Link
              href={href}
              onClick={
                onCtaClick
                  ? (e) => {
                      e.preventDefault();
                      onCtaClick();
                    }
                  : undefined
              }
              className="text-[13px] font-semibold text-zinc-900 underline underline-offset-4 transition hover:text-brand"
            >
              {cta}
            </Link>
          </div>
        </div>
      </div>

      {/* Plate overlapping the card */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2">
        <div className="rounded-full bg-gradient-to-b from-white/80 to-zinc-200/60 p-2 shadow-xl">
          <Image
            src={img}
            alt={name}
            width={200}
            height={200}
            unoptimized={isExternalUrl(img)}
            className="size-36 rounded-full object-cover transition-transform duration-300 group-hover:scale-105 sm:size-40"
          />
        </div>
      </div>
    </article>
  );
};

export default DishCard;
