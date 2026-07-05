'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function appendArrowToTextNode(element: Element) {
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
      document
        .querySelectorAll('button, a[role="button"], a.inline-flex, [data-action-button]')
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
