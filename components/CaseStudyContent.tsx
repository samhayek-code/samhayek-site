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

export default function CaseStudyContent({
  meta,
  sections,
  portableTextComponents,
  onImageClick,
}: CaseStudyContentProps) {
  return (
    <div className="space-y-12 mb-8">
      {/* Metadata grid */}
      {meta && meta.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 p-5"
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
  const hasGallery = section.sectionGallery && section.sectionGallery.length > 0;

  // Build lightbox-compatible image array from section gallery
  const galleryImages = (section.sectionGallery || []).map((img, i) => ({
    src: urlFor(img).width(2400).quality(90).url(),
    alt: img.alt || `${section.sectionTitle} ${i + 1}`,
    caption: img.caption,
    thumbnail: urlFor(img).width(800).quality(85).url(),
  }));

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

  const galleryBlock = hasGallery && (
    <div
      className={
        layout === "side-by-side"
          ? "space-y-3"
          : "grid grid-cols-2 gap-3"
      }
    >
      {galleryImages.map((img, i) => (
        <div key={i} className="relative group">
          <div
            className="relative overflow-hidden cursor-zoom-in"
            onClick={() =>
              onImageClick(
                galleryImages.map((g) => ({ src: g.src, alt: g.alt })),
                i
              )
            }
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
            <p className="mt-2 text-center text-sm text-muted">
              {img.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <section className="space-y-6">
      {/* Section heading */}
      <h3 className="font-mono font-medium text-[11px] text-muted uppercase tracking-wide border-b border-border pb-2">
        {section.sectionTitle}
      </h3>

      {/* Layout variants */}
      {layout === "full-width" && (
        <>
          {bodyBlock}
          {hasGallery && (
            <div className="space-y-3">
              {galleryImages.map((img, i) => (
                <div key={i} className="relative group">
                  <div
                    className="relative overflow-hidden cursor-zoom-in"
                    onClick={() =>
                      onImageClick(
                        galleryImages.map((g) => ({
                          src: g.src,
                          alt: g.alt,
                        })),
                        i
                      )
                    }
                  >
                    <Image
                      src={img.thumbnail}
                      alt={img.alt}
                      width={1600}
                      height={900}
                      className="w-full h-auto"
                      style={{ maxHeight: "70vh", objectFit: "contain" }}
                    />
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                  </div>
                  {img.caption && (
                    <p className="mt-2 text-center text-sm text-muted">
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {layout === "side-by-side" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bodyBlock}
          {galleryBlock}
        </div>
      )}

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
