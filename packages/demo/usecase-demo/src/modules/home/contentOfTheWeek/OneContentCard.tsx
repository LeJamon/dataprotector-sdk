import { ProtectedDataInCollection } from '@iexec/dataprotector';
import { Link } from '@tanstack/react-router';
import { clsx } from 'clsx';
import { getCardVisualNumber } from '@/utils/getCardVisualNumber.ts';
import { nrlcToRlc } from '@/utils/nrlcToRlc.ts';
import { readableSecondsToDays } from '@/utils/secondsToDays.ts';
import { cn } from '@/utils/style.utils.ts';
import { truncateAddress } from '@/utils/truncateAddress.ts';
import styles from './OneContentCard.module.css';

export function OneContentCard({
  protectedData,
  linkToDetails,
  className,
}: {
  protectedData: ProtectedDataInCollection;
  linkToDetails: string;
  className?: string;
}) {
  const cardVisualBg = getCardVisualNumber({
    address: protectedData.id,
  });

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <Link
        to={linkToDetails}
        params={{
          protectedDataAddress: protectedData.id,
        }}
        className={cn(
          'group relative mx-auto flex h-[193px] w-full items-center flex-none justify-center overflow-hidden rounded-t-xl transition-shadow hover:shadow-lg',
          !linkToDetails && 'cursor-default'
        )}
      >
        <div
          className={clsx(
            styles[cardVisualBg],
            'h-full w-full bg-cover bg-bottom'
          )}
        >
          &nbsp;
        </div>
        {/*<div className="border-grey-50 absolute bottom-3 right-4 h-[34px] rounded-30 border px-3 py-2 text-xs">*/}
        {/*  Image*/}
        {/*</div>*/}
      </Link>
      <div className="h-full max-w-full truncate rounded-b-xl border-x border-b border-grey-700 bg-grey-900 px-4 py-4 text-sm">
        <div className="flex">
          <div className="mt-1 size-3 shrink-0 rounded-full bg-[#D9D9D9]">
            &nbsp;
          </div>
          <div className="ml-1.5 flex-1 overflow-hidden">
            <div className="truncate text-grey-50">
              {!protectedData.name ? protectedData.id : protectedData.name}
            </div>
            <div className="group mt-0.5 inline-block w-full truncate text-grey-500">
              <span className="inline group-hover:hidden">
                {truncateAddress(protectedData.id)}
              </span>
              <span className="hidden text-xs group-hover:inline">
                {protectedData.id}
              </span>
            </div>
          </div>
          {protectedData.rentalParams && (
            <div className="-mt-0.5 pl-6 text-base font-bold text-primary">
              <div className="text-center">
                <div>{nrlcToRlc(protectedData.rentalParams.price)} RLC</div>
                <div className="text-xs">
                  for{' '}
                  {readableSecondsToDays(protectedData.rentalParams.duration)}{' '}
                </div>
              </div>
            </div>
          )}
          {protectedData.saleParams && (
            <div className="-mt-0.5 pl-6 text-base font-bold text-primary">
              <div className="text-center">
                <div>{nrlcToRlc(protectedData.saleParams.price)} RLC</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-x-2">
          {protectedData.isRentable && (
            <div className="mt-1 inline-flex h-[25px] items-center rounded-30 border border-grey-50 px-2.5 text-[10px] text-xs">
              Rent
            </div>
          )}
          {protectedData.isIncludedInSubscription && (
            <div className="mt-1 inline-flex h-[25px] items-center rounded-30 border border-grey-50 px-2.5 text-[10px] text-xs">
              Subscription
            </div>
          )}
          {protectedData.isForSale && (
            <div className="mt-1 inline-flex h-[25px] items-center rounded-30 border border-grey-50 px-2.5 text-[10px] text-xs">
              Sale
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
