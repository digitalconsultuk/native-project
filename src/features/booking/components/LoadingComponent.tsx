type Prop = {
  dataValue: string;
  isLoading: boolean;
};
const LoadingComponent = ({ dataValue, isLoading }: Prop) => {
  if (!isLoading) return null;
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-3 bg-amber-50 rounded-2xl px-6 py-5 shadow-lg">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-lg text-black text-wrap font-bold font-sans text-center">
            {dataValue}
          </p>
        </div>
      </div>
    </>
  );
};
export { LoadingComponent };