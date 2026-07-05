'use client';

import React from 'react';

type MotionOnlyProps = {
  animate?: unknown;
  exit?: unknown;
  initial?: unknown;
  layout?: unknown;
  layoutId?: string;
  transition?: unknown;
  variants?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
};

type MotionProps<T extends keyof React.JSX.IntrinsicElements> =
  React.ComponentPropsWithoutRef<T> & MotionOnlyProps;

function stripMotionProps<T extends keyof React.JSX.IntrinsicElements>(props: MotionProps<T>) {
  const {
    animate,
    exit,
    initial,
    layout,
    layoutId,
    transition,
    variants,
    whileHover,
    whileTap,
    ...rest
  } = props;
  return rest;
}

function createMotionElement<T extends keyof React.JSX.IntrinsicElements>(tag: T) {
  return React.forwardRef<HTMLElement, MotionProps<T>>((props, ref) =>
    React.createElement(tag, { ...stripMotionProps(props), ref })
  );
}

export function AnimatePresence({
  children,
}: {
  children: React.ReactNode;
  initial?: boolean;
  mode?: 'sync' | 'wait' | 'popLayout';
}) {
  return <>{children}</>;
}

export const motion = {
  aside: createMotionElement('aside'),
  button: createMotionElement('button'),
  div: createMotionElement('div'),
  form: createMotionElement('form'),
  li: createMotionElement('li'),
  main: createMotionElement('main'),
  section: createMotionElement('section'),
  span: createMotionElement('span'),
};
