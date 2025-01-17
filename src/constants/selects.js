const eventLocationType = [
  {
    id: "Indoor",
    label: "Indoor",
  },
  {
    id: "Outdoor",
    label: "Outdoor",
  },
  {
    id: "Both",
    label: "Both",
  },
];

const eventAvailableRegistrationFee = [
  {
    id: "normal",
    label: "Normal",
    checked: true,
    fixed: true,
  },
  {
    id: "early_bird",
    label: "Early Bird",
    checked: false,
    fixed: false,
  },
];

const teamCategories = [
  {
    id: "individu",
    label: "Individu",
  },
  {
    id: "mix_team",
    label: "Mix Team",
  },
  {
    id: "male_team",
    label: "Male Team",
  },
  {
    id: "female_team",
    label: "Female Team",
  },
];

const confirmation = [
  {
    id: "1",
    label: "Iya",
  },
  {
    id: "0",
    label: "Tidak",
  },
];

const eventAudiences = [
  {
    id: "public",
    label: "public",
  },
  {
    id: "specific",
    label: "Audience tertentu",
  },
];

const eventPublishTime = [
  {
    id: "now",
    label: "Sekarang",
  },
  {
    id: "scheduled",
    label: "Jadwalkan",
  },
];

const fulldayAudience = [
  {
    id: "individual",
    label: "Individu",
  },
  // {
  //   id: "team",
  //   label: "Tim"
  // },
];

const gender = [
  {
    id: "male",
    label: "Laki-laki",
  },
  {
    id: "female",
    label: "Perempuan",
  },
];

const classificationOption = [
  {
    label: "Nama tim disediakan panitia",
    value: "fromCommitte",
  },
  {
    label: "Peserta input nama tim saat pendaftaran",
    value: "fromRegistrant",
  },
];

const tableClassificationMenuTab = [
  {
    id: "indexMenu",
    label: "No.",
  },
  {
    id: "nameMenu",
    label: "Nama",
  },
  {
    id: "actionMenu",
    label: "Aksi",
  },
];

export default {
  eventLocationType,
  eventAvailableRegistrationFee,
  teamCategories,
  confirmation,
  eventAudiences,
  eventPublishTime,
  fulldayAudience,
  gender,
  classificationOption,
  tableClassificationMenuTab,
};
