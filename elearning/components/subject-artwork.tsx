"use client";

import type { CSSProperties } from "react";

function hashSubject(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function palette(subject: string) {
  const palettes = [
    ["#173f5f", "#20639b", "#e8f1f8"],
    ["#285943", "#4f8a62", "#e9f4ec"],
    ["#6b3f1f", "#b36a35", "#f7eee7"],
    ["#4d3b6b", "#8066a8", "#f0ebf6"],
    ["#7a2f3f", "#b85b6e", "#f8eaee"],
    ["#4a5b31", "#7f9b51", "#eef3e5"],
    ["#315b5b", "#4e8b8b", "#e7f2f2"],
    ["#5b4b2a", "#a27d3d", "#f5f0e2"],
  ];
  return palettes[hashSubject(subject) % palettes.length];
}

function initials(subject: string) {
  const words = subject.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export default function SubjectArtwork({
  subject,
  className,
}: {
  subject: string;
  className?: string;
}) {
  const [dark, mid, light] = palette(subject);
  const seed = hashSubject(subject);
  const offset = seed % 38;

  return (
    <svg
      className={className}
      viewBox="0 0 900 300"
      role="img"
      aria-label={subject}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`subject-bg-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={dark} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
        <pattern id={`subject-grid-${seed}`} width="42" height="42" patternUnits="userSpaceOnUse">
          <path d="M42 0H0V42" fill="none" stroke="#fff" strokeOpacity=".10" />
        </pattern>
      </defs>

      <rect width="900" height="300" fill={`url(#subject-bg-${seed})`} />
      <rect width="900" height="300" fill={`url(#subject-grid-${seed})`} />
      <circle cx={170 + offset} cy="150" r="104" fill={light} fillOpacity=".18" />
      <circle cx={710 - offset} cy="70" r="155" fill="#fff" fillOpacity=".08" />
      <path
        d={`M0 245 C 150 ${180 + offset} 285 315 430 235 S 690 150 900 235 V300 H0 Z`}
        fill="#fff"
        fillOpacity=".07"
      />
      <rect x="70" y="72" width="156" height="156" rx="28" fill="#fff" fillOpacity=".12" stroke="#fff" strokeOpacity=".20" />
      <text x="148" y="171" textAnchor="middle" fontSize="58" fontWeight="800" fontFamily="Arial, sans-serif" fill="#fff">
        {initials(subject)}
      </text>
      <text x="275" y="145" fontSize="18" fontWeight="700" letterSpacing="3" fill="#fff" fillOpacity=".72" fontFamily="Arial, sans-serif">
        SUBJECT
      </text>
      <text x="275" y="188" fontSize="34" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">
        {subject.length > 28 ? subject.slice(0, 28) + "…" : subject}
      </text>
      <circle cx="800" cy="225" r="30" fill={light} fillOpacity=".24" />
      <circle cx="800" cy="225" r="12" fill="#fff" fillOpacity=".72" />
    </svg>
  );
}
