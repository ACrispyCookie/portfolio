import { defineMiddleware } from 'astro:middleware';

// Links to other sites open in a new tab, so the portfolio stays open behind them (Jason, 2026-10-23). Done here, on
// every page as it is built, so no component has to remember it; links within the site keep the same tab.
export const newTab = (html: string) =>
  html.replace(/<a\s[^>]*>/g, (tag) => {
    if (!/\shref="https?:/.test(tag) || /\starget=/.test(tag)) return tag;
    const rel = /\srel="([^"]*)"/.exec(tag);
    const withRel = rel ? tag.replace(rel[0], ` rel="${[...new Set([...rel[1].split(/\s+/).filter(Boolean), 'noopener'])].join(' ')}"`) : tag.replace(/>$/, ' rel="noopener">');
    return withRel.replace(/>$/, ' target="_blank">');
  });

export const onRequest = defineMiddleware(async (_, next) => {
  const res = await next();
  if (!res.headers.get('content-type')?.includes('text/html')) return res;
  return new Response(newTab(await res.text()), { status: res.status, headers: res.headers });
});
