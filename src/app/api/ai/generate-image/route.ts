import { NextResponse } from 'next/server';

export async function POST() {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#ffc400"/>
          <stop offset=".28" stop-color="#ff7a00"/>
          <stop offset=".55" stop-color="#ff3000"/>
          <stop offset=".78" stop-color="#ff0055"/>
          <stop offset="1" stop-color="#e600c9"/>
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="70"/></filter>
      </defs>
      <rect width="1200" height="800" fill="#08070c"/>
      <circle cx="260" cy="240" r="210" fill="#ffc400" opacity=".55" filter="url(#blur)"/>
      <circle cx="720" cy="360" r="290" fill="#ff0055" opacity=".5" filter="url(#blur)"/>
      <circle cx="1040" cy="180" r="240" fill="#e600c9" opacity=".42" filter="url(#blur)"/>
      <path d="M90 570 C320 380 560 740 1110 420" fill="none" stroke="url(#g)" stroke-width="18" opacity=".82"/>
      <rect x="76" y="76" width="1048" height="648" rx="34" fill="none" stroke="rgba(244,241,246,.18)" stroke-width="2"/>
    </svg>
  `);

  return NextResponse.json({ imageUrl: `data:image/svg+xml;charset=utf-8,${svg}` });
}
