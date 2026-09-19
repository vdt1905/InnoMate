import React, { useState } from 'react';

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-24 w-24 text-3xl md:h-36 md:w-36 md:text-5xl',
};

const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

// Profile photo when there is one, otherwise the person's initials — never a
// generic icon, so people stay distinguishable in lists and chat.
const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 font-semibold text-muted ${SIZES[size] || SIZES.md} ${className}`}
      title={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || ''}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
};

export default Avatar;
