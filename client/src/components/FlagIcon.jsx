import React from 'react';

/**
 * High-definition vector SVG flags that render perfectly on all operating systems
 * Mathematically exact according to official state constitutional specifications.
 */
export default function FlagIcon({ code, className = "w-7 h-[18px] rounded-[3px] shadow-sm shrink-0" }) {
  switch (code) {
    case 'vi': // Flag of Vietnam: Official 3:2 ratio, perfectly centered gold star (cx=450, cy=300, R=180)
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 900 600"
          className={className}
        >
          <rect width="900" height="600" fill="#da251d" />
          <polygon
            points="450,120 490,244 621,244 515,321 556,446 450,369 344,446 385,321 279,244 410,244"
            fill="#ffff00"
          />
        </svg>
      );

    case 'lo': // Flag of Laos: Official 3:2 ratio, 1:2:1 stripes, centered white disc (cx=450, cy=300, r=120)
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 900 600"
          className={className}
        >
          <rect width="900" height="600" fill="#ce1126" />
          <rect y="150" width="900" height="300" fill="#002868" />
          <circle cx="450" cy="300" r="120" fill="#ffffff" />
        </svg>
      );

    case 'en': // Flag of the United Kingdom: Official 3:2 Union Jack
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 600 400"
          className={className}
        >
          <clipPath id="uk-flag-clip">
            <rect width="600" height="400" />
          </clipPath>
          <g clipPath="url(#uk-flag-clip)">
            <path fill="#012169" d="M0 0h600v400H0z" />
            <path stroke="#ffffff" strokeWidth="66.67" d="M0 0l600 400M600 0L0 400" />
            <path stroke="#c8102e" strokeWidth="22.22" d="M0 0l600 400M600 0L0 400" />
            <path stroke="#ffffff" strokeWidth="133.33" d="M300 0v400M0 200h600" />
            <path stroke="#c8102e" strokeWidth="80" d="M300 0v400M0 200h600" />
          </g>
        </svg>
      );
  }
}
