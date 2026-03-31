const COLORS = [
  'bg-lime-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
  'bg-blue-500', 'bg-violet-500', 'bg-pink-500', 'bg-orange-500',
  'bg-rose-500', 'bg-amber-500', 'bg-indigo-500', 'bg-fuchsia-500',
];

export default function Avatar({ nome, size = 'md', className = '' }) {
  const initial = nome?.charAt(0)?.toUpperCase() || '?';
  const colorIdx = nome ? nome.charCodeAt(0) % COLORS.length : 0;

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  return (
    <div className={`${sizes[size]} ${COLORS[colorIdx]} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}>
      {initial}
    </div>
  );
}
