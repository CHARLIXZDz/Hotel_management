import React from 'react';

/**
 * High-definition vector SVG flags that render perfectly on all operating systems (Windows, Mac, iOS, Android)
 * Avoids Windows Segoe UI Emoji fallback to plain text letters ("GB", "LA", "VN").
 */
export default function FlagIcon({ code, className = "w-7 h-5 rounded-[4px] shadow-sm object-cover" }) {
  switch (code) {
    case 'lo': // Laos Flag
      return (
        <svg viewBox="0 0 640 480" className={className}>
          <rect width="640" height="480" fill="#ce1126" />
          <rect y="120" width="640" height="240" fill="#002868" />
          <circle cx="320" cy="240" r="95" fill="#ffffff" />
        </svg>
      );

    case 'vi': // Vietnam Flag
      return (
        <svg viewBox="0 0 640 480" className={className}>
          <rect width="640" height="480" fill="#da251d" />
          <polygon
            points="320,84 366,227 517,227 395,316 441,459 320,370 199,459 245,316 123,227 274,227"
            fill="#ffeb3b"
          />
        </svg>
      );

    case 'en': // United Kingdom (English) Flag
    default:
      return (
        <svg viewBox="0 0 640 480" className={className}>
          <path fill="#012169" d="M0 0h640v480H0z" />
          <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-179L0 64V0h75z" />
          <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-104-41 240 180h-40L280 240h40zM0 440l180-135h40L0 470v-30zm0-380L179 194h-40L0 89V60zm216 134L0 35v-35l270 200h-54zm104 46L560 60h40L360 240h-40zm320-180L460 195h-40L640 45V0l-40 0z" />
          <path fill="#FFF" d="M240 0h160v480H240zM0 160h640v160H0z" />
          <path fill="#C8102E" d="M267 0h106v480H267zM0 187h640v106H0z" />
        </svg>
      );
  }
}
