import React, { useEffect } from 'react';
import { WebsiteSettings } from '../types';

interface SeoHeadProps {
  settings?: WebsiteSettings | null;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ settings }) => {
  useEffect(() => {
    const metaTitle =
      settings?.seoMetaTitle ||
      'Alif Trust - ভেরিফাইড সোশ্যাল মিডিয়া ও চ্যানেল মার্কেটপ্লেস | Buy & Sell Verified Channels';

    const metaDescription =
      settings?.seoMetaDescription ||
      'Alif Trust (alif sheen group) - ১০০% বিশ্বস্ত ও ভেরিফাইড ফেসবুক পেজ, ইউটিউব চ্যানেল, টিকটক ও ইনস্টাগ্রাম অ্যাকাউন্ট কেনাবেচার ডিজিটাল এসক্রো মার্কেটপ্লেস।';

    const focusKeywords =
      settings?.seoFocusKeywords ||
      'facebook page buy sell, buy youtube channel bangladesh, monetized channel marketplace, alif sheen group, alif trust escrow, ফেসবুক পেজ বিক্রি, ইউটিউব চ্যানেল কেনাবেচা, বিকাশ নগদ চ্যানেল ক্রয়';

    const canonicalUrl = settings?.seoCanonicalUrl || 'https://official1.online';

    const ogImageUrl =
      settings?.seoOgImageUrl ||
      'https://official1.online/assets/aistudio/Screenshot_20261101-222202_aa9017f6.png';

    const isIndexActive = settings?.seoRobotsIndex !== false;
    const robotsContent = isIndexActive
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, nofollow';

    // 1. Update Document Title
    document.title = metaTitle;

    // Helper: update or create <meta>
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper: update or create <link rel="...">
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Standard Search Meta Tags
    setMetaTag('name', 'description', metaDescription);
    setMetaTag('name', 'keywords', focusKeywords);
    setMetaTag('name', 'robots', robotsContent);
    setMetaTag('name', 'googlebot', robotsContent);
    setLinkTag('canonical', canonicalUrl);

    // 3. OpenGraph / Facebook Tags
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', settings?.siteName || 'Alif Trust Escrow');
    setMetaTag('property', 'og:title', metaTitle);
    setMetaTag('property', 'og:description', metaDescription);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', ogImageUrl);
    setMetaTag('property', 'og:locale', 'bn_BD');

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', metaTitle);
    setMetaTag('name', 'twitter:description', metaDescription);
    setMetaTag('name', 'twitter:image', ogImageUrl);

    // 5. Google Search Console Verification Token
    if (settings?.seoGoogleSearchConsoleCode && settings.seoGoogleSearchConsoleCode.trim()) {
      const code = settings.seoGoogleSearchConsoleCode.trim();
      // Extract content if user pasted full meta tag: <meta name="google-site-verification" content="..." />
      const extracted = code.includes('content="')
        ? (code.match(/content="([^"]+)"/) || [])[1] || code
        : code;
      setMetaTag('name', 'google-site-verification', extracted);
    }

    // 6. Bing Webmaster Verification Token
    if (settings?.seoBingWebmasterCode && settings.seoBingWebmasterCode.trim()) {
      const bCode = settings.seoBingWebmasterCode.trim();
      const extracted = bCode.includes('content="')
        ? (bCode.match(/content="([^"]+)"/) || [])[1] || bCode
        : bCode;
      setMetaTag('name', 'msvalidate.01', extracted);
    }

    // 7. Schema.org JSON-LD Structured Data
    if (settings?.seoEnableSchemaJsonLd !== false) {
      let script = document.getElementById('seo-jsonld-schema') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-jsonld-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }

      const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${canonicalUrl}#website`,
            url: canonicalUrl,
            name: settings?.siteName || 'Alif Trust',
            description: metaDescription,
            publisher: {
              '@id': `${canonicalUrl}#organization`
            },
            potentialAction: {
              '@type': 'SearchAction',
              target: `${canonicalUrl}/?search={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          },
          {
            '@type': 'Organization',
            '@id': `${canonicalUrl}#organization`,
            name: 'Alif Trust - Alif Sheen Group',
            url: canonicalUrl,
            logo: ogImageUrl,
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Support',
              email: settings?.contactEmail || 'alifsheenshopping@gmail.com',
              telephone: settings?.whatsappSupport || '+8801700000000'
            }
          },
          {
            '@type': 'Store',
            '@id': `${canonicalUrl}#marketplace`,
            name: 'Alif Trust Verified Marketplace & Digital Escrow',
            url: canonicalUrl,
            priceRange: '$50 - $50,000',
            paymentAccepted: 'bKash, Nagad, Bank Transfer, USDT TRC20, Binance Pay',
            currenciesAccepted: 'USD, BDT',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.95',
              reviewCount: '158',
              bestRating: '5',
              worstRating: '1'
            }
          }
        ]
      };

      script.textContent = JSON.stringify(structuredData, null, 2);
    }

    // 8. Meta / Facebook Pixel Injection (if configured)
    if (settings?.seoFacebookPixelId && settings.seoFacebookPixelId.trim()) {
      const pixelId = settings.seoFacebookPixelId.trim();
      const pixelScriptId = 'facebook-pixel-script';
      if (!document.getElementById(pixelScriptId)) {
        const pScript = document.createElement('script');
        pScript.id = pixelScriptId;
        pScript.textContent = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(pScript);
      }
    }
  }, [settings]);

  return null;
};
