import { RefObject, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'react-feather';

export function CarouselScrollArrows({
  carousel,
}: {
  carousel: RefObject<HTMLDivElement>;
}) {
  const [showArrows, setShowArrows] = useState<boolean>();
  useEffect(() => {
    const width = carousel.current?.getBoundingClientRect().width;
    const nbChild = carousel.current?.childElementCount;
    const childrenWidth = nbChild * (400 + 16) - 16;
    setShowArrows(childrenWidth > width);
  }, [carousel]);

  if (!showArrows) {
    return null;
  }

  function scrollLeft(carousel: RefObject<HTMLDivElement>) {
    carousel.current?.scrollBy({
      top: 0,
      left: -carousel.current.clientWidth,
      behavior: 'smooth',
    });
  }

  function scrollRight(carousel: RefObject<HTMLDivElement>) {
    carousel.current?.scrollBy({
      top: 0,
      left: carousel.current.clientWidth,
      behavior: 'smooth',
    });
  }

  return (
    <div className="self-end">
      <button
        className="group p-1 transition-transform active:scale-[0.9]"
        onClick={() => scrollLeft(carousel)}
      >
        <div className="rounded-full bg-grey-700 p-2 transition-colors group-hover:bg-grey-500/40">
          <ArrowLeft size="18" />
        </div>
      </button>
      <button
        className="group ml-1 p-1 transition-transform active:scale-[0.9]"
        onClick={() => scrollRight(carousel)}
      >
        <div className="rounded-full bg-grey-700 p-2 transition-colors group-hover:bg-grey-500/40">
          <ArrowRight size="18" />
        </div>
      </button>
    </div>
  );
}
