"use client";

import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { alertError, alertSuccess } from "~/constants";
import Swal from "sweetalert2";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import RecompensasGrid from "~/app/_components/recompensas-drig";
import { useState } from "react";
import TipoRecompensaDialog from "~/app/_components/tiporecompensadialog";
import { set } from "zod";
import { Button } from "@headlessui/react";
import PrecioDialog from "~/app/_components/tiporecompensadialog";

const defaultTipo = {
  name: "",
  description: "",
  price: 0,
  estado: 0,
};

export default function Recompensas() {
  const session = useSession();

  const [tiporecompensa, setTiporecompensa] = useState<any>(defaultTipo);
  const [open, setOpen] = useState<any>(false);
  const [recompensaToSell, setRecompensaToSell] = useState<any>(null);

  const [users] = api.users.getAllUsersNames.useSuspenseQuery();
  const [tiporecompensas] =
    api.tiporecompensas.getAllTipoRecompensas.useSuspenseQuery();
  const [recompensas] = api.recompensas.getAllRecompensas.useSuspenseQuery({
    id: session.data?.user.id === "1" ? undefined : session.data?.user.id,
  });

  const [modalParaAñadirRecompensa, setModalParaAñadirRecompensa] =
    useState(false);

  const utils = api.useUtils();
  const deleteTR = api.tiporecompensas.delete.useMutation({
    onSuccess: async () => {
      await utils.tiporecompensas.invalidate();
    },
    onError: (error: any) => alertError(error.message),
  });
  const saveTR = api.tiporecompensas.saveTipoRecompensa.useMutation({
    onSuccess: async () => {
      await utils.tiporecompensas.invalidate();
    },
    onError: (error: any) => alertError(error.message),
  });
  const comprar = api.recompensas.comprar.useMutation({
    onSuccess: async () => {
      await utils.recompensas.invalidate();
      await utils.users.invalidate();
    },
    onError: (error: any) => alertError(error.message),
  });
  const setearPrecio = api.recompensas.setearPrecio.useMutation({
    onSuccess: async () => {
      await utils.recompensas.invalidate();
    },
    onError: (error: any) => alertError(error.message),
  });
  const comprarRecompensa = (recom: any) => {
    const tokensUser =
      users.find((user: any) => user.id === session.data?.user.id)?.tokens || 0;
    if (tokensUser < recom.price) {
      return alertError("No tienes suficientes tokens");
    }

    Swal.fire({
      title: "¿Estás seguro que quieres comprar esta recompensa?",
      text: "Te costará " + recom.price + " tokens",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, gastar " + recom.price + " tokens",
    }).then((result: any) => {
      if (result.isConfirmed) {
        comprar.mutate({
          id: recom.id,
          price: recom.price,
        });
        alertSuccess("Recompensa comprada");
      }
    });
  };

  if (session.status === "loading") {
    return null;
  }
  const isAdmin = session.data?.user.id === "1";
  console.log("isAdmin", isAdmin);

  const guardarTipoRecom = async (recom: any) => {
    saveTR.mutate({
      ...recom,
      estado: Number(recom.estado),
      price: Number(recom.price),
    });
    setModalParaAñadirRecompensa(false);
    setTiporecompensa(null);
  };

  const editarRecompensa = (recompensa: any) => {
    setTiporecompensa(recompensa);
    setModalParaAñadirRecompensa(true);
  };
  const eliminarRecompensa = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro que quieres eliminar esta recompensa?",
      text: "No podrás deshacer esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    }).then((result: any) => {
      if (result.isConfirmed) {
        deleteTR.mutate({ id });
        alertSuccess("Recompensa eliminada");
      }
    });
  };
  const openModalParaAñadirRecompensa = () => {
    console.log("holaaa");
    setTiporecompensa(defaultTipo);
    setModalParaAñadirRecompensa(true);
  };
  const openModalPrecio = (recompensa: any) => {
    console.log("venderRecompensa", recompensa);
    setRecompensaToSell({ ...recompensa, price: 0 });
    setOpen(true);
  };
  const venderRecompensa = async (recompensa: any) => {
    console.log("venderRecompensa", recompensa);
    if (!recompensa.precio) {
      return alertError("El precio no puede ser 0");
    }
    setearPrecio.mutate({
      tipoId: recompensa.tipoId,
      precio: Number(recompensa.precio),
      quantity: Number(recompensa.quantity),
    });
    setOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Recompensas
          </h1>
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xl font-semibold text-gray-800 shadow-sm sm:ml-3 sm:w-auto">
            <BanknotesIcon className="h-6 w-6" />
            {
              users.find((user: any) => user.id === session.data?.user.id)
                ?.tokens
            }
          </div>
        </div>
      </header>
      {/* crear un botón para crear */}
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="">
            <div className="mb-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr className="divide-x divide-gray-200">
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          Nombre
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Fecha Comprada
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Cantidad Comprada
                        </th>
                        {isAdmin && (
                          <th
                            scope="col"
                            className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Colaborador
                          </th>
                        )}
                        {!isAdmin && (
                          <th
                            scope="col"
                            className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Acciones
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {recompensas.map((rec: any, idx: number) => (
                        <tr key={idx} className="divide-x divide-gray-200">
                          <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-0">
                            {(() => {
                              const recompensa = tiporecompensas.find(
                                (r) => r.id === rec.tipoId,
                              );
                              return recompensa ? recompensa.name : "Unknown";
                            })()}
                          </td>
                          <td className="whitespace-nowrap p-4 text-sm text-gray-500">
                            {rec.createdAt.toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap p-4 text-sm text-gray-500">
                            {rec.quantity}
                          </td>
                          {isAdmin && (
                            <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-0">
                              {(users || []).find(
                                (u: any) => u?.id === rec.userId,
                              )?.name || "Unknown"}
                            </td>
                          )}
                          {!!(!isAdmin && !rec.precio) && (
                            <td
                              className="cursor-pointer whitespace-nowrap py-4 pl-4 pr-4 text-sm text-gray-500 hover:bg-slate-900 hover:text-white sm:pr-0"
                              onClick={() => openModalPrecio(rec)}
                            >
                              Vender
                            </td>
                          )}
                          {!!(!isAdmin && rec.precio) && (
                            <td className="whitespace-nowrap py-4 pl-4 pr-4 text-xs text-gray-500 sm:pr-0">
                              En venta por {rec.precio} (ETH * unid)
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <RecompensasGrid
              recompensas={tiporecompensas}
              isAdmin={isAdmin}
              openModalParaAñadirRecompensa={openModalParaAñadirRecompensa}
              comprarRecompensa={comprarRecompensa}
              editarRecompensa={editarRecompensa}
              eliminarRecompensa={eliminarRecompensa}
            />
            <TipoRecompensaDialog
              open={modalParaAñadirRecompensa}
              setOpen={setModalParaAñadirRecompensa}
              meta={tiporecompensa}
              guardarMeta={guardarTipoRecom}
            />
            <PrecioDialog
              open={open}
              setOpen={setOpen}
              recompensa={recompensaToSell}
              venderRecompensa={venderRecompensa}
            />
          </div>
        </div>
      </main>
    </>
  );
}
