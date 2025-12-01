import PackGrid from "./PackGrid";

interface PreviousSetsSectionProps {
  isLocked: boolean;
  onSelectionStart: () => void;
  onSelectionEnd: () => void;
  resetRef: React.MutableRefObject<(() => void) | null>;
}

const PreviousSetsSection = ({
  isLocked,
  onSelectionStart,
  onSelectionEnd,
  resetRef,
}: PreviousSetsSectionProps) => {
  return (
    <div className="w-full">
      <div className="text-[17vw] font-bold leading-none select-none background-text-gradient z-[-10] absolute w-full">
        <div>Previous</div>
        <div className="text-right mt-[35vh] pr-[10vw] ">Sets</div>
      </div>
      <div className="pt-[7%]">
        <PackGrid
          isLocked={isLocked}
          onSelectionStart={onSelectionStart}
          onSelectionEnd={onSelectionEnd}
          resetRef={resetRef}
        />
      </div>
    </div>
  );
};

export default PreviousSetsSection;

