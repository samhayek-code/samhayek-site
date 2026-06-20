import {
  type Icon,
  CirclesThree,
  BoundingBox,
  MusicNote,
  Eye,
  Pen,
  Code,
  DownloadSimple,
  Tag,
  ChatCircle,
  Flask,
} from "@phosphor-icons/react";

// One Phosphor icon per category, keyed by ItemType / filter name.
// Rendered solid (weight="fill") everywhere — card labels, nav filters, modal label.
export const categoryIcons: Record<string, Icon> = {
  Everything: CirclesThree,
  Design: BoundingBox,
  Music: MusicNote,
  Art: Eye,
  Writing: Pen,
  Code,
  Downloads: DownloadSimple,
  Shop: Tag,
  Connect: ChatCircle,
  Lab: Flask,
};
