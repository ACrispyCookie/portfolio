// Every drawn project picture, by the `diagram` name in a project's front matter; cards and thumbnails both use it.
// Each takes `label` and the project's `milestones` (only Roadmap draws them).
import Runtime from './Runtime.astro';
import Threads from './Threads.astro';
import Homelab from './Homelab.astro';
import Dedup from './Dedup.astro';
import Alignment from './Alignment.astro';
import Roadmap from './Roadmap.astro';
import Flow from './Flow.astro';
import Verify from './Verify.astro';
import TimeSlice from './TimeSlice.astro';
import TupleTake from './TupleTake.astro';
import Migrate from './Migrate.astro';
import Session from './Session.astro';
import LabWiring from './LabWiring.astro';
import DvdPipe from './DvdPipe.astro';

export const diagrams = { runtime: Runtime, threads: Threads, homelab: Homelab, dedup: Dedup, alignment: Alignment, roadmap: Roadmap, flow: Flow, verify: Verify, timeslice: TimeSlice, tupletake: TupleTake, migrate: Migrate, session: Session, labwiring: LabWiring, dvdpipe: DvdPipe };
/** A drawing's shape (width over height, from its viewBox), so a page can size it to fit the screen. */
export const shapes: Partial<Record<keyof typeof diagrams, number>> = { flow: 340 / 196, verify: 340 / 300, timeslice: 340 / 226, tupletake: 340 / 131, migrate: 340 / 150, session: 340 / 150, labwiring: 340 / 131, dvdpipe: 340 / 131 };
