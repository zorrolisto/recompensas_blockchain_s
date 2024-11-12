import {
  BanknotesIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { TIPO_ESTADO } from "~/constants";

export default function RecompensasGrid({
  comprarRecompensa,
  recompensas,
  editarRecompensa,
  eliminarRecompensa,
  isAdmin,
  openModalParaAñadirRecompensa,
}: any) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {recompensas.map((recompensa: any, idx: any) => (
        <li
          key={idx}
          className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
        >
          <div className="flex w-full items-center justify-between space-x-3 p-3">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-2">
                <h3 className="truncate text-xs font-medium text-gray-900">
                  {recompensa.name}
                </h3>
                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {TIPO_ESTADO.find((r) => r.id === recompensa.estado)?.name ||
                    "Estado desconocido"}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-gray-500">
                {recompensa.description}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {!isAdmin && recompensa.estado === 1 && (
                <button
                  onClick={() => {
                    comprarRecompensa(recompensa);
                  }}
                  className="flex flex-shrink-0 items-center justify-center rounded-full px-2 py-1 text-xs text-blue-500 ring-2 ring-blue-500"
                >
                  <BanknotesIcon className="mr-2 h-4 w-4" />
                  {recompensa.price}
                </button>
              )}

              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      editarRecompensa(recompensa);
                    }}
                    className="flex flex-shrink-0 items-center justify-center rounded-full px-2 py-1 text-xs text-blue-500 ring-2 ring-blue-500"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      eliminarRecompensa(recompensa.id);
                    }}
                    className="flex flex-shrink-0 items-center justify-center rounded-full px-2 py-1 text-xs text-blue-500 ring-2 ring-blue-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </li>
      ))}
      {isAdmin && (
        <li className="col-span-1 flex items-center divide-y divide-gray-200 rounded-lg bg-white shadow">
          <div className="flex w-full items-center justify-between space-x-3 p-3">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-2">
                <h3 className="truncate text-xs font-medium text-gray-900">
                  Añade otra recompensa
                </h3>
              </div>
            </div>
            <button
              onClick={() => {
                openModalParaAñadirRecompensa();
              }}
              className="flex flex-shrink-0 items-center justify-center rounded-full px-2 py-1 text-xs text-blue-500 ring-2 ring-blue-500"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </li>
      )}
    </ul>
  );
}
