import Link from "next/link";

type Props = {
  locale: string;
};

export default function LockedCourseCard({
  locale,
}: Props) {
  return (
    <article className="w-[280px] min-w-[280px] shrink-0 overflow-hidden rounded-3xl border-2 border-red-500 bg-white shadow-xl">

      <Link
        href={`/${locale}/sign-in`}
        className="block"
      >

        {/* RED HEADER */}
        <div className="flex h-44 items-center justify-center bg-red-500">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl">
            🔒
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5">

          <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
            Sign in required
          </span>

          <h3 className="mt-4 text-lg font-bold text-black">
            Only when you sign in
          </h3>

          <p className="mt-2 text-sm text-black/50">
            Sign in to access this personalized section.
          </p>

          <div className="mt-5 flex items-center justify-between">

            <span className="text-sm font-semibold text-red-500">
              🔒 Private
            </span>

            <span className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white">
              Sign in
            </span>

          </div>

        </div>

      </Link>

    </article>
  );
}