import { memo } from "react";
import dynamic from "next/dynamic";
import CardContent from "@components/ui/common/cardContent";

const CardHorizontalLoading = dynamic(
  () => import("@components/ui/cardLoading"),
  {
    loading: () => (
      <div className="flex justify-center items-center w-full">
        <div className="w-full h-60 bg-darkCorp animate-fast-pulse"></div>
      </div>
    ),
  }
);

const AdCard = dynamic(() => import("@components/ui/adCard"), {
  loading: () => (
    <div className="flex justify-center items-center w-full">
      <div className="w-full h-60 bg-darkCorp animate-fast-pulse"></div>
    </div>
  ),
  ssr: false,
});

function CardHorizontal({ event, isLoading, isPriority }) {
  if (isLoading) return <CardHorizontalLoading />;

  if (event.isAd) {
    return <AdCard event={event} />;
  }

  return (
    <CardContent event={event} isPriority={isPriority} isHorizontal={true} />
  );
}

function areEqual(prevProps, nextProps) {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isPriority === nextProps.isPriority &&
    prevProps.event.id === nextProps.event.id
  );
}

export default memo(CardHorizontal, areEqual);
