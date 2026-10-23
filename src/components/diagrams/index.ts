// Every drawn project picture, by the `diagram` name in a project's front matter; cards and thumbnails both use it.
// Each takes `label` and the project's `milestones` (only Roadmap draws them).
import Runtime from './Runtime.astro';
import Threads from './Threads.astro';
import Homelab from './Homelab.astro';
import Dedup from './Dedup.astro';
import Alignment from './Alignment.astro';
import Roadmap from './Roadmap.astro';
import Flow from './Flow.astro';

export const diagrams = { runtime: Runtime, threads: Threads, homelab: Homelab, dedup: Dedup, alignment: Alignment, roadmap: Roadmap, flow: Flow };
