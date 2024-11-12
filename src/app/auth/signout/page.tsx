import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function Signout() {
  const csrfToken =
    cookies().get("__Host-next-auth.csrf-token")?.value.split("|")[0] ||
    cookies().get("next-auth.csrf-token")?.value.split("|")[0];
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/auth/signin");
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-800 px-6 py-12">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Quieres cerrar sesión?
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
            <form
              action="/api/auth/signout"
              method="POST"
              className="space-y-6"
            >
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-lg font-semibold text-white shadow-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Cerrar sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
