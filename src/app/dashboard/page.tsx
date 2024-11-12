"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { ethers } from "ethers";
import {
  alertError,
  alertLoading,
  alertSuccess,
  contractAddress,
  fileStorageABI,
} from "~/constants";
import MetaDialog from "../_components/metaDialog";
import Swal from "sweetalert2";
import CardsGrid from "../_components/cards-grid";

declare global {
  interface Window {
    ethereum: any;
  }
}

const defaultMeta = {
  name: "",
  goal: 0,
  avance: 0,
  tokens: 0,
  unit: "",
  userId: "",
};

export default function SubirArchivos() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState<any>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [users] = api.users.getAllUsersNames.useSuspenseQuery();
  const [metas] = api.metas.getAllMetas.useSuspenseQuery({
    id: session.data?.user.id === "1" ? undefined : session.data?.user.id,
  });

  const utils = api.useUtils();
  const addTokens = api.users.addTokens.useMutation({
    onSuccess: async () => await utils.users.invalidate(),
    onError: (error: any) => alertError(error.message),
  });
  const claimMeta = api.metas.claimMeta.useMutation({
    onSuccess: async () => await utils.metas.invalidate(),
    onError: (error: any) => alertError(error.message),
  });
  const terminarMeta = api.metas.terminarMeta.useMutation({
    onSuccess: async () => await utils.metas.invalidate(),
    onError: (error: any) => alertError(error.message),
  });
  const saveMeta = api.metas.saveMeta.useMutation({
    onSuccess: async () => await utils.metas.invalidate(),
    onError: (error: any) => alertError(error.message),
  });
  const createTransaction = api.transactions.create.useMutation({
    onSuccess: async () => await utils.transactions.invalidate(),
  });

  useEffect(() => {
    const initializeContract = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          // Solicitar acceso a la cuenta de MetaMask
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Crear un proveedor de ethers.js usando MetaMask
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          const code = await provider.getCode(contractAddress);
          console.log("Código en la dirección:", code);

          // Obtener el signer de MetaMask
          const signer = provider.getSigner();

          // Inicializar el contrato con el ABI y la dirección del contrato
          const newContract = new ethers.Contract(
            contractAddress,
            fileStorageABI,
            signer,
          );

          // Establecer el contrato en el estado
          setContract(newContract);
        } catch (error) {
          console.error(
            "Error al inicializar el contrato con MetaMask:",
            error,
          );
        }
      } else {
        console.error("MetaMask no está instalado");
      }
    };

    initializeContract();
  }, []);

  const reclamarRecompensa = async (meta: any) => {
    if (!meta || !contract) return;

    alertLoading("Transacción en proceso");

    const transactionHash = await createTransactionBlockchain({ ...meta });
    if (!transactionHash) return alertError("Error al subir la información");

    createTransaction.mutate({
      hashT: transactionHash,
      metaId: meta.id,
    });
    claimMeta.mutate({ id: meta.id });
    addTokens.mutate({ tokens: meta.tokens });
    alertSuccess("Tokens reclamados correctamente");
  };
  const editarMeta = (meta: any) => {
    setOpen(true);
    setMeta(meta);
  };
  const acabarMeta = (meta: any) => {
    Swal.fire({
      title: "¿Estás seguro de terminar la meta?",
      text: "Una vez terminada no se podrá volver a modificar",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, terminar",
    }).then((result: any) => {
      if (result.isConfirmed) {
        terminarMeta.mutate({ id: meta.id });
      }
    });
  };
  const guardarMeta = (meta: any) => {
    console.log("Guardar meta", meta);
    saveMeta.mutate({
      id: meta.id ? meta.id : undefined,
      unit: meta.unit,
      name: meta.name,
      tokens: Number(meta.tokens),
      avance: Number(meta.avance),
      userId: meta.userId,
      goal: Number(meta.goal),
    });
    setOpen(false);
    alertSuccess("Meta guardada correctamente");
  };
  const createTransactionBlockchain = async ({ name, tokens }: any) => {
    if (!contract) return null;
    try {
      console.log("name, tokens", name, tokens);
      const tx = await contract.addToken(name, tokens);
      const receipt = await tx.wait();

      console.log("Receipt", receipt);
      return receipt.transactionHash;
    } catch (error) {
      alertError("Error al subir los tokens");
    }
    return null;
  };
  const obtenerTokensFromBlockchain = async (meta: any) => {
    if (!contract) {
      return alertError("El contrato no está inicializado");
    }
    alertLoading("Obteniendo");

    try {
      const metaTokensFromBlockchain = await contract.getToken(meta.name);
      console.log("metaTokensFromBlockchain", metaTokensFromBlockchain);
      alertSuccess(`Esta meta trajo ${metaTokensFromBlockchain} tokens.`);
    } catch (error: any) {
      alertError("Error al obtener los tokens");
      if (error.message) {
        console.error("Razón del error:", error.message);
      }
      if (error.reason) {
        console.error("Razón del error:", error.reason);
      }
      if (error.data) {
        console.error("Datos adicionales del error:", error.data);
      }
    }
  };

  if (session.status === "loading") {
    return null;
  }
  const isAdmin = session.data?.user.id === "1";
  console.log("isAdmin", isAdmin);

  return (
    <>
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Metas
          </h1>
          {isAdmin && (
            <button
              className="inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
              onClick={() => {
                setOpen(true);
                setMeta(defaultMeta);
              }}
            >
              Añadir
            </button>
          )}
        </div>
      </header>
      {/* crear un botón para crear */}
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="">
            <CardsGrid
              metas={metas}
              session={session}
              users={users}
              acabarMeta={acabarMeta}
              obtenerTokensFromBlockchain={obtenerTokensFromBlockchain}
              reclamarRecompensa={reclamarRecompensa}
              editarMeta={editarMeta}
              isAdmin={isAdmin}
            />
            <MetaDialog
              open={open}
              setOpen={setOpen}
              meta={meta}
              guardarMeta={guardarMeta}
              usuarios={users}
            />
          </div>
        </div>
      </main>
    </>
  );
}
