import { createCustomSet } from "../api/cards";
import { SendHorizontalIcon } from "./ui/icons/lucide-send-horizontal";
import { Loader } from "./ui/shadcn-io/ai/loader";

interface CustomSetCreationSectionProps {
  themeInput: string;
  setThemeInput: (value: string) => void;
  isCreatingSet: boolean;
  setIsCreatingSet: (value: boolean) => void;
  createSetError: string | null;
  setCreateSetError: (value: string | null) => void;
  createSetSuccess: string | null;
  setCreateSetSuccess: (value: string | null) => void;
  onSetCreated: () => void;
}

const CustomSetCreationSection = ({
  themeInput,
  setThemeInput,
  isCreatingSet,
  setIsCreatingSet,
  createSetError,
  setCreateSetError,
  createSetSuccess,
  setCreateSetSuccess,
  onSetCreated,
}: CustomSetCreationSectionProps) => {
  const handleCreateCustomSet = async () => {
    const trimmedInput = themeInput.trim();
    if (!trimmedInput) {
      setCreateSetError("Please enter a theme idea");
      return;
    }
    if (trimmedInput.length > 200) {
      setCreateSetError("Theme input is too long (max 200 characters)");
      return;
    }

    setIsCreatingSet(true);
    setCreateSetError(null);
    setCreateSetSuccess(null);

    try {
      const createdSet = await createCustomSet(trimmedInput);
      setCreateSetSuccess(`Successfully created set "${createdSet.name}"!`);
      setThemeInput("");
      // Notify parent to refresh custom sets
      onSetCreated();
      setTimeout(() => {
        setCreateSetSuccess(null);
      }, 5000);
    } catch (error: any) {
      setCreateSetError(error.message || "Failed to create custom set");
    } finally {
      setIsCreatingSet(false);
    }
  };

  return (
    <div className="w-full ">
      <div className="text-[17vw] font-bold leading-none select-none background-text-gradient z-[-10] absolute w-full h-full">
        <div>Custom</div>
        <div className="text-right  pr-[10vw]">Packs</div>
      </div>
      <div className="pt-[7%] relative z-10">
        <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
          <div className="relative w-full !mt-[14vh]">
            <input
              type="text"
              value={themeInput}
              onChange={(e) => {
                setThemeInput(e.target.value);
                setCreateSetError(null);
                setCreateSetSuccess(null);
              }}
              placeholder="Enter a card theme idea!"
              className="w-full !px-6 !pr-14 text-lg !border-2 !shadow-xl !border-white/30 !bg-blue-400/30 !rounded-4xl h-14 focus:outline-none focus:border-blue-500 backdrop-blur-sm !text-white/90  placeholder:text-white/90"
              disabled={isCreatingSet}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreatingSet) {
                  handleCreateCustomSet();
                }
              }}
            />
            <button
              onClick={handleCreateCustomSet}
              disabled={isCreatingSet || !themeInput.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-80"
              type="button"
            >
              {isCreatingSet ? (
                <Loader size={20} className="text-white/90" />
              ) : (
                <SendHorizontalIcon
                  size={20}
                  color="currentColor"
                  className="text-white/90"
                />
              )}
            </button>
          </div>
          {createSetError && (
            <div className="text-red-600 text-sm mt-2">{createSetError}</div>
          )}
          {createSetSuccess && (
            <div className="text-green-600 text-sm mt-2">
              {createSetSuccess}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomSetCreationSection;
