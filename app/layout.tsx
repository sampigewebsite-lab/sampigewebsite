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

        {/* CSquare360 Universal Auto-Tracker Script */}
        <Script id="csquare360-tracker" strategy="afterInteractive">
          {`
            (function() {
              var trackingId = 'e6b4afde-7892-4faa-9761-e7f063885b08';
              var endpoint = 'https://csquare360.space/api/webhooks/website-visitor';

              var visitorId = localStorage.getItem('lf_visitor_id');
              if (!visitorId) {
                visitorId = 'v_' + Math.random().toString(36).substr(2, 16) + Date.now();
                localStorage.setItem('lf_visitor_id', visitorId);
              }

              function getPayload(extra) {
                var urlParams = new URLSearchParams(window.location.search);
                var data = {
                  tracking_id: trackingId,
                  visitor_id: visitorId,
                  page_url: window.location.href,
                  page_title: document.title,
                  referrer: document.referrer,
                  user_agent: navigator.userAgent,
                  utm_source: urlParams.get('utm_source'),
                  utm_medium: urlParams.get('utm_medium'),
                  utm_campaign: urlParams.get('utm_campaign')
                };
                if (extra) {
                  for (var k in extra) {
                    if (Object.prototype.hasOwnProperty.call(extra, k)) {
                      data[k] = extra[k];
                    }
                  }
                }
                return data;
              }

              function sendEvent(data) {
                var bodyStr = JSON.stringify(data);
                if (navigator.sendBeacon) {
                  try {
                    var blob = new Blob([bodyStr], { type: 'application/json' });
                    if (navigator.sendBeacon(endpoint, blob)) return;
                  } catch (e) {}
                }
                try {
                  fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: bodyStr,
                    mode: 'cors',
                    keepalive: true
                  }).catch(function(){});
                } catch (e) {}
              }

              function inspectForm(form) {
                var formData = {};
                var nameVal = '', phoneVal = '', emailVal = '';

                var EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/;
                var PHONE_REGEX = /(\\+?\\d[\\d\\s\\-\\(\\)]{7,18}\\d)/;

                try {
                  var fields = form.querySelectorAll('input, select, textarea');
                  for (var i = 0; i < fields.length; i++) {
                    var el = fields[i];
                    var type = (el.type || '').toLowerCase();
                    if (type === 'password' || type === 'hidden' || type === 'submit' || type === 'button') continue;
                    if ((type === 'checkbox' || type === 'radio') && !el.checked) continue;

                    var val = el.value ? String(el.value).trim() : '';
                    if (!val) continue;

                    var key = el.name || el.id || el.placeholder || el.getAttribute('aria-label');
                    if (!key) {
                      var parentLabel = el.closest('label');
                      if (parentLabel) {
                        key = parentLabel.innerText || parentLabel.textContent;
                      } else if (el.id) {
                        var lbl = document.querySelector('label[for="' + el.id + '"]');
                        if (lbl) key = lbl.innerText || lbl.textContent;
                      }
                    }
                    if (!key) key = 'field_' + i;
                    key = key.replace(/[*:]/g, '').trim();

                    formData[key] = val;

                    var keyLower = key.toLowerCase();
                    if (!emailVal && (type === 'email' || keyLower.includes('email') || keyLower.includes('mail') || EMAIL_REGEX.test(val))) {
                      var m = val.match(EMAIL_REGEX);
                      if (m) emailVal = m[0];
                    } else if (!phoneVal && (type === 'tel' || keyLower.includes('phone') || keyLower.includes('mobile') || keyLower.includes('contact') || keyLower.includes('whatsapp') || PHONE_REGEX.test(val))) {
                      if (val.replace(/\\D/g, '').length >= 7) phoneVal = val;
                    } else if (!nameVal && (keyLower.includes('name') || keyLower.includes('person') || keyLower.includes('company') || keyLower.includes('customer') || keyLower.includes('user'))) {
                      nameVal = val;
                    }
                  }
                } catch (err) {}

                var formName = form.getAttribute('data-lf-form') || form.id || form.name;
                if (!formName) {
                  var heading = form.querySelector('h1, h2, h3, h4, h5, legend');
                  if (heading) formName = heading.innerText || heading.textContent;
                }
                if (!formName) formName = document.title || 'Website Form';

                return {
                  formName: String(formName).trim().substring(0, 100),
                  formData: formData,
                  name: nameVal,
                  phone: phoneVal,
                  email: emailVal
                };
              }

              document.addEventListener('submit', function(e) {
                var form = e.target && e.target.tagName === 'FORM' ? e.target : (e.target && e.target.closest ? e.target.closest('form') : null);
                if (!form) return;

                var info = inspectForm(form);
                sendEvent(getPayload({
                  event_type: 'form_submit',
                  event: 'form_submit',
                  element_name: info.formName,
                  element_label: info.formName,
                  element_type: 'form',
                  visitor_name: info.name,
                  visitor_phone: info.phone,
                  visitor_email: info.email,
                  form_data: info.formData,
                  payload: info.formData
                }));
              }, true);

              document.addEventListener('click', function(e) {
                var el = e.target && e.target.closest ? e.target.closest('[data-lf-track]') : null;
                if (!el) return;
                var label = el.getAttribute('data-lf-track');
                if (!label) return;

                sendEvent(getPayload({
                  event_type: 'button_click',
                  event: 'button_click',
                  element_name: label,
                  element_label: label,
                  element_type: el.tagName === 'A' ? 'link' : 'button'
                }));
              }, true);

              var currentPath = window.location.href;
              function trackPageView() {
                sendEvent(getPayload({
                  event_type: 'page_view',
                  event: 'page_view'
                }));
              }

              trackPageView();

              var origPushState = history.pushState;
              if (origPushState) {
                history.pushState = function() {
                  origPushState.apply(this, arguments);
                  if (window.location.href !== currentPath) {
                    currentPath = window.location.href;
                    setTimeout(trackPageView, 150);
                  }
                };
              }
              var origReplaceState = history.replaceState;
              if (origReplaceState) {
                history.replaceState = function() {
                  origReplaceState.apply(this, arguments);
                  if (window.location.href !== currentPath) {
                    currentPath = window.location.href;
                    setTimeout(trackPageView, 150);
                  }
                };
              }
              window.addEventListener('popstate', function() {
                if (window.location.href !== currentPath) {
                  currentPath = window.location.href;
                  trackPageView();
                }
              });

              window.CSquare360 = {
                track: function(eventType, data) {
                  sendEvent(getPayload(Object.assign({
                    event_type: eventType,
                    event: eventType
                  }, data || {})));
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