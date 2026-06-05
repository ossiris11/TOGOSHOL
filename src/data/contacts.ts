export const contacts = {
  vk: 'https://vk.me/tog_pc',
  telegram: 'https://t.me/tog_pc',
  instagram: 'https://www.instagram.com/tog.pc/',
  avito: 'https://www.avito.ru/velikiy_novgorod?q=TOGOSHOL',
  email: 'mailto:hello@togoshol.ru',
};

export function buildContactMessage(text: string) {
  return encodeURIComponent(text);
}
