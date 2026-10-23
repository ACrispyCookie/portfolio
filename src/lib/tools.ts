// A project's tools as pills (Jason, 2026-10-22): up to six in full; a longer list shows five and "+N", with the rest in its title.
export const toolTags = (all: string[]) => (all.length <= 6 ? { shown: all, rest: [] as string[] } : { shown: all.slice(0, 5), rest: all.slice(5) });
