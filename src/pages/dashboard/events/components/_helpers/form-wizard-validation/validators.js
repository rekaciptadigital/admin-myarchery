const validators = {
  eventName: (value) => {
    if (!value) {
      return "Nama event wajib diisi";
    }
  },
  location: (value) => {
    if (!value) {
      return "Lokasi event wajib diisi";
    }
  },
  locationType: (value) => {
    if (!value) {
      return "Tipe lokasi event wajib dipilih salah satu";
    }
  },
  city: (value) => {
    if (!value) {
      return "Lokasi event wajib diisi";
    }
  },
  poster: (value) => {
    if (!value) {
      return "Poster event wajib diupload";
    }
  },
  registrationFees: {
    price: (value) => {
      if (!value) {
        return "Harga normalnya wajib diisi";
      }
    },
  },
  teamCategories: (value) => {
    if (!value?.length) {
      return "Kategori regu wajib dipilih minimal satu";
    }
  },
  registrationStartDatetime: (value) => {
    if (!value?.length) {
      return "Tanggal dan jam buka pendaftaran wajib diisi";
    }
    if (value === "Invalid date") {
      return "Silakan isi dengan tanggal dan jam yang sesuai";
    }
  },
  registrationEndDatetime: (value) => {
    if (!value?.length) {
      return "Tanggal dan jam tutup pendaftaran wajib diisi";
    }
    if (value === "Invalid date") {
      return "Silakan isi dengan tanggal dan jam yang sesuai";
    }
  },
  eventStartDatetime: (value) => {
    if (!value?.length) {
      return "Tanggal dan jam mulai lomba wajib diisi";
    }
    if (value === "Invalid date") {
      return "Silakan isi dengan tanggal dan jam yang sesuai";
    }
  },
  eventEndDatetime: (value) => {
    if (!value?.length) {
      return "Tanggal dan jam selesai lomba wajib diisi";
    }
    if (value === "Invalid date") {
      return "Silakan isi dengan tanggal dan jam yang sesuai";
    }
  },
  qualificationStartDatetime: (value) => {
    if (!value?.length) {
      return "Tanggal buka kualifikasi wajib diisi";
    }
  },
  qualificationEndDatetime: (value) => {
    if (!value?.length) {
      return "Tanggal tutup kualifikasi wajib diisi";
    }
  },
  qualificationSessionLength: (value) => {
    if (!value) {
      return "Durasi sesi kualifikasi wajib dipilih salah satu";
    }
  },
  eventCategories: {
    ageCategory: (value) => {
      if (!value) {
        return "Kategori kelas lomba wajib diisi";
      }
    },
    maxDateOfBirth: (value) => {
      if (!value || (Array.isArray(value) && !value.length)) {
        return "Tanggal lahir maksimal peserta wajib diisi";
      }
    },
    competitionCategories: {
      competitionCategory: (value) => {
        if (!value) {
          return "Kategori lombanya diisi dulu ya";
        }
      },
      distancesDisplay: (value) => {
        if (!value || (Array.isArray(value) && !value.length)) {
          return "Tentukan dulu jarak yang akan dilombakan";
        }
      },
    },
  },
};

function getValidatorByField(fieldName) {
  const fieldKeys = fieldName.split(".");
  const isNumber = (value) => !isNaN(value);
  let validatorFound = validators;
  for (let key of fieldKeys) {
    if (isNumber(key)) {
      continue;
    }
    validatorFound = validatorFound[key];
  }
  if (validatorFound) {
    return validatorFound;
  }
}

export { validators, getValidatorByField };