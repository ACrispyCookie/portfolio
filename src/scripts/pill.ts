// Home only: the top-bar lab pill is hidden while the hero widget is on screen (spec §4, Jason: "keep it as it was").
export function initPill(board: HTMLElement, pill: HTMLElement): void {
  new IntersectionObserver(
    // a batch can hold several entries for the board; the last one is current
    (entries) => {
      pill.hidden = entries[entries.length - 1].isIntersecting;
      pill.classList.remove('home-wait'); // the first answer replaces the starting state
    },
    { rootMargin: '-64px 0px 0px 0px' },
  ).observe(board);
}

const board = document.querySelector<HTMLElement>('.hero .board');
const pill = document.querySelector<HTMLElement>('.topbar .labpill');
if (board && pill) initPill(board, pill);
