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
    window.setTimeout(() => {
      frame.contentWindow?.scrollTo(0, 0);
      syncHeight();
    }, 500);
    window.setTimeout(() => {
      frame.contentWindow?.scrollTo(0, 0);
      syncHeight();
    }, 1500);
    window.requestAnimationFrame(postScrollState);
  }, [postScrollState, syncHeight]);

  useEffect(() => {
    return () => resizeObserverRef.current?.disconnect();
  }, []);

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
