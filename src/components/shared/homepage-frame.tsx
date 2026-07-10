'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function HomepageFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState('760px');

  const postScrollState = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;

    const rect = frame.getBoundingClientRect();
    frame.contentWindow.postMessage(
      {
        type: 'foundrie-parent-scroll',
        scrollY: window.scrollY,
        viewportH: window.innerHeight,
        frameTop: rect.top + window.scrollY,
      },
      window.location.origin
    );
  }, []);

  // Scroll the parent window to a section that lives inside the iframe, so nav
  // links like /#platform land on the right part of the homepage.
  const scrollToHash = useCallback((smooth = true) => {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    if (!frame || !doc) return;
    const id = window.location.hash.replace(/^#/, '');
    if (!id || id === 'top') return;
    const el = doc.getElementById(id);
    if (!el) return;
    // Use getBoundingClientRect so this works for nested anchors (e.g. #career
    // inside the diptych), not just top-level sections. The iframe never scrolls
    // internally, so the element rect top equals its offset within the content.
    const navOffset = 88; // clear the sticky app header
    const target =
      window.scrollY + frame.getBoundingClientRect().top + el.getBoundingClientRect().top - navOffset;
    window.scrollTo({
      top: Math.max(0, target),
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  const syncHeight = useCallback(() => {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    if (!doc) return;

    doc.body.classList.add('foundrie-shell-embedded');
    frame.contentWindow?.scrollTo(0, 0);
    const nextHeight = Math.max(
      doc.body.scrollHeight,
      doc.documentElement.scrollHeight
    );
    setHeight(`${Math.min(nextHeight, 22000)}px`);
    window.requestAnimationFrame(postScrollState);
  }, [postScrollState]);

  const handleLoad = useCallback(() => {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    if (!doc) return;

    resizeObserverRef.current?.disconnect();
    doc.body.classList.add('foundrie-shell-embedded');
    resizeObserverRef.current = new ResizeObserver(syncHeight);
    resizeObserverRef.current.observe(doc.body);

    frame.contentWindow?.scrollTo(0, 0);
    syncHeight();
    const hasHash = window.location.hash && window.location.hash !== '#top';
    window.setTimeout(() => {
      frame.contentWindow?.scrollTo(0, 0);
      syncHeight();
      if (hasHash) scrollToHash(false);
    }, 500);
    window.setTimeout(() => {
      syncHeight();
      if (hasHash) scrollToHash();
    }, 1500);
    window.requestAnimationFrame(postScrollState);
  }, [postScrollState, syncHeight, scrollToHash]);

  useEffect(() => {
    return () => resizeObserverRef.current?.disconnect();
  }, []);

  // React to in-app hash changes (e.g. clicking "Company" while already on /).
  // Next.js <Link> updates the hash via history.pushState, which fires no
  // hashchange event, so we also wrap pushState/replaceState. Defer slightly so
  // the scroll runs after Next has finished its own navigation/scroll handling.
  useEffect(() => {
    const onNav = () => window.setTimeout(() => scrollToHash(), 50);
    window.addEventListener('hashchange', onNav);
    window.addEventListener('popstate', onNav);

    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;
    window.history.pushState = function (this: History, ...args: Parameters<History['pushState']>) {
      origPush.apply(this, args);
      onNav();
    };
    window.history.replaceState = function (this: History, ...args: Parameters<History['replaceState']>) {
      origReplace.apply(this, args);
      onNav();
    };

    return () => {
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('popstate', onNav);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, [scrollToHash]);

  useEffect(() => {
    const handleScrollOrResize = () => postScrollState();

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);
    postScrollState();

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [postScrollState]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'foundrie-homepage-wheel') {
        const deltaX = Number(event.data.deltaX) || 0;
        const deltaY = Number(event.data.deltaY) || 0;
        window.scrollBy({ left: deltaX, top: deltaY, behavior: 'auto' });
        return;
      }
      if (event.data?.type !== 'foundrie-homepage-height') return;

      const nextHeight = Number(event.data.height);
      if (!Number.isFinite(nextHeight)) return;
      setHeight(`${Math.min(Math.max(nextHeight, 760), 22000)}px`);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="/foundrie-claude-homepage.html?embedded=1&v=homepage-footer-logo-20260705#top"
      title="Foundrie AI homepage"
      className="block w-full border-0"
      style={{ height }}
      onLoad={handleLoad}
    />
  );
}
