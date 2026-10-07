// Page images of the layouts: page 1 of the example CV, the example letter, and the CV with a
// photo for the four layouts that have a photo slot. Rendered by the kit, exported from the canvas.
import type { ImageMetadata } from 'astro';
import type { LayoutKey } from '../../lib/apply-kit';

import classic from '../../assets/apply-kit/layouts/classic.png';
import modern from '../../assets/apply-kit/layouts/modern.png';
import compact from '../../assets/apply-kit/layouts/compact.png';
import din5008 from '../../assets/apply-kit/layouts/din5008.png';
import margin from '../../assets/apply-kit/layouts/margin.png';
import statement from '../../assets/apply-kit/layouts/statement.png';
import mono from '../../assets/apply-kit/layouts/mono.png';
import sidebar from '../../assets/apply-kit/layouts/sidebar.png';
import poster from '../../assets/apply-kit/layouts/poster.png';

import classicLetter from '../../assets/apply-kit/letter-en.png';
import modernLetter from '../../assets/apply-kit/pack/modern-letter.png';
import compactLetter from '../../assets/apply-kit/pack/compact-letter.png';
import din5008Letter from '../../assets/apply-kit/pack/din5008-letter.png';
import marginLetter from '../../assets/apply-kit/pack/margin-letter.png';
import statementLetter from '../../assets/apply-kit/pack/statement-letter.png';
import monoLetter from '../../assets/apply-kit/pack/mono-letter.png';
import sidebarLetter from '../../assets/apply-kit/pack/sidebar-letter.png';
import posterLetter from '../../assets/apply-kit/pack/poster-letter.png';

import statementPhoto from '../../assets/apply-kit/pack/statement-photo.png';
import monoPhoto from '../../assets/apply-kit/pack/mono-photo.png';
import sidebarPhoto from '../../assets/apply-kit/pack/sidebar-photo.png';
import posterPhoto from '../../assets/apply-kit/pack/poster-photo.png';

export const CV: Record<LayoutKey, ImageMetadata> = { classic, modern, compact, din5008, margin, statement, mono, sidebar, poster };
export const LETTER: Record<LayoutKey, ImageMetadata> = {
  classic: classicLetter, modern: modernLetter, compact: compactLetter, din5008: din5008Letter, margin: marginLetter,
  statement: statementLetter, mono: monoLetter, sidebar: sidebarLetter, poster: posterLetter,
};
export const PHOTO: Partial<Record<LayoutKey, ImageMetadata>> = { statement: statementPhoto, mono: monoPhoto, sidebar: sidebarPhoto, poster: posterPhoto };

export const coverImage = (k?: LayoutKey) => CV[k ?? 'classic'];
