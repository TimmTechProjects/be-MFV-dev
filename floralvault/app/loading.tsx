export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}
