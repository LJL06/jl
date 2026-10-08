# Xia Xing Kai web fonts / 演示夏行楷网页字体

Display titles and journal bookmarks use the running-regular calligraphy font
演示夏行楷 (Slidexiaxing Regular), written by 刘锡栋 and released by SlideFont.
Body text, quotations, Latin hero lettering, and utility text keep their existing
font families.

## Source and license

- Authorized upstream: https://github.com/maoken-fonts/slidefont
- Upstream revision: `e6a0d2bcef0501849178b8c55047d80e26c6fedb`
- Original file: `fonts/Slidexiaxing-Regular.ttf`, version 1.000
- License: SIL Open Font License 1.1; the full license is included in `OFL.txt`.
- The upstream README includes the copyright holder's authorization to publish
  these fonts as open source. `AUTHORS.txt` preserves the upstream author list.

These WOFF2 files are web subsets, renamed **JL Xia Xing Web** to distinguish
them from the original desktop font. Glyph outlines have not been redesigned.
Copyright records are retained inside each font. The derived font files remain
under SIL OFL 1.1 and may not be sold by themselves.

## Loading

`xiaxing.css` uses `font-display: swap` and disjoint Unicode ranges. A small
title subset covers the current site's headings and article titles. Additional
512-character subsets retain the rest of the original font's character coverage
and are downloaded only when a future title needs their characters. Updating an
article does not require rebuilding the fonts. Characters absent from the
original font use the existing fallback stack.

The fonts are served from this site, without a new third-party font CDN.
