import { faqItems } from './faq';
import { contacts } from './contacts';
import { getProductViews } from '../lib/products';
import type { Build } from './builds';

export const siteUrl = 'https://tog-pc.ru';

export const businessInfo = {
  name: 'TOGOSHOL',
  legalName: 'TOGOSHOL PC',
  url: siteUrl,
  logo: `${siteUrl}/og-image.svg`,
  image: `${siteUrl}/og-image.svg`,
  telephone: '+79524839393',
  openingHours: 'Mo-Su 09:00-00:00',
  geo: {
    latitude: 58.542829,
    longitude: 31.299414,
  },
  address: {
    streetAddress: 'Парковая 14к6',
    addressLocality: 'Великий Новгород',
    addressRegion: 'Новгородская область',
    postalCode: '173000',
    addressCountry: 'RU',
  },
  areaServed: ['Великий Новгород', 'Новгородская область', 'Россия'],
  priceRange: '₽₽',
  sameAs: [contacts.vk, contacts.telegram, contacts.instagram, contacts.avito],
} as const;

export const seoPages = {
  home: {
    path: '/',
    title: 'Игровые ПК в Великом Новгороде - TOGOSHOL',
    description:
      'Готовые игровые ПК и сборка компьютеров на заказ в Великом Новгороде. TOGOSHOL подбирает комплектующие, тестирует сборки и готовит ПК к запуску.',
  },
  gamingPcNovgorod: {
    path: '/igrovye-pk-velikiy-novgorod',
    title: 'Игровые ПК в Великом Новгороде - готовые сборки TOGOSHOL',
    description:
      'Купить игровой ПК в Великом Новгороде: готовые сборки TOGOSHOL, подбор под Full HD, 2K и 4K, стресс-тесты, настройка и самовывоз.',
  },
  customPcNovgorod: {
    path: '/sborka-pk-na-zakaz-velikiy-novgorod',
    title: 'Сборка ПК на заказ в Великом Новгороде - TOGOSHOL',
    description:
      'Сборка компьютера на заказ в Великом Новгороде под игры, работу, стриминг и бюджет. Подбор CPU, GPU, корпуса, охлаждения и настройка системы.',
  },
  contacts: {
    path: '/contacts',
    title: 'Контакты TOGOSHOL - игровые ПК в Великом Новгороде',
    description:
      'Контакты TOGOSHOL: консультация по игровым ПК, сборке компьютера на заказ, самовывозу в Великом Новгороде и доставке по России.',
  },
  upgradePcNovgorod: {
    path: '/upgrade-pc-velikiy-novgorod',
    title: 'Апгрейд ПК в Великом Новгороде - TOGOSHOL',
    description:
      'Апгрейд игрового ПК в Великом Новгороде: подбор видеокарты, процессора, памяти, SSD, охлаждения и проверка совместимости комплектующих.',
  },
} as const;

export const categorySeoPages = {
  'full-hd': {
    path: '/catalog/full-hd',
    title: 'Игровые ПК для Full HD в Великом Новгороде - TOGOSHOL',
    description: 'Готовые игровые ПК для Full HD: киберспорт, учеба, популярные игры и разумный бюджет. Подбор и самовывоз в Великом Новгороде.',
    heading: 'Игровые ПК для Full HD',
    intro: 'Сборки для Full HD подходят для киберспорта, учебы, популярных онлайн-игр и комфортного старта без лишней переплаты.',
  },
  '2k': {
    path: '/catalog/2k',
    title: 'Игровые ПК для 2K в Великом Новгороде - TOGOSHOL',
    description: 'Сборки TOGOSHOL для 2K-гейминга: RTX/Radeon, быстрый процессор, 32GB RAM и запас под современные игры.',
    heading: 'Игровые ПК для 2K-гейминга',
    intro: '2K-сборки дают хороший баланс цены, FPS и запаса на будущие игры. Подберем вариант под монитор и бюджет.',
  },
  '4k': {
    path: '/catalog/4k',
    title: 'Игровые ПК для 4K и стриминга в Великом Новгороде - TOGOSHOL',
    description: 'Мощные игровые ПК для 4K, стриминга, монтажа и тяжелых задач. Флагманские сборки TOGOSHOL в Великом Новгороде.',
    heading: 'Игровые ПК для 4K, стриминга и монтажа',
    intro: 'Флагманские конфигурации для высоких настроек, тяжелых проектов, стриминга и долгого запаса производительности.',
  },
  rtx: {
    path: '/catalog/rtx',
    title: 'Игровые ПК с RTX в Великом Новгороде - TOGOSHOL',
    description: 'Игровые компьютеры с видеокартами NVIDIA RTX: готовые сборки и ПК на заказ в Великом Новгороде.',
    heading: 'Игровые ПК с NVIDIA RTX',
    intro: 'RTX-сборки подходят для современных игр, DLSS, трассировки лучей, стриминга и рабочих задач с GPU-ускорением.',
  },
  ryzen: {
    path: '/catalog/ryzen',
    title: 'Игровые ПК на Ryzen в Великом Новгороде - TOGOSHOL',
    description: 'Готовые игровые ПК и кастомные сборки на AMD Ryzen в Великом Новгороде: подбор под игры, работу и бюджет.',
    heading: 'Игровые ПК на AMD Ryzen',
    intro: 'Ryzen-сборки часто дают сильное соотношение цены и производительности для игр, работы и дальнейшего апгрейда.',
  },
  intel: {
    path: '/catalog/intel',
    title: 'Игровые ПК на Intel в Великом Новгороде - TOGOSHOL',
    description: 'Игровые компьютеры на Intel Core: готовые ПК и сборка на заказ в Великом Новгороде.',
    heading: 'Игровые ПК на Intel Core',
    intro: 'Intel-сборки подходят для игр, учебы, работы и конфигураций, где важны высокая частота и стабильная производительность.',
  },
} as const;

export type CategorySlug = keyof typeof categorySeoPages;

export type SeoPageKey = keyof typeof seoPages;

export function getCanonicalUrl(path: string) {
  return `${siteUrl}${path === '/' ? '/' : path}`;
}

export function getHomeJsonLd(sourceProducts: Build[]) {
  const products = getProductViews(sourceProducts)
    .filter((product) => product.priceValue > 0)
    .slice(0, 8)
    .map((product) => ({
      '@type': 'Product',
      name: `Игровой ПК ${product.normalizedTitle}`,
      description: `${product.useCase}: ${product.cleanSpecs.slice(0, 4).join(', ')}`,
      brand: { '@type': 'Brand', name: 'TOGOSHOL' },
      category: 'Игровой компьютер',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'RUB',
        price: product.priceValue,
        availability: 'https://schema.org/InStock',
        url: `${siteUrl}/#catalog`,
      },
    }));

  return [
    getBusinessJsonLd(),
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'TOGOSHOL',
      inLanguage: 'ru-RU',
      publisher: { '@id': `${siteUrl}/#business` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
    ...products,
  ];
}

export function getBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ComputerStore'],
    '@id': `${siteUrl}/#business`,
    name: businessInfo.name,
    legalName: businessInfo.legalName,
    url: businessInfo.url,
    logo: businessInfo.logo,
    image: businessInfo.image,
    telephone: businessInfo.telephone,
    openingHours: businessInfo.openingHours,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: businessInfo.geo.latitude,
      longitude: businessInfo.geo.longitude,
    },
    address: {
      '@type': 'PostalAddress',
      ...businessInfo.address,
    },
    areaServed: businessInfo.areaServed.map((name) => ({ '@type': 'Place', name })),
    priceRange: businessInfo.priceRange,
    sameAs: businessInfo.sameAs,
    makesOffer: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Сборка ПК на заказ в Великом Новгороде' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Готовые игровые ПК TOGOSHOL' } },
    ],
  };
}

type SeoPageLike = {
  path: string;
  title: string;
  description: string;
};

export function getLocalPageJsonLd(page: SeoPageLike, serviceName: string) {
  const pageUrl = getCanonicalUrl(page.path);

  return [
    getBusinessJsonLd(),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.title,
      description: page.description,
      inLanguage: 'ru-RU',
      about: { '@id': `${siteUrl}/#business` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: serviceName,
      provider: { '@id': `${siteUrl}/#business` },
      areaServed: { '@type': 'City', name: 'Великий Новгород' },
      serviceType: serviceName,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: page.title, item: pageUrl },
      ],
    },
  ];
}
