'use client';

import { useCallback, useState } from 'react';
import type { DragEvent } from 'react';

/**
 * Shared drag-and-drop file handling. Any surface whose label promises
 * "drag and drop" should spread `dropHandlers` onto its dropzone element and
 * use `isDragging` for hover styling. The first dropped file is passed to
 * `onFile`, mirroring the hidden `<input type="file">` onChange path.
 */
export function useFileDrop(onFile: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return {
    isDragging,
    dropHandlers: { onDragOver, onDragEnter, onDragLeave, onDrop },
  };
}
