import Image from "next/image";
import { PortableText } from "@portabletext/react";
import {
  type CaseStudyMeta,
  type CaseStudySection as CaseStudySectionType,
} from "@/lib/types";
import { urlFor } from "@/lib/sanity";

interface CaseStudyContentProps {
  meta?: CaseStudyMeta[];
  sections: CaseStudySectionType[];
  portableTextComponents: any;
  onImageClick: (images: { src: string; alt: string }[], index: number) => void;
}

/** Sanity asset refs encode dimensions: image-<hash>-<w>x<h>-<ext>. */
function aspectOf(img: any): number | null {
  const dims = img?.asset?.metadata?.dimensions;
  if (dims?.width && dims?.height) return dims.width / dims.height;
  const ref: string | undefined = img?.asset?._ref;
  const m = ref?.match(/-(\d+)x(\d+)-/);
  if (m) return Number(m[1]) / Number(m[2]);
  if (img?.width && img?.height) return img.width / img.height;
  return null;
}

/** Preview/local images bypass Sanity; everything else goes through urlFor. */
function srcOf(img: any, width: number, quality: number): string {
  if (img?.localSrc) return img.localSrc;
  return urlFor(img).width(width).quality(quality).url();
}

export default function CaseStudyContent({
  meta,
  sections,
  portableTextComponents,
  onImageClick,
}: CaseStudyContentProps) {
  return (
    <div className="space-y-14 mb-8">
      {/* Metadata grid */}
      {meta && meta.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 p-5 rounded-card"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {meta.map((item) => (
            <div key={item._key}>
              <span className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide block mb-1">
                {item.key}
              </span>
              <span
                className="font-sans text-[14px]"
                style={{ color: "var(--modal-text-secondary)" }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Sections */}
      {sections.map((section) => (
        <SectionRenderer
          key={section._key}
          section={section}
          portableTextComponents={portableTextComponents}
          onImageClick={onImageClick}
        />
      ))}
    </div>
  );
}

/**
 * A figure "plate" — the light Grow Theory renders read as paper on the dark
 * modal, so they need a defining ring (invisible edge on the light theme) plus
 * a lift shadow (separation on the dark theme).
 */
function Plate({
  img,
  onClick,
  priority,
}: {
  img: { src: string; thumbnail: string; alt: string; caption?: string };
  onClick: () => void;
  priority?: boolean;
}) {
  return (
    <figure>
      <div
        className="relative overflow-hidden cursor-zoom-in rounded-card transition-transform duration-300 ease-out hover:-translate-y-[2px] group"
        onClick={onClick}
        style={{
          boxShadow:
            "0 0 0 1px var(--border), 0 2px 6px rgba(0,0,0,0.10), 0 18px 40px -14px rgba(0,0,0,0.45)",
        }}
      >
        <Image
          src={img.src}
          alt={img.alt}
          width={2400}
          height={1350}
          priority={priority}
          className="w-full h-auto block"
          style={{ objectFit: "contain" }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors" />
      </div>
      {img.caption && (
        <figcaption
          className="mt-3 text-[13px] leading-snug"
          style={{ color: "var(--modal-text-body)" }}
        >
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}

function SectionRenderer({
  section,
  portableTextComponents,
  onImageClick,
}: {
  section: CaseStudySectionType;
  portableTextComponents: any;
  onImageClick: (images: { src: string; alt: string }[], index: number) => void;
}) {
  const layout = section.layout || "text-first";
  const hasBody = section.sectionBody && section.sectionBody.length > 0;
  const hasGallery =
    section.sectionGallery && section.sectionGallery.length > 0;

  const galleryImages = (section.sectionGallery || []).map((img: any, i) => ({
    src: srcOf(img, 2400, 90),
    alt: img.alt || `${section.sectionTitle} ${i + 1}`,
    caption: img.caption,
    thumbnail: srcOf(img, 1200, 88),
    aspect: aspectOf(img),
  }));

  // Wide figures (slides, code cards, screenshots) never share a row: at the
  // modal's 800px they'd land ~380px each and become unreadable. They stack
  // full-width instead. Narrow/square art keeps the two-up grid.
  const isWideSet =
    galleryImages.length > 0 &&
    galleryImages.every((g) => (g.aspect ?? 1.6) >= 1.5);

  const openLightbox = (i: number) =>
    onImageClick(
      galleryImages.map((g) => ({ src: g.src, alt: g.alt })),
      i
    );

  const bodyBlock = hasBody && (
    <div
      className="prose prose-base max-w-full w-full overflow-hidden break-words [&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-[17px] [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-70 [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_strong]:text-foreground [&_code]:text-foreground [&_blockquote]:text-muted [&_blockquote]:border-border"
      style={{ color: "var(--modal-text-body)" }}
    >
      <PortableText
        value={section.sectionBody}
        components={portableTextComponents}
      />
    </div>
  );

  const stacked = (
    <div className="space-y-8">
      {galleryImages.map((img, i) => (
        <Plate key={i} img={img} onClick={() => openLightbox(i)} />
      ))}
    </div>
  );

  const grid = (
    <div className="grid grid-cols-2 gap-4">
      {galleryImages.map((img, i) => (
        <div key={i} className="relative group">
          <div
            className="relative overflow-hidden cursor-zoom-in rounded-card img-outline"
            onClick={() => openLightbox(i)}
          >
            <Image
              src={img.thumbnail}
              alt={img.alt}
              width={800}
              height={600}
              className="w-full h-auto"
              style={{ maxHeight: "50vh", objectFit: "contain" }}
            />
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
          </div>
          {img.caption && (
            <p className="mt-2 text-center text-sm text-muted">{img.caption}</p>
          )}
        </div>
      ))}
    </div>
  );

  const galleryBlock = hasGallery && (isWideSet ? stacked : grid);

  return (
    <section className="space-y-6">
      {/* Section heading */}
      <h3 className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide border-b border-border pb-2">
        {section.sectionTitle}
      </h3>

      {/* Layout variants */}
      {layout === "full-width" && (
        <>
          {hasGallery && stacked}
          {bodyBlock}
        </>
      )}

      {layout === "side-by-side" &&
        (isWideSet ? (
          <>
            {bodyBlock}
            {galleryBlock}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bodyBlock}
            <div className="space-y-3">{galleryBlock}</div>
          </div>
        ))}

      {layout === "images-first" && (
        <>
          {galleryBlock}
          {bodyBlock}
        </>
      )}

      {layout === "text-first" && (
        <>
          {bodyBlock}
          {galleryBlock}
        </>
      )}
    </section>
  );
}
