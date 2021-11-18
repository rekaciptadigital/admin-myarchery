import { panah, users, target, userPlus, fileText } from "./icon-svgs";

const menus = [
  {
    id: 1,
    icon: panah,
    title: "Pertandingan",
    description:
      "Mengatur jenis pertandingan, kategori, jadwal, kuota, biaya registrasi, dan lainnya",
    computeLink: (eventId) => `/dashboard/event/${eventId}/pertandingan`,
  },
  {
    id: 2,
    icon: users,
    title: "Peserta",
    description: "Melihat data peserta, pengaturan bantalan, jadwal peserta, dan lainnya",
    computeLink: (eventId) => `/dashboard/member/${eventId}`,
  },
  {
    id: 3,
    icon: target,
    title: "Skor",
    description: "Hasil score, pengaturan score, babak kualifikasi & eliminasi, dan lainnya",
    computeLink: () => "",
  },
  {
    id: 4,
    icon: userPlus,
    title: "Panitia",
    description: "Profil panitia, wasit/scorer",
    computeLink: () => "",
  },
  {
    id: 5,
    icon: fileText,
    title: "Dokumen",
    description: "Master e-sertifikat",
    computeLink: (eventId) => `/dashboard/certificate/new?event_id=${eventId}`,
  },
];

export default menus;
