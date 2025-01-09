import { useRef, memo } from "react";
import dynamic from "next/dynamic";
import Filters from "@components/ui/filters";
import useOnScreen from "@components/hooks/useOnScreen";
import useStore from "@store";

const FiltersModal = dynamic(() => import("@components/ui/filtersModal"), {
  loading: () => "",
});

function SubMenu() {
  const { openModal } = useStore((state) => ({
    openModal: state.openModal,
  }));

  const filtersModalRef = useRef();
  const isFiltersModalVisible = useOnScreen(filtersModalRef, {
    freezeOnceVisible: true,
  });

  return (
    <>
      {openModal && (
        <div
          className="flex justify-center items-center gap-4"
          ref={filtersModalRef}
        >
          {isFiltersModalVisible && <FiltersModal />}
        </div>
      )}
      <Filters />
    </>
  );
}

export default memo(SubMenu);
