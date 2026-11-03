import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import SiteShell from '@/components/SiteShell'
import { createClient } from '@/lib/supabase/server'

const GA_MEASUREMENT_ID = 'G-6GPBQQBQCC'

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  return 'https://sampigewebsite.vercel.app'
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getBaseUrl()

  try {
    const supabase = await createClient()

    const { data: general } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'general')
      .single()

    const { data: org } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'organization')
      .single()

    const favicon = general?.value?.favicon
    const logo = general?.value?.logo
    const name = org?.value?.name || 'Sampige Foundation'
    const tagline = org?.value?.tagline || 'Creating Change. Building Hope.'
    const description =
      org?.value?.description ||
      'Sampige Foundation is a non-profit organization in Malleshwaram, Bangalore dedicated to transforming lives through education, healthcare, sustainable development, photo frame recycling, and eco-friendly waste disposal.'

    const defaultTitle = `${name} — ${tagline}`

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: defaultTitle,
        template: `%s | ${name}`,
      },
      description,
      keywords: [
        'Sampige Foundation',
        'NGO India',
        'NGO Bangalore',
        'NGO Malleshwaram',
        'Charity Karnataka',
        'Community Development',
        'Education NGO',
        'Healthcare Non-profit',
        'Volunteer Karnataka',
        'Donate NGO India',
        'photo frame recycling',
        'recycle frames',
        'recycle frames Malleshwaram',
        'photo frame disposal Bangalore',
        'old photo frame recycling',
        'god frame recycling',
        'divine items disposal',
        'photo frame recycling near me',
        'frame recycling Bangalore',
        'eco-friendly waste disposal Bangalore',
        'corporate social responsibility Bangalore',
        'CSR activities Bangalore',
      ],
      authors: [{ name: name }],
      creator: name,
      publisher: name,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      icons: favicon
        ? {
            icon: favicon,
            shortcut: favicon,
            apple: favicon,
          }
        : {
            icon: '/favicon.ico',
          },
      openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: siteUrl,
        siteName: name,
        title: defaultTitle,
        description,
        images: logo
          ? [
              {
                url: logo,
                width: 1200,
                height: 630,
                alt: name,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: defaultTitle,
        description,
        images: logo ? [logo] : [],
      },
    }
  } catch (error) {
    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: 'Sampige Foundation — Creating Change. Building Hope.',
        template: '%s | Sampige Foundation',
      },
      description:
        'Sampige Foundation is a non-profit organization in Malleshwaram, Bangalore dedicated to transforming lives through education, healthcare, sustainable development, and photo frame recycling.',
      robots: {
        index: true,
        follow: true,
      },
    }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteUrl = getBaseUrl()
  const supabase = await createClient()

  let name = 'Sampige Foundation'
  let tagline = 'Creating Change. Building Hope.'
  let email = 'info@sampigefoundation.org'
  let phone = '+91 1234567890'
  let address = 'Malleshwaram, Bangalore, Karnataka, India'
  let logo = `${siteUrl}/logo.png`
  let socials: string[] = []

  try {
    const [orgData, socialData, generalData] = await Promise.all([
      supabase.from('site_settings').select('value').eq('key', 'organization').single(),
      supabase.from('site_settings').select('value').eq('key', 'social').single(),
      supabase.from('site_settings').select('value').eq('key', 'general').single(),
    ])

    if (orgData.data?.value) {
      name = orgData.data.value.name || name
      tagline = orgData.data.value.tagline || tagline
      email = orgData.data.value.email || email
      phone = orgData.data.value.phone || phone
      address = orgData.data.value.address || address
    }

    if (generalData.data?.value?.logo) {
      logo = generalData.data.value.logo
    }

    if (socialData.data?.value) {
      const s = socialData.data.value
      if (s.facebook) socials.push(s.facebook)
      if (s.instagram) socials.push(s.instagram)
      if (s.linkedin) socials.push(s.linkedin)
      if (s.twitter) socials.push(s.twitter)
      if (s.youtube) socials.push(s.youtube)
    }
  } catch (error) {
    console.error('Error fetching layout schema settings:', error)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NGO',
        '@id': `${siteUrl}/#organization`,
        name,
        url: siteUrl,
        logo,
        description: `${name} is a registered NGO in Malleshwaram, Bangalore working on education, healthcare, environmental sustainability, photo frame recycling, divine items disposal, and community development. Tagline: ${tagline}`,
        foundingDate: '2019',
        sameAs: socials,
        address: {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressLocality: 'Bangalore',
          addressRegion: 'Karnataka',
          postalCode: '560003',
          addressCountry: 'IN',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: phone,
          contactType: 'customer service',
          email: email,
          areaServed: 'IN',
          availableLanguage: ['English', 'Kannada', 'Hindi'],
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${siteUrl}/#localbusiness`,
        name: `${name} — Photo Frame Recycling & Eco Disposal`,
        image: logo,
        url: `${siteUrl}/services/photo-frame-recycling-bangalore`,
        telephone: phone,
        priceRange: 'Free',
        description: `Free photo frame recycling and divine items disposal service by ${name} in Malleshwaram, Bangalore. We collect, sort, and eco-friendly recycle old wooden, metal, plastic, and glass photo frames.`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressLocality: 'Bangalore',
          addressRegion: 'Karnataka',
          postalCode: '560003',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 12.9833,
          longitude: 77.5667,
        },
        areaServed: [
          {
            '@type': 'City',
            name: 'Bangalore',
          },
          {
            '@type': 'Place',
            name: 'Malleshwaram',
          },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Recycling & Disposal Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Photo Frame Recycling',
                description:
                  'Eco-friendly recycling of old wooden, metal, plastic, and glass photo frames in Bangalore.',
                areaServed: 'Bangalore, Karnataka',
                provider: {
                  '@id': `${siteUrl}/#organization`,
                },
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Divine Items & God Frame Disposal',
                description:
                  'Respectful and eco-friendly disposal of old god photo frames, divine idols, and religious items in Bangalore.',
                areaServed: 'Bangalore, Karnataka',
                provider: {
                  '@id': `${siteUrl}/#organization`,
                },
              },
            },
          ],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name,
        description: `Official website of ${name} — NGO in Malleshwaram, Bangalore.`,
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        inLanguage: 'en-IN',
      },
    ],
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-black text-white font-sans antialiased flex flex-col min-h-screen">
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>

        {/* CSquare360 Website Tracking — full form capture + page_view */}
        <Script id="csquare360-tracker" strategy="afterInteractive">
          {`
(function() {
  var lf = {
    id: 'e6b4afde-7892-4faa-9761-e7f063885b08',
    endpoint: 'https://csquare360.space/api/webhooks/website-visitor'
  };

  var visitorId = localStorage.getItem('lf_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substr(2, 16) + Date.now();
    localStorage.setItem('lf_visitor_id', visitorId);
  }

  var urlParams = new URLSearchParams(window.location.search);
  var baseData = {
    tracking_id: lf.id,
    visitor_id: visitorId,
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign')
  };

  function send(data) {
    try {
      fetch(lf.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'cors',
        keepalive: true
      }).catch(function(){});
    } catch (err) {}
  }

  function pickObj(obj, keys) {
    if (!obj) return '';
    var i, k, want, lower = {};
    for (i = 0; i < keys.length; i++) {
      k = keys[i];
      if (obj[k] != null && String(obj[k]).trim() !== '') return String(obj[k]).trim();
    }
    try {
      Object.keys(obj).forEach(function(key) {
        lower[String(key).toLowerCase()] = obj[key];
      });
    } catch (e) {}
    for (i = 0; i < keys.length; i++) {
      want = String(keys[i]).toLowerCase();
      if (lower[want] != null && String(lower[want]).trim() !== '') {
        return String(lower[want]).trim();
      }
    }
    return '';
  }

  function formToObject(form) {
    var out = {};
    try {
      var fd = new FormData(form);
      fd.forEach(function(val, key) {
        if (key == null || key === '') return;
        var s = val == null ? '' : String(val).trim();
        if (s === '') return;
        if (out[key] == null) out[key] = s;
        else if (Object.prototype.toString.call(out[key]) === '[object Array]') out[key].push(s);
        else out[key] = [out[key], s];
      });
    } catch (e1) {}

    try {
      if (form && form.querySelectorAll) {
        var fields = form.querySelectorAll('input, select, textarea');
        for (var i = 0; i < fields.length; i++) {
          var el = fields[i];
          var name = el.name || el.id || el.getAttribute('data-name') || '';
          if (!name) continue;
          var type = (el.type || '').toLowerCase();
          if (type === 'password') continue;
          if (type === 'checkbox' || type === 'radio') {
            if (!el.checked) continue;
          }
          var val2 = el.value;
          if (val2 == null || String(val2).trim() === '') continue;
          if (out[name] == null || out[name] === '') out[name] = String(val2).trim();
        }
      }
    } catch (e2) {}
    return out;
  }

  var NAME_KEYS = [
    'name', 'full_name', 'fullname', 'contact_name', 'contact_person',
    'your_name', 'username', 'first_name', 'fname', 'applicant_name',
    'company_name', 'company', 'organisation', 'organization'
  ];
  var PHONE_KEYS = [
    'phone', 'mobile', 'whatsapp', 'contact', 'tel', 'phone_number',
    'mobile_number', 'contact_number', 'whatsapp_number', 'phoneNumber', 'mobileNumber'
  ];
  var EMAIL_KEYS = [
    'email', 'e-mail', 'email_address', 'emailAddress', 'mail', 'work_email'
  ];

  send(Object.assign({}, baseData, {
    event_type: 'page_view',
    event: 'page_view'
  }));

  var startTime = Date.now();
  window.addEventListener('beforeunload', function() {
    var timeOnPage = Math.round((Date.now() - startTime) / 1000);
    var payload = Object.assign({}, baseData, {
      time_on_page: timeOnPage,
      event_type: 'page_exit',
      event: 'page_exit'
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          lf.endpoint,
          new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );
      } else {
        send(payload);
      }
    } catch (e) {
      send(payload);
    }
  });

  document.addEventListener('click', function(e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-lf-track]') : null;
    if (!el) return;
    var label = el.getAttribute('data-lf-track');
    send(Object.assign({}, baseData, {
      event_type: 'button_click',
      event: 'button_click',
      element_name: label,
      element_label: label,
      element_type: el.tagName === 'A' ? 'link' : 'button',
      element_id: el.id || null
    }));
  }, true);

  document.addEventListener('submit', function(e) {
    var form = e.target && e.target.closest ? e.target.closest('[data-lf-form]') : null;
    if (!form) return;
    var formObj = formToObject(form);
    var formName = form.getAttribute('data-lf-form') || 'form';
    send(Object.assign({}, baseData, {
      event_type: 'form_submit',
      event: 'form_submit',
      element_name: formName,
      element_label: formName,
      element_type: 'form',
      visitor_name: pickObj(formObj, NAME_KEYS),
      visitor_phone: pickObj(formObj, PHONE_KEYS),
      visitor_email: pickObj(formObj, EMAIL_KEYS),
      form_data: formObj,
      payload: formObj
    }));
  }, true);

  window.CSquare360 = {
    track: function(eventType, data) {
      send(Object.assign({}, baseData, {
        event_type: eventType,
        event: eventType
      }, data || {}));
    }
  };
})();
          `}
        </Script>

        <SiteShell>{children}</SiteShell>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#FAFAFA',
              border: '1px solid #FFB300',
            },
          }}
        />
      </body>
    </html>
  )
}