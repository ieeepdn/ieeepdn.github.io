const TITLES = /^(dr|prof|professor|mr|mrs|ms|miss|eng|ir|rev|sir|madam|mx)$/i

/** "Prof. Arjun Mehta" → "AM" — for portrait placeholders when there is no photo yet. */
export const initials = (name: string) =>
  name
    .replace(/[[\]().,]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !TITLES.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
