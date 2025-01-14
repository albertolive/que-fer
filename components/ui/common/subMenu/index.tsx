import { useRef, memo, FC, RefObject } from "react";
import dynamic from "next/dynamic";
import Filters from "@components/ui/filters";
import useOnScreen from "@components/hooks/useOnScreen";
import useStore from "@store";

interface StoreState {
  openModal: boolean;
}

const FiltersModal = dynamic(() => import("@components/ui/filtersModal"), {
  loading: () => null,
});

const SubMenu: FC = () => {
  const { openModal } = useStore((state: StoreState) => ({
    openModal: state.openModal,
  }));

  const filtersModalRef = useRef<Element>(null) as RefObject<Element>;
  const divRef = useRef<HTMLDivElement>(null);
  const isFiltersModalVisible = useOnScreen(filtersModalRef, {
    freezeOnceVisible: true,
  });

  return (
    <>
      {openModal && (
        <div className="flex justify-center items-center gap-4" ref={divRef}>
          {isFiltersModalVisible && <FiltersModal />}
        </div>
      )}
      <Filters />
    </>
  );
};

export default memo(SubMenu);
