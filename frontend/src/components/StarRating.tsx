interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
}

const sizeMap: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
};

export default function StarRating({ rating, size = 'md' }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className={`flex items-center gap-0.5 ${sizeMap[size]}`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < fullStars;
        const half = index === fullStars && hasHalfStar;
        return (
          <span key={index} className="relative inline-block leading-none">
            <span className="text-gray-300">★</span>
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden text-yellow-400"
                style={{ width: filled ? '100%' : '50%' }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
