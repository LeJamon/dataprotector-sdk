import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'react-feather';
import { useAccount } from 'wagmi';
import type { ProtectedData } from '../../../../../../sdk/src';
import { Alert } from '../../../components/Alert.tsx';
import { CircularLoader } from '../../../components/CircularLoader.tsx';
import { DocLink } from '../../../components/DocLink.tsx';
import { OneContentCard } from '../../../components/OneContentCard.tsx';
import { useDevModeStore } from '../../../stores/devMode.store.ts';
import { getContentOfTheWeek } from './subgraphQuery.ts';

export function ContentOfTheWeek() {
  const { connector } = useAccount();
  const { isDevMode } = useDevModeStore();

  const contentOfTheWeek = useRef(null);

  const { isLoading, isError, error, data } = useQuery<
    ProtectedData[],
    unknown
  >({
    queryKey: ['contentOfTheWeek'],
    queryFn: () => getContentOfTheWeek({ connector }),
    enabled: !!connector,
  });

  let isDown = false;
  let startX: number;
  let startY: number;
  let scrollLeft: number;
  let scrollTop: number;

  useEffect(() => {
    contentOfTheWeek?.current?.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - contentOfTheWeek.current.offsetLeft;
      startY = e.pageY - contentOfTheWeek.current.offsetTop;
      scrollLeft = contentOfTheWeek.current.scrollLeft;
      scrollTop = contentOfTheWeek.current.scrollTop;
    });

    contentOfTheWeek?.current?.addEventListener('mouseleave', () => {
      isDown = false;
    });

    contentOfTheWeek?.current?.addEventListener('mouseup', () => {
      isDown = false;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - contentOfTheWeek.current.offsetLeft;
      const y = e.pageY - contentOfTheWeek.current.offsetTop;
      const walkX = (x - startX) * 1;
      const walkY = (y - startY) * 1;
      contentOfTheWeek.current.scrollLeft = scrollLeft - walkX;
      contentOfTheWeek.current.scrollTop = scrollTop - walkY;
    });
  });

  function onScrollLeft() {
    contentOfTheWeek.current.scrollBy({
      top: 0,
      left: -contentOfTheWeek.current.clientWidth,
      behavior: 'smooth',
    });
  }

  function onScrollRight() {
    contentOfTheWeek.current.scrollBy({
      top: 0,
      left: contentOfTheWeek.current.clientWidth,
      behavior: 'smooth',
    });
  }

  return (
    <>
      <div className="flex min-h-[44px] items-center">
        <h3 className="flex-1 text-2xl font-bold">Content of the week</h3>
        {!!data?.length && data?.length > 0 && (
          <div>
            <button
              className="group p-1 transition-transform active:scale-[0.9]"
              onClick={onScrollLeft}
            >
              <div className="rounded-full bg-grey-700 p-2 transition-colors group-hover:bg-grey-500/40">
                <ArrowLeft size="18" />
              </div>
            </button>
            <button
              className="group ml-1 p-1 transition-transform active:scale-[0.9]"
              onClick={onScrollRight}
            >
              <div className="rounded-full bg-grey-700 p-2 transition-colors group-hover:bg-grey-500/40">
                <ArrowRight size="18" />
              </div>
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mt-4 flex flex-col items-center gap-y-4">
          <CircularLoader />
        </div>
      )}

      {isError && (
        <Alert variant="error">
          <p>Oops, something went wrong while fetching content of the week.</p>
          <p className="mt-1 text-sm text-orange-300">{error.toString()}</p>
        </Alert>
      )}

      {data?.length === 0 && (
        <div className="mt-4 flex flex-col items-center gap-y-4">
          No content this week? 🤔
        </div>
      )}

      <div
        ref={contentOfTheWeek}
        className="mt-8 inline-flex max-w-full gap-x-4 overflow-auto"
      >
        {!!data?.length &&
          data?.length > 0 &&
          data?.map((content) => (
            <div key={content.id} className="w-[400px] shrink-0">
              <OneContentCard content={content} />
            </div>
          ))}
      </div>

      {isDevMode && (
        <DocLink className="mb-14 mt-8">
          dataprotector-sdk / Method called:{' '}
          <a
            href="https://tools.docs.iex.ec/tools/dataprotector/methods/fetchprotecteddata"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            fetchProtectedData()
          </a>
        </DocLink>
      )}
    </>
  );
}