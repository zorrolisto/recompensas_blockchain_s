import Swal from "sweetalert2";

export const contractAddress = "0x69Ded14dc4C8117A77FD932411968d5f509FAeDC";

export const fileStorageABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "token",
        type: "uint256",
      },
    ],
    name: "addToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "getToken",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

//---

export const adminImage =
  "https://www.svgrepo.com/show/382096/female-avatar-girl-face-woman-user.svg";
export const userImage =
  "https://www.svgrepo.com/show/382109/male-avatar-boy-face-man-user-7.svg";

export const alertError = (message: string) => {
  Swal.fire({ title: "Algo salió mal", text: message });
};
export const alertSuccess = (message: string) => {
  Swal.fire({ title: "Hecho", text: message });
};
export const alertLoading = (message: string) => {
  Swal.fire({
    title: "Cargando, por favor espere",
    text: message,
    showConfirmButton: false,
  });
};

export const TIPO_ESTADO = [
  {
    id: 1,
    name: "Disponible",
    color: "bg-green-500",
  },
  {
    id: 2,
    name: "No disponible",
    color: "bg-gray-500",
  },
  {
    id: 3,
    name: "Pronto...",
    color: "bg-red-500",
  },
];
