/**
 * Starting layouts: the default sections of a chapter page, and templates for new sub-pages.
 * Placeholder text is in [square brackets] so it is obvious what still needs writing.
 */

type Node = Record<string, unknown>
const text = (t: string): Node => ({ type: 'text', text: t, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
const para = (t: string): Node => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, textStyle: '', children: [text(t)] })

/** Minimal Lexical document from plain paragraphs. */
export const richText = (...paragraphs: string[]) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: paragraphs.map(para) },
})

type AnyBlock = Record<string, unknown> & { blockType: string }

export function defaultChapterLayout(shortName: string): AnyBlock[] {
  return [
    { blockType: 'chapterAbout' },
    { blockType: 'pageLinks', eyebrow: `${shortName} flagships`, heading: 'Our signature events & projects' },
    { blockType: 'events', eyebrow: `${shortName} events`, heading: 'Recent events.', show: 'auto', limit: 6 },
    { blockType: 'stories', eyebrow: 'What we’ve been doing', heading: 'Stories & recaps.', limit: 3 },
    { blockType: 'gallery', eyebrow: 'Moments', heading: `${shortName} in pictures.`, layout: 'mosaic', background: 'dark' },
    { blockType: 'people', eyebrow: 'Committee', heading: `Meet the ${shortName} team`, source: 'committee' },
    {
      blockType: 'cta',
      heading: `Get involved with ${shortName}.`,
      text: 'Join the team, pitch an event or volunteer at the next one. Every chapter committee is built by students like you.',
      buttons: [{ label: 'Volunteer', url: '/volunteer', variant: 'primary' }],
    },
  ]
}

export const pageTemplates = {
  competition: (title: string): AnyBlock[] => [
    {
      blockType: 'hero',
      eyebrow: '[Flagship competition]',
      heading: title,
      text: '[One or two sentences: what the competition is and who can take part.]',
      dateLabel: '[Date · venue]',
      buttons: [{ label: 'Register', url: '#register', variant: 'primary' }],
    },
    {
      blockType: 'text',
      eyebrow: 'About',
      heading: `What is ${title}?`,
      width: 'split',
      content: richText('[Describe the challenge in 2–3 short paragraphs: the problem, the format, and why students should join.]'),
    },
    {
      blockType: 'cards',
      eyebrow: 'Categories',
      heading: 'Choose your track.',
      columns: '3',
      items: [
        { title: '[Track 1]', tag: '[Team of 2–4]', text: '[What teams build or solve in this track.]' },
        { title: '[Track 2]', tag: '[Open to all]', text: '[What teams build or solve in this track.]' },
        { title: '[Track 3]', tag: '[Undergraduates]', text: '[What teams build or solve in this track.]' },
      ],
    },
    {
      blockType: 'timeline',
      eyebrow: 'Timeline',
      heading: 'Key dates.',
      items: [
        { when: '[Date]', title: 'Registrations open', text: '[How to register]' },
        { when: '[Date]', title: 'Preliminary round', text: '[Format of the round]' },
        { when: '[Date]', title: 'Grand finale', text: '[Where and when]' },
      ],
    },
    {
      blockType: 'cards',
      eyebrow: 'Prizes',
      heading: 'What’s at stake.',
      columns: '3',
      items: [
        { title: '[Prize]', tag: '1st place', text: '[Prize details]' },
        { title: '[Prize]', tag: '2nd place', text: '[Prize details]' },
        { title: '[Prize]', tag: '3rd place', text: '[Prize details]' },
      ],
    },
    { blockType: 'events', eyebrow: 'Past editions', heading: 'From the archive.', show: 'past', limit: 3, titleContains: title },
    {
      blockType: 'faq',
      heading: 'Questions.',
      items: [
        { q: '[Who can take part?]', a: '[Answer]' },
        { q: '[Is there a registration fee?]', a: '[Answer]' },
      ],
    },
    {
      blockType: 'cta',
      heading: '[Ready to compete?]',
      text: '[Registrations close on …]',
      buttons: [{ label: 'Register your team', url: '#register', variant: 'primary' }],
    },
  ],
  conference: (title: string): AnyBlock[] => [
    {
      blockType: 'hero',
      eyebrow: '[IEEE conference · 1st edition]',
      heading: title,
      text: '[One or two sentences: the theme, and who should submit and attend.]',
      dateLabel: '[12–13 Dec 2026 · Faculty of Engineering, University of Peradeniya]',
      buttons: [
        { label: 'Call for papers', url: '#call-for-papers', variant: 'primary' },
        { label: 'Register', url: '#register', variant: 'secondary' },
      ],
    },
    {
      blockType: 'text',
      eyebrow: 'About',
      heading: `About ${title}`,
      width: 'split',
      content: richText(
        '[What the conference is about, in 2–3 short paragraphs: the theme, why it matters, who organises it.]',
        '[Accepted and presented papers will be submitted for inclusion in IEEE Xplore — confirm the exact wording with the IEEE Conference Services approval.]',
      ),
    },
    {
      blockType: 'stats',
      items: [
        { value: '[6]', label: '[tracks]' },
        { value: '[4]', label: '[keynote speakers]' },
        { value: '[300+]', label: '[expected participants]' },
      ],
      background: 'paper',
      spacing: 'compact',
    },
    {
      blockType: 'cards',
      eyebrow: 'Call for papers',
      heading: 'Tracks & topics.',
      intro: '[Original, unpublished papers are invited in the following tracks.]',
      columns: '3',
      items: [
        { title: '[Track 1: Power & Energy]', tag: '[Track 1]', text: '[Topics: smart grids, renewable integration, …]' },
        { title: '[Track 2: Communications & Networks]', tag: '[Track 2]', text: '[Topics: 5G/6G, antennas, IoT, …]' },
        { title: '[Track 3: Computing & AI]', tag: '[Track 3]', text: '[Topics: machine learning, embedded systems, …]' },
      ],
    },
    {
      blockType: 'timeline',
      eyebrow: 'Important dates',
      heading: 'Key dates.',
      items: [
        { when: '[15 Aug 2026]', title: 'Paper submission deadline', text: '[Full papers, 4–6 pages, IEEE format]' },
        { when: '[30 Sep 2026]', title: 'Notification of acceptance' },
        { when: '[20 Oct 2026]', title: 'Camera-ready papers & author registration' },
        { when: '[12–13 Dec 2026]', title: 'Conference days' },
      ],
    },
    {
      blockType: 'cta',
      anchor: 'call-for-papers',
      heading: 'Submit your paper.',
      text: '[Papers are submitted through … (Microsoft CMT / EasyChair). Use the IEEE conference template; papers are double-blind reviewed.]',
      buttons: [
        { label: 'Submit a paper', url: '[paste the submission system link]', variant: 'primary' },
        { label: 'Paper template', url: 'https://www.ieee.org/conferences/publishing/templates.html', variant: 'secondary' },
      ],
    },
    {
      blockType: 'speakers',
      eyebrow: 'Keynotes',
      heading: 'Keynote speakers.',
      columns: '3',
      items: [
        { name: '[Speaker name]', position: 'Keynote speaker', affiliation: '[Title, University / Company]', talk: '[Talk title]', bio: '[Short biography, 80–150 words.]' },
        { name: '[Speaker name]', position: 'Keynote speaker', affiliation: '[Title, University / Company]', talk: '[Talk title]', bio: '[Short biography, 80–150 words.]' },
        { name: '[Speaker name]', position: 'Keynote speaker', affiliation: '[Title, University / Company]', talk: '[Talk title]', bio: '[Short biography, 80–150 words.]' },
      ],
    },
    {
      blockType: 'schedule',
      eyebrow: 'Programme',
      heading: 'Conference schedule.',
      intro: '[The detailed programme is published after paper acceptance.]',
      days: [
        {
          label: 'Day 1',
          date: '[Thursday 12 December]',
          slots: [
            { time: '08:30', end: '09:15', kind: 'ceremony', title: 'Registration & opening ceremony' },
            { time: '09:15', end: '10:15', kind: 'keynote', title: '[Keynote 1 title]', speaker: '[Speaker name]', room: '[Main hall]' },
            { time: '10:15', end: '10:45', kind: 'break', title: 'Tea break' },
            { time: '10:45', end: '12:30', kind: 'session', title: '[Technical session 1A]', speaker: '[Session chair]', room: '[Hall A · Track 1]' },
            { time: '10:45', end: '12:30', kind: 'session', title: '[Technical session 1B]', speaker: '[Session chair]', room: '[Hall B · Track 2]' },
            { time: '12:30', end: '13:30', kind: 'break', title: 'Lunch' },
          ],
        },
        {
          label: 'Day 2',
          date: '[Friday 13 December]',
          slots: [
            { time: '09:00', end: '10:00', kind: 'keynote', title: '[Keynote 2 title]', speaker: '[Speaker name]', room: '[Main hall]' },
            { time: '10:00', end: '12:00', kind: 'workshop', title: '[Tutorial / workshop]', room: '[Lab]' },
            { time: '15:30', end: '16:30', kind: 'ceremony', title: 'Best paper awards & closing' },
          ],
        },
      ],
    },
    {
      blockType: 'fees',
      eyebrow: 'Registration',
      heading: 'Registration fees.',
      column1: 'Early bird · [until 20 Oct]',
      column2: 'Regular',
      rows: [
        { category: 'IEEE student member', note: '[Valid IEEE membership number required]', price1: '[LKR 5,000]', price2: '[LKR 6,500]', highlight: true },
        { category: 'Student (non-member)', price1: '[LKR 6,500]', price2: '[LKR 8,000]' },
        { category: 'IEEE member', price1: '[LKR 12,000]', price2: '[LKR 15,000]' },
        { category: 'Non-member', price1: '[LKR 15,000]', price2: '[LKR 18,000]' },
        { category: 'Foreign participant', price1: '[USD 150]', price2: '[USD 200]' },
      ],
      footnote: '[What the fee includes (proceedings, meals, conference kit), how to pay, and the refund policy. At least one author of each accepted paper must register.]',
      buttons: [{ label: 'Register', url: '#register', variant: 'primary' }],
    },
    {
      blockType: 'venue',
      eyebrow: 'Venue',
      heading: 'Getting there.',
      venueName: 'Faculty of Engineering, University of Peradeniya',
      address: 'Peradeniya 20400, Sri Lanka',
      showMap: true,
      notes: [
        { title: 'Getting here', text: '[From Colombo: about 3 hours by train or bus to Peradeniya. From Kandy: 15 minutes.]' },
        { title: 'Accommodation', text: '[Recommended hotels near Kandy and Peradeniya, with any conference rates.]' },
        { title: 'Visas', text: '[Foreign participants apply for an ETA; invitation letters on request.]' },
      ],
    },
    {
      blockType: 'people',
      eyebrow: 'Organisers',
      heading: 'Organising committee.',
      source: 'custom',
      items: [
        { name: '[Name]', position: 'General chair', organisation: '[Department, University of Peradeniya]' },
        { name: '[Name]', position: 'Technical programme chair', organisation: '[Affiliation]' },
        { name: '[Name]', position: 'Publication chair', organisation: '[Affiliation]' },
        { name: '[Name]', position: 'Student organising chair', organisation: 'IEEE Student Branch, University of Peradeniya' },
      ],
    },
    {
      blockType: 'faq',
      heading: 'Questions.',
      items: [
        { q: '[Will the proceedings be in IEEE Xplore?]', a: '[Answer]' },
        { q: '[Can I present online?]', a: '[Answer]' },
        { q: '[Who do I contact?]', a: '[Email address of the organising committee]' },
      ],
    },
    {
      blockType: 'cta',
      anchor: 'register',
      heading: '[Registrations are open.]',
      text: '[Register by … for the early-bird fee. Replace this section with a Form section to take registrations on this site.]',
      buttons: [{ label: 'Register now', url: '[registration link]', variant: 'primary' }],
    },
  ],
  project: (title: string): AnyBlock[] => [
    { blockType: 'hero', eyebrow: '[Project]', heading: title, text: '[One sentence: what this project does and for whom.]' },
    { blockType: 'text', eyebrow: 'The idea', heading: 'Why we started.', width: 'split', content: richText('[The problem, in 2–3 sentences.]', '[What the team built and how.]') },
    { blockType: 'stats', eyebrow: 'Impact', heading: 'So far.', items: [{ value: '[100+]', label: '[people reached]' }, { value: '[5]', label: '[schools]' }] },
    { blockType: 'gallery', eyebrow: 'Moments', heading: 'In pictures.', layout: 'rows' },
    { blockType: 'cta', heading: '[Want to help?]', text: '[How others can join or support.]', buttons: [{ label: 'Get in touch', url: '/contact', variant: 'primary' }] },
  ],
  info: (title: string): AnyBlock[] => [
    { blockType: 'hero', heading: title, text: '[A short introduction.]' },
    { blockType: 'text', content: richText('[Write the page here.]') },
  ],
  blank: (): AnyBlock[] => [],
}

export type PageTemplate = keyof typeof pageTemplates
