import React from "react";
import Link from "next/link";
import { truncateString } from "@utils/helpers";
import Image from "@components/ui/common/image";

function EventCardLoading() {
  return (
    <div className="flex-none w-40 min-w-[10rem] flex flex-col bg-whiteCorp overflow-hidden cursor-pointer animate-pulse">
      {/* Image Placeholder */}
      <div className="w-full h-32 bg-darkCorp"></div>
      {/* Title Placeholder */}
      <div className="p-1">
        <div className="h-4 bg-darkCorp rounded-md"></div>
      </div>
      {/* Location Placeholder */}
      <div className="p-1">
        <div className="h-4 bg-darkCorp rounded-md"></div>
      </div>
    </div>
  );
}

function EventsAroundScroll({ events, loading }) {
  if (loading) {
    return (
      <div className="w-full flex overflow-x-auto py-4 space-x-4">
        <EventCardLoading />
        <EventCardLoading />
        <EventCardLoading />
      </div>
    );
  }

  return (
    <div className="w-full flex overflow-x-auto py-4 space-x-4">
      {events.map((event) => {
        const title = truncateString(event.title || "", 60);

        return (
          <Link
            key={event.id}
            href={`/e/${event.slug}`}
            passHref
            prefetch={false}
          >
            <div className="flex-none w-40 min-w-[10rem] flex flex-col bg-white overflow-hidden cursor-pointer">
              {/* ImageEvent */}
              <div className="w-full h-32 flex justify-center items-center overflow-hidden">
                <Image
                  className="w-full object-cover"
                  title={event.title}
                  image={event.imageUploaded}
                  alt={event.title}
                  layout="fill"
                  priority={true}
                />
              </div>
              {/* Title */}
              <div className="p-1">
                <h3 className="text-sm font-semibold text-ellipsis overflow-hidden whitespace-nowrap">
                  {title}
                </h3>
              </div>
              {/* Location */}
              <div className="p-1">
                <div className="text-xs font-normal text-ellipsis overflow-hidden whitespace-nowrap">
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default EventsAroundScroll;
