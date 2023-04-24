// https://beta.nextjs.org/docs/routing/loading-ui#thread-id=9V4--
export default function Loading() {
  return (
    <div className="animate-pulse fixed inset-0 flex justify-center items-center text-4xl">
      {"Loading....".toUpperCase()}
    </div>
  );
}
