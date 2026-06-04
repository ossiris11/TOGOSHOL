export const contacts = {
  vk: 'https://vk.me/tog_pc',
  telegram: 'https://t.me/tog_pc',
  max: 'https://max.ru/tog_pc',
  email: 'mailto:hello@togoshol.ru',
};

export function buildContactMessage(text: string) {
  return encodeURIComponent(text);
}
