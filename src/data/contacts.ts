export const contacts = {
  vk: 'https://vk.me/tog_pc',
  telegram: 'https://t.me/tog_pc',
  instagram: 'https://www.instagram.com/tog.pc/',
  avito: 'https://www.avito.ru/brands/i112007990',
  phone: 'tel:+79524839393',
  phoneText: '+7 952 483-93-93',
};

export function buildContactMessage(text: string) {
  return encodeURIComponent(text);
}
