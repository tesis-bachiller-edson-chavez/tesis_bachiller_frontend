interface TeamBadgeProps {
  teamName: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente para mostrar un badge de equipo
 * Usado para etiquetar equipos en diferentes partes de la UI
 */
export const TeamBadge = ({ teamName, size = 'md' }: TeamBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`bg-blue-500 text-white rounded font-semibold ${sizeClasses[size]}`}
    >
      {teamName}
    </span>
  );
};
