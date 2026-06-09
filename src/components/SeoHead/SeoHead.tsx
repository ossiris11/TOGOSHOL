import { useEffect } from 'react';
import { getCanonicalUrl, siteUrl } from '../../data/seo';

type SeoHeadProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
  jsonLd?: unknown[];
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
}

export function SeoHead({ title, description, path, image = `${siteUrl}/og-image.svg`, jsonLd = [] }: SeoHeadProps) {
  useEffect(() => {
    const canonical = getCanonicalUrl(path);
    document.documentElement.lang = 'ru';
    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonical });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'ru_RU' });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });

    document.querySelectorAll('script[data-seo-jsonld="true"]').forEach((element) => element.remove());
    jsonLd.forEach((item) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoJsonld = 'true';
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
    });
  }, [description, image, jsonLd, path, title]);

  return null;
}
