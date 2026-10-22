// Every drawn project picture, by the `diagram` name in a project's front matter; cards and thumbnails both use it.
import Runtime from './Runtime.astro';
import Threads from './Threads.astro';
import Homelab from './Homelab.astro';
import Dedup from './Dedup.astro';
import Alignment from './Alignment.astro';

export const diagrams = { runtime: Runtime, threads: Threads, homelab: Homelab, dedup: Dedup, alignment: Alignment };
