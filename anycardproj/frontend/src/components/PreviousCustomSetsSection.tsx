import CustomPackGrid from "./CustomPackGrid";

interface PreviousCustomSetsSectionProps {
  isLocked: boolean;
  onSelectionStart: () => void;
  onSelectionEnd: () => void;
  resetRef: React.MutableRefObject<(() => void) | null>;
  refreshKey: number;
}

const PreviousCustomSetsSection = ({
  isLocked,
  onSelectionStart,
  onSelectionEnd,
  resetRef,
  refreshKey,
}: PreviousCustomSetsSectionProps) => {
  return (
    <div className="w-full mt-[10vh] pb-[10vh]">
      <div className="text-[17vw] font-bold leading-none select-none background-text-gradient z-[-10] absolute w-full">
        {/* <div>Previous</div>
        <div className="text-right mt-[35vh] pr-[10vw]">Custom Sets</div> */}
      </div>
      <div className="pt-[7%]">
        <CustomPackGrid
          key={refreshKey}
          isLocked={isLocked}
          onSelectionStart={onSelectionStart}
          onSelectionEnd={onSelectionEnd}
          resetRef={resetRef}
        />
      </div>
    </div>
  );
};

export default PreviousCustomSetsSection;
