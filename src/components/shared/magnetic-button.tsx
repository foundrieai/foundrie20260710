'use client';

import Link from 'next/link';
import { useRef } from 'react';
import type { ReactNode, MouseEvent } from 'react';

type MagneticButtonProps = {
  children: ReactNode;
  /** "molten" = solid animated gradient (hero "Explore the Suites"); "ghost" = outlined sweep (hero "Get Started for Free"). */
  variant?: 'molten' | 'ghost';
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  target?: string;
  rel?: string;
  className?: string;
  'aria-label'?: string;
  disabled?: boolean;
};

/**
 * The two hero CTA buttons, reusable across the site. `.foundrie-molten-btn` /
 * `.foundrie-ghost-btn` provide the look and the hover sweep; this component
 * adds the magnetic cursor-follow (drifts toward the pointer, springs back).
 * Renders a Next `Link` when `href` is set, otherwise a `button`.
 */
export function MagneticButton({
  children,
  variant = 'molten',
  href,
  onClick,
  type = 'button',
  target,
  rel,
  className = '',
  disabled,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const cls = `${variant === 'ghost' ? 'foundrie-ghost-btn' : 'foundrie-molten-btn'} ${className}`.trim();

  const handleMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left - b.width / 2) * 0.3;
    const y = (e.clientY - b.top - b.height / 2) * 0.35;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate(0px, 0px)';
  };

  const shared = {
    ref,
    className: cls,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    'aria-label': rest['aria-label'],
  };

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} {...shared}>
        <span>{children}</span>
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} {...shared}>
      <span>{children}</span>
    </button>
  );
}
