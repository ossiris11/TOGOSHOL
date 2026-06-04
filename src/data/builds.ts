export type Build = {
  badge: string;
  badgeType?: 'default' | 'available';
  title: string;
  subtitle: string;
  specs: string[];
  price: string;
  cta: string;
  sourceId?: string;
  image?: string;
};

export const builds: Build[] = [
  {
    badge: 'В наличии',
    badgeType: 'available',
    title: 'START',
    subtitle: 'Для Full HD игр и учёбы',
    specs: ['RTX / Radeon на выбор', '16–32 ГБ RAM', 'SSD NVMe', 'Тихое охлаждение'],
    price: 'от 75 000 ₽',
    cta: 'Уточнить наличие',
    sourceId: 'fallback-start',
  },
  {
    badge: 'Хит',
    badgeType: 'default',
    title: 'PRO',
    subtitle: 'Для 2K-гейминга, стриминга и монтажа',
    specs: ['Мощная видеокарта', '32 ГБ RAM', 'Быстрый NVMe SSD', 'RGB / airflow корпус'],
    price: 'от 125 000 ₽',
    cta: 'Подобрать PRO',
    sourceId: 'fallback-pro',
  },
  {
    badge: 'Под заказ',
    badgeType: 'default',
    title: 'ULTRA',
    subtitle: 'Максимальная производительность и премиальная эстетика',
    specs: ['Флагманская видеокарта', '32–64 ГБ RAM', 'СЖО / кастомное охлаждение', 'Индивидуальный дизайн'],
    price: 'от 190 000 ₽',
    cta: 'Собрать ULTRA',
    sourceId: 'fallback-ultra',
  },
];
