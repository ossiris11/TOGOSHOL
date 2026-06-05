export const contacts = {
  vk: 'https://vk.me/tog_pc',
  telegram: 'https://t.me/tog_pc',
  instagram: 'https://www.instagram.com/tog.pc/',
  avito: 'https://www.avito.ru/brands/i112007990',
  email: 'mailto:hello@togoshol.ru',
};

export function buildContactMessage(text: string) {
  return encodeURIComponent(text);
}
