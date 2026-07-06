'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SKIP_ROLES = new Set(['combobox', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'tab', 'switch', 'option', 'checkbox', 'radio']);

function appendArrowToTextNode(element: Element) {
  // Opt-out escape hatch and interactive UI primitives never get a chevron.
  if (element.hasAttribute('data-no-arrow')) return;
  const role = element.getAttribute('role');
  if (role && SKIP_ROLES.has(role)) return;
  if (element.getAttribute('aria-haspopup')) return;
  if (element.closest('[role="dialog"], [role="menu"], [role="listbox"], [role="tablist"]')) return;

  const text = element.textContent?.replace(/\s+/g, ' ').trim() || '';
  if (!/[A-Za-z0-9]/.test(text) || text.endsWith('>')) return;
  if (element.getAttribute('aria-label') && text.length <= 2) return;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (node.textContent?.trim()) textNodes.push(node as Text);
    node = walker.nextNode();
  }

  const last = textNodes[textNodes.length - 1];
  if (!last) return;

  const trimmed = last.textContent?.trimEnd() || '';
  if (!trimmed || trimmed.endsWith('>')) return;
  last.textContent = `${trimmed} >`;
}

export function ActionArrowNormalizer() {
  const pathname = usePathname();

  useEffect(() => {
    const normalize = () => {
      // Restrict to anchor-based CTAs (navigation actions) plus explicit opt-ins.
      // Utility <button> controls (reset, save, filters, dialog actions) are left
      // alone; genuine CTA buttons can opt in with data-action-button.
      document
        .querySelectorAll('a[role="button"], a.inline-flex, [data-action-button]')
        .forEach(appendArrowToTextNode);
    };

    normalize();
    if (!document.body) return undefined;
    const observer = new MutationObserver(normalize);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
