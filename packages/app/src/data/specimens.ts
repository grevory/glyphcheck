export interface ConfusableSet {
  key: string;
  label: string;
  chars: string;
}

export const CONFUSABLES: ConfusableSet[] = [
  { key: 'Il1',  label: 'Cap-I · lower-l · one',  chars: 'Il1' },
  { key: 'O0Q',  label: 'O · zero · Q',           chars: 'O0Q' },
  { key: 'B8',   label: 'B · eight',              chars: 'B8' },
  { key: '5S',   label: 'five · S',               chars: '5S' },
  { key: 'G6',   label: 'G · six',                chars: 'G6' },
  { key: '2Z',   label: 'two · Z',                chars: '2Z' },
  { key: '9g',   label: 'nine · g',               chars: '9gq' },
  { key: 'rnm',  label: 'r-n vs m',               chars: 'rn m' },
  { key: 'cld',  label: 'c-l vs d',               chars: 'cl d' },
  { key: 'vvw',  label: 'v-v vs w',               chars: 'vv w' },
  { key: 'bdpq', label: 'b · d · p · q',          chars: 'bdpq' },
];

export const CONFUSE_ALPHABET = 'IL1lO0QB8S5G6Z29giocrnmw';

export const NUMBER_ROWS = [
  '1,111.00',
  '8,080.50',
  '9,247.99',
  '1,000,000',
  '404',
  '-432.10',
  '0.75',
  '-12.05',
];

export const SPECIMEN_PRESETS: Record<string, string> = {
  pangram: 'Sphinx of black quartz, judge my vow. 0123456789',
  paragraph:
    'Legibility is how easily one letter is told from another; readability is how easily words and sentences flow. A good interface font keeps the 0 from the O, the 1 from the l, and the rn from the m. At 13px, on a Tuesday, in a hurry.',
  otp: 'Code: 8 0 G 5 / I l 1 O 0',
};
