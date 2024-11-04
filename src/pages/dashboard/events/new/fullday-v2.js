import * as React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useRouteQueryParams } from "./hooks/route-params";
import { useEventDetail } from "./hooks/event-detail";
import { useCategoryDetails } from "./hooks/category-details";
import { useCategoriesQualification } from "./hooks/qualification-categories";
import { useConfigRegistrationDates } from "./hooks/config-registration-dates";
import { useQualificationSchedules } from "./hooks/qualification-schedules";
import { useFormPublicInfos } from "./hooks/form-public-infos";
import { useFormFees } from "./hooks/form-fees";
import { useFormCategories } from "./hooks/form-categories";
import { useFormRegistrationDates } from "./hooks/form-registration-dates";
import { useFormSchedules } from "./hooks/form-schedules";
import { useSubmitPublicInfos } from "./hooks/submit-public-infos";
import { useSubmitEventLogo } from "./hooks/submit-event-logo";
import { useSubmitRegistrationDates } from "./hooks/submit-config-registration-dates";
import { useSubmitCategories } from "./hooks/submit-categories";
import { useSubmitRuleSetting } from "./screens/rules/hooks/submit-rule-shoot-setting";
import { useFormRule } from "./hooks/form-rule";
import { useShootRuleSetting } from "./screens/rules/hooks/shoot-rule-settings";
import { useSubmitClubsRanking } from "./screens/rules/hooks/submit-clubs-ranking";
import { useClubRankingSetting } from "./screens/rules/hooks/club-ranking-settings";
// import { useFaceTargetSetting } from "./screens/rules/hooks/face-target-settings";
// import { useSubmitRuleFaceSetting } from "./screens/rules/hooks/submit-rule-face-setting";

import { AlertSubmitError, ButtonOutlineBlue } from "components/ma";
import { ContentLayoutWrapper } from "./components/content-layout-wrapper";
import {
  StepByStepScreen,
  StepListIndicator,
  StepItem,
  StepDisplay,
  StepContent,
  StepHeader,
  StepBody,
  StepFooterActions,
} from "./components/step-by-step-screen";
import { ButtonSave } from "./components/button-save";
import { ProcessingToast, toast } from "./components/processing-toast";
import { LoadingScreen } from "./components/loading-screen-portal";

import { ScreenPublicInfos } from "./screens/public-infos";
import { ScreenFees } from "./screens/fees";
import { ScreenCategories } from "./screens/categories";
import { ScreenRegistrationDates } from "./screens/registration-dates";
import { ScreenRules } from "./screens/rules";
import { ScreenSchedules } from "./screens/schedules";
import { ScreenSchedulesMarathon } from "./screens/schedules-marathon";
import { ScreenFinish } from "./screens/finish";

import { eventConfigs } from "constants/index";
import { stepId } from "./constants/step-ids";
import { computeLastUnlockedStep } from "./utils/last-unlocked-step";

import IconPlus from "components/ma/icons/mono/plus";
import SelectClassificationSetting from "./components/select-classification-setting";
import { useCountry } from "./hooks/country";
import { fetchClassification } from "./hooks/form-classification";

const { EVENT_TYPES } = eventConfigs;

function PageCreateEventFullday({ classification }) {
  const {
    eventId,
    isManageEvent,
    eventType: qsEventType,
    matchType: qsMatchType,
    setParamEventId,
    pathname,
  } = useRouteQueryParams();
  let classificationSetting = {};
  const {
    data: eventDetail,
    isPreparing: isPreparingEvent,
    fetchEventDetail,
  } = useEventDetail(eventId);
  const { data: categoryDetails, fetch: fetchCategoryDetails } =
    useCategoryDetails(eventId);
  const { data: categoriesQualification } =
    useCategoriesQualification(eventDetail);
  const schedulesProvider = useQualificationSchedules(eventDetail);
  const { data: configRegistrationDates, fetch: fetchConfigRegistrationDates } =
    useConfigRegistrationDates(eventId);
  const { data: schedules } = schedulesProvider;
  const { data: shootSettings, fetchRuleShootSetting } =
    useShootRuleSetting(eventId);
  // const { data: targetfacegSettings, fetchTargetFaceSetting } =
  //   useFaceTargetSetting(eventId);
  const { data: rankingSettings, fetchRankingSetting } =
    useClubRankingSetting(eventId);
  const classificationCategory = classification;
  const [countryKeyword, setCountryKeyword] = React.useState("");
  const [provinceKeyword, setProvinceKeyword] = React.useState("");
  const [selectedCountry, setSelectedCountry] = React.useState(null);
  const [selectedProvince, setSelectedProvince] = React.useState(null);
  const [selectOptionClassification, setSelectOptionClassification] =
    React.useState(null);
  const [countryList, provinceList] = useCountry(
    countryKeyword,
    provinceKeyword,
    selectedCountry,
    selectedProvince
  );
  if (selectOptionClassification) {
    classificationSetting.parentClassification = selectOptionClassification;
  }
  if (
    selectOptionClassification?.id === 2 ||
    selectOptionClassification?.id === 3 ||
    selectOptionClassification?.id === 4
  ) {
    classificationSetting.setting_country = selectedCountry;
    classificationSetting.setting_province = selectedProvince;
  }

  const eventType = _checkEventType(eventDetail, qsEventType);
  const matchType = _checkMatchType(eventDetail, qsMatchType);
  const isTypeMarathon = eventType === EVENT_TYPES.MARATHON;
  const isTypeSelection = matchType === "Selection";
  // Forms
  const formPublicInfos = useFormPublicInfos(eventDetail);
  const formFees = useFormFees(eventDetail);
  const formCategories = useFormCategories(eventDetail);
  const formRegistrationDates = useFormRegistrationDates(
    categoryDetails,
    configRegistrationDates
  );
  const formSchedules = useFormSchedules(schedules, {
    eventType,
    eventDetail,
    categoryDetails: categoriesQualification,
  });
  const formRule = useFormRule({ eventDetail, rankingSettings });
  const { parentClassificationList } = fetchClassification(null, "list");
  const emptyFormSequenceByStep = isTypeSelection
    ? {
        1: formPublicInfos.isEmpty,
        2: formFees.isEmpty,
        3: formCategories.isEmpty,
        4: formRegistrationDates.isFirstTimeCreatingConfig,
        5: formSchedules.isEmpty,
        6: !formSchedules.isEmpty,
      }
    : {
        1: formPublicInfos.isEmpty,
        2: formFees.isEmpty,
        3: formCategories.isEmpty,
        4: formRegistrationDates.isFirstTimeCreatingConfig,
        5: false, // selalu unlock apapun nilainya (sifatnya gak wajib diset)
        6: formSchedules.isEmpty,
        7: !formSchedules.isEmpty,
      };

  const lastUnlockedStep = computeLastUnlockedStep(emptyFormSequenceByStep);

  // Submit functions
  const {
    submit: submitPublicInfos,
    isLoading: isSubmitingPublicInfos,
    isError: isErrorPublicInfos,
    errors: publicInfosErrors,
  } = useSubmitPublicInfos({
    eventType: eventType,
    matchType: matchType,
    eventId: eventDetail?.id,
  });

  const {
    submit: submitLogo,
    isLoading: isLoadingLogo,
    isError: isErrorLogo,
    errors: errorsLogo,
  } = useSubmitEventLogo(eventDetail?.id);

  const {
    submit: submitCategories,
    isLoading: isSubmitingCategories,
    isError: isErrorCategories,
    errors: categoriesErrors,
  } = useSubmitCategories();

  const {
    submit: submitRegistrationDates,
    isLoading: isSubmitRegistrationDates,
    isError: isErrorRegistrationDates,
    errors: errorsRegistrationDates,
  } = useSubmitRegistrationDates(eventDetail?.id, {
    ...formRegistrationDates.data,
    classification: classificationSetting,
  });

  const {
    submit: submitRuleSetting,
    isLoading: isLoadingSubmitRule,
    isError: isErrorSubmitRule,
    errors: errorsSubmitRule,
  } = useSubmitRuleSetting(eventDetail?.id, formRule.submitRule);

  // const {
  //   submit: submitFaceRuleSetting,
  //   isLoading: isLoadingSubmitRuleFace,
  //   isError: isErrorSubmitRuleFace,
  //   errors: errorsSubmitRuleFace,
  // } = useSubmitRuleFaceSetting(eventDetail?.id, formRule.submitRuleFace);

  const {
    submit: submitClubRank,
    isLoading: isLoadingSubmitClubRank,
    isError: isErrorSubmitClubRank,
    errors: errorsSubmitClubRank,
  } = useSubmitClubsRanking(eventDetail?.id, formRule.formPemeringkatan);

  const isLoadingSubmit =
    isSubmitingPublicInfos ||
    isLoadingLogo ||
    isSubmitingCategories ||
    isSubmitRegistrationDates ||
    isLoadingSubmitRule ||
    isLoadingSubmitClubRank;
  // ||
  //  isLoadingSubmitRuleFace;

  const onSelectOption = (val) => {
    setSelectedCountry(val);
    setCountryKeyword(val.label);
  };

  const onChangeInputCountry = (val) => {
    if (val.length) {
      setCountryKeyword(val);
    }
  };

  const onSelectOptionProvince = (val) => {
    setSelectedProvince(val);
  };

  const classificationParentList = React.useMemo(() => {
    return parentClassificationList?.data?.map((val) => ({
      ...val,
      value: val.title.includes("Wilayah Provinsi")
        ? "provinsi"
        : val.title.includes("Wilayah Kota")
        ? "city"
        : val.title === "Negara"
        ? "country"
        : val.title.toLowerCase(),
      label:
        (val.title === "Wilayah Provinsi" ||
        val.title === "Wilayah Kota" ||
        val.title === "Negara"
          ? val.title
          : val.title &&
            val.title?.split("")[0]?.toUpperCase() +
              val.title?.slice(1, val.title?.length)) +
        (val.childrens?.length ? ` (${val.childrens?.length})` : ""),
    }));
  }, [parentClassificationList]);

  React.useEffect(() => {
    if (configRegistrationDates?.parentClassification !== 0) {
      setSelectOptionClassification(
        classificationParentList?.filter(
          (val) => val.id === configRegistrationDates?.parentClassification
        )[0]
      );
      if (configRegistrationDates?.classificationCountryName?.length) {
        setCountryKeyword(configRegistrationDates?.classificationCountryName);
      }
    }
  }, [configRegistrationDates, classificationParentList]);
  return (
    <ContentLayoutWrapper
      pageTitle="Buat Event Baru"
      breadcrumbText="Kembali"
      breadcrumbLink={
        isManageEvent ? `/dashboard/event/${eventId}/home` : "/dashboard"
      }
    >
      <ProcessingToast />
      <LoadingScreen loading={isLoadingSubmit} />
      <AlertSubmitError
        isError={isErrorPublicInfos}
        errors={publicInfosErrors}
      />
      <AlertSubmitError isError={isErrorLogo} errors={errorsLogo} />
      <AlertSubmitError isError={isErrorCategories} errors={categoriesErrors} />
      <AlertSubmitError
        isError={isErrorRegistrationDates}
        errors={errorsRegistrationDates}
      />
      <AlertSubmitError isError={isErrorSubmitRule} errors={errorsSubmitRule} />
      <AlertSubmitError
        isError={isErrorSubmitClubRank}
        errors={errorsSubmitClubRank}
      />
      {/* <AlertSubmitError
        isError={isErrorSubmitRuleFace}
        errors={errorsSubmitRuleFace}
      /> */}

      <StepByStepScreen
        lastUnlocked={lastUnlockedStep}
        setSelectOptionClassification={setSelectOptionClassification}
      >
        <StepListIndicator title="Pertandingan">
          <StepItem id={stepId.INFO_UMUM}>Informasi Umum</StepItem>
          <StepItem id={stepId.BIAYA}>Biaya Registrasi</StepItem>
          <StepItem id={stepId.KATEGORI}>Kategori Lomba</StepItem>
          <StepItem id={stepId.JADWAL_REGISTRASI}>
            Informasi Pendaftaran
          </StepItem>
          {!isTypeSelection && (
            <StepItem id={stepId.PERATURAN}>Aturan Pertandingan</StepItem>
          )}
          <StepItem id={stepId.JADWAL_KUALIFIKASI}>
            Jadwal Pertandingan
          </StepItem>
          <StepItem id={stepId.SELESAI}>Selesai</StepItem>
        </StepListIndicator>

        <StepDisplay>
          <StepContent id={stepId.INFO_UMUM}>
            <StepHeader>
              <h2>Informasi Umum</h2>
              <p>Banner dan informasi mengenai event Anda</p>
            </StepHeader>

            <StepBody>
              <ScreenPublicInfos
                eventDetail={eventDetail}
                fetchEventDetail={fetchEventDetail}
                form={formPublicInfos}
                isPreparing={isPreparingEvent}
              />
            </StepBody>

            <StepFooterActions>
              <ButtonSave
                onSubmit={async ({ next }) => {
                  // Maafkan kerumitan ini wkwk. Ini karena ada 2 endpoint API yang
                  // harus di-hit sekaligus ketika klik tombol simpan, tanpa terjadi
                  // race condition.
                  const isCreateMode = !eventDetail?.id || !eventId;
                  let tempEventId = undefined;

                  try {
                    await new Promise((resolve, reject) => {
                      submitPublicInfos(formPublicInfos.data, {
                        onSuccess(data) {
                          tempEventId = data.id;
                          resolve();
                        },
                        onError() {
                          reject();
                        },
                      });
                    });

                    const SUCCESS_MESSAGE =
                      "Informasi umum event berhasil disimpan";

                    // 1
                    if (!isCreateMode) {
                      toast.success(SUCCESS_MESSAGE);
                      fetchEventDetail();
                      return;
                    }

                    // 2
                    if (!formPublicInfos.data.logoImage?.base64) {
                      toast.success(SUCCESS_MESSAGE);
                      setParamEventId(tempEventId); // set event id di sini akan otomatis trigger fetch event detail
                      next();
                      return;
                    }

                    // 3
                    submitLogo(formPublicInfos.data.logoImage?.base64, {
                      eventId: tempEventId,
                      onSuccess() {
                        toast.success(SUCCESS_MESSAGE);
                        setParamEventId(tempEventId); // set event id di sini akan otomatis trigger fetch event detail
                        next();
                      },
                    });
                  } catch (err) {
                    toast.error("Terjadi kesalahan");
                    console.error(err);
                  }
                }}
              >
                Simpan
              </ButtonSave>
            </StepFooterActions>
          </StepContent>

          <StepContent id={stepId.BIAYA}>
            <StepHeader>
              <h2>Biaya Registrasi</h2>
              <p>Pengaturan biaya pendaftaran pertandingan</p>
            </StepHeader>

            <StepBody>
              <ScreenFees eventDetail={eventDetail} form={formFees} />
            </StepBody>

            <StepFooterActions>
              <ButtonSave
                onSubmit={({ next }) => {
                  if (!eventDetail?.eventCategories?.length) {
                    toast.success("Lanjutkan buat kategori.");
                    formFees.markAsFilled();
                    next();
                    return;
                  }

                  // Jalan cuma ketika "edit", udah ada kategorinya
                  submitCategories(formCategories.data, formFees, {
                    eventId,
                    onSuccess() {
                      toast.success("Berhasil menyimpan biaya registrasi");
                      fetchEventDetail();
                      fetchCategoryDetails();
                    },
                  });
                }}
              >
                Simpan
              </ButtonSave>
            </StepFooterActions>
          </StepContent>

          <StepContent id={stepId.KATEGORI}>
            <StepHeader>
              <SpacedHeaderBar>
                <div>
                  <h2>Kategori Lomba</h2>
                  <p>Pengaturan kategori beserta detailnya</p>
                </div>

                <div>
                  <ButtonOutlineBlue
                    as={Link}
                    to={{
                      pathname: "/dashboard/class-categories",
                      state: { from: pathname },
                    }}
                  >
                    Pengaturan Kelas
                  </ButtonOutlineBlue>

                  <ButtonOutlineBlue
                    disabled={
                      formCategories.data?.length >= formCategories.maxLength
                    }
                    onClick={() => formCategories.createEmptyCategory()}
                  >
                    <IconPlus size="13" /> Tambah Kategori
                  </ButtonOutlineBlue>
                </div>
              </SpacedHeaderBar>
            </StepHeader>

            <StepBody>
              <ScreenCategories
                eventDetail={eventDetail}
                fetchEventDetail={fetchEventDetail}
                form={formCategories}
                formFees={formFees}
              />
            </StepBody>

            <StepFooterActions>
              <ButtonSave
                onSubmit={({ next }) => {
                  submitCategories(formCategories.data, formFees, {
                    eventId,
                    onSuccess() {
                      fetchEventDetail();
                      fetchCategoryDetails();
                      toast.success("Berhasil menyimpan kategori");
                      if (formCategories.isEmpty) {
                        next();
                      }
                    },
                  });
                }}
              >
                Simpan
              </ButtonSave>
            </StepFooterActions>
          </StepContent>

          <StepContent id={stepId.JADWAL_REGISTRASI}>
            <StepHeader>
              <SpacedHeaderBar>
                <div>
                  <h2>Informasi Pendaftaran</h2>
                  <p>Pengaturan informasi pendaftaran untuk event Anda</p>
                </div>
              </SpacedHeaderBar>
            </StepHeader>

            {/* <CardForm>
              <div className="card-box">
                <h5>Verifikasi Peserta</h5>

                <FieldSettingToggleBar
                  label="Peserta wajib verifikasi dengan mengirimkan KTP/KK"
                  title={"Peserta wajib verifikasi dengan mengirimkan KTP/KK"}
                  on={checkState.isUseVerify}
                  onChange={setIsUseVerify}
                />
              </div>
            </CardForm> */}

            <StepBody>
              <ScreenRegistrationDates form={formRegistrationDates} />
            </StepBody>

            <CardForm>
              <div className="card-box-classification">
                <h5>Klasifikasi Peserta</h5>

                <SubtitleTextClassification>
                  Peserta Mendaftarkan mewakili
                </SubtitleTextClassification>
                <SelectContigentWrapper>
                  <SelectClassificationSetting
                    eventDetail={eventDetail}
                    initialSelect
                    optionsData={classificationParentList}
                    classificationCategory={classificationCategory}
                    value={
                      configRegistrationDates?.parentClassification === 0 ||
                      selectOptionClassification
                        ? selectOptionClassification
                          ? selectOptionClassification
                          : classificationParentList?.filter(
                              (val) => val.id === 1
                            )
                        : classificationParentList?.filter(
                            (val) =>
                              val.id ===
                                configRegistrationDates?.parentClassification ||
                              val.title?.toLowerCase() ===
                                configRegistrationDates?.parentClassificationTitle?.toLowerCase()
                          )
                    }
                    defaultValue={"test"}
                    onSelectOption={(val) => {
                      if (val.value === "newClassification") {
                        classificationCategory.setChangeView(2);
                        classificationCategory.setNewClassification([]);
                      } else {
                        setSelectOptionClassification(val);
                        if (val?.id === 3 || val?.id === 4) {
                          if (
                            configRegistrationDates?.classificationCountryId ===
                            0
                          ) {
                            setSelectedCountry({
                              id: 102,
                              name: "Indonesia",
                              value: "Indonesia",
                              label: "Indonesia",
                            });
                          }
                        } else {
                          setSelectedCountry(null);
                        }
                        setSelectedProvince(null);
                      }
                    }}
                    // textDetail={
                    //   selectOptionClassification?.id === 1
                    //     ? "Peserta mendaftar sebagai perwakilan klub jika ada"
                    //     : ""
                    // }
                  />
                  <RegionBox>
                    {selectOptionClassification?.id === 3 ||
                    selectOptionClassification?.id === 4 ? (
                      <SelectClassificationSetting
                        eventDetail={eventDetail}
                        optionsData={countryList}
                        onInputChange={onChangeInputCountry}
                        placeholder="Pilih Negara"
                        onSelectOption={onSelectOption}
                        label="Masukkan Negara"
                        value={
                          configRegistrationDates?.classificationCountryId ===
                            0 || selectedCountry
                            ? selectedCountry
                            : {
                                label:
                                  configRegistrationDates?.classificationCountryName,
                                id: configRegistrationDates?.classificationCountryId,
                                value:
                                  configRegistrationDates?.classificationCountryName,
                              }
                        }
                        // textDetail={
                        //   selectOptionClassification?.id === 2
                        //     ? "Peserta mendaftar sebagai perwakilan negara"
                        //     : ""
                        // }
                      />
                    ) : null}

                    {selectOptionClassification?.id === 4 &&
                    (selectedCountry ||
                      configRegistrationDates?.classificationCountryId) ? (
                      <SelectClassificationSetting
                        eventDetail={eventDetail}
                        optionsData={provinceList}
                        onInputChange={(val) => setProvinceKeyword(val)}
                        placeholder="Provinsi"
                        onSelectOption={onSelectOptionProvince}
                        label="Masukkan Provinsi"
                        value={
                          configRegistrationDates?.classificationProvinceId ===
                            0 || selectedProvince
                            ? selectedProvince
                            : {
                                label:
                                  configRegistrationDates?.classificationProvinceName,
                                id: configRegistrationDates?.classificationProvinceId,
                                value:
                                  configRegistrationDates?.classificationProvinceName,
                              }
                        }
                        // textDetail={
                        //   selectOptionClassification?.id === 3
                        //     ? "Peserta mendaftar sebagai Wilayah Provinsi"
                        //     : ""
                        // }
                      />
                    ) : null}
                  </RegionBox>
                </SelectContigentWrapper>
              </div>
            </CardForm>

            <StepFooterActions>
              <ButtonSave
                onSubmit={({ next }) => {
                  submitRegistrationDates({
                    onSuccess() {
                      toast.success("Berhasil menyimpan informasi pendaftaran");
                      // Event detail juga perlu di-GET ulang karena data untuk jadwal kualifikasi
                      // diambil dari data tanggal lomba dari event detail
                      fetchEventDetail();
                      fetchConfigRegistrationDates();
                      if (formRegistrationDates.isFirstTimeCreatingConfig) {
                        next();
                      }
                    },
                  });
                }}
              >
                Simpan
              </ButtonSave>
            </StepFooterActions>
          </StepContent>

          <StepContent id={stepId.PERATURAN}>
            <StepHeader>
              <h2>Aturan Pertandingan</h2>
              <p>Atur aturan pertandingan event Anda</p>
            </StepHeader>

            <StepBody>
              <ScreenRules
                eventDetail={eventDetail}
                form={formRule}
                shootSetting={shootSettings}
                rankingSettings={rankingSettings}
                // targetfacegSettings={targetfacegSettings}
              />
            </StepBody>

            <StepFooterActions>
              <ButtonSave
                onSubmit={() => {
                  // TODO: next kalau valid / sudah simpan data
                  submitRuleSetting({
                    onSuccess: () => {
                      toast.success("Data telah tersimpan");
                      fetchRuleShootSetting();
                    },
                  });

                  // submitFaceRuleSetting({
                  //   onSuccess: () => {
                  //     toast.success("Data Aturan tersimpan");
                  //     fetchTargetFaceSetting();
                  //   },
                  // });

                  formRule.handleValidation({
                    onInvalid: (errors) => {
                      // TODO: ke depan bisa kasih toast untuk display pesan error
                      toast.error(
                        "Terjadi kesalahan saat menyimpan aturan pertandingan club"
                      );
                      Object.values(errors).forEach((error) => {
                        console.log(error),
                          error.forEach((message) => console.error(message));
                      });
                    },
                    onValid: () => {
                      submitClubRank({
                        onSuccess: () => {
                          toast.success(
                            "Pengaturan untuk Pemeringkatan Klub berhasil disimpan"
                          );
                          fetchRankingSetting();
                        },
                      });
                    },
                  });
                  // next();
                }}
              >
                Simpan
              </ButtonSave>
            </StepFooterActions>
          </StepContent>

          <StepContent id={stepId.JADWAL_KUALIFIKASI}>
            <StepHeader>
              <h2>Jadwal Pertandingan</h2>
              <p>Atur jadwal pertandingan event Anda</p>
            </StepHeader>

            <StepBody>
              {!isTypeMarathon ? (
                // <ScreenSchedules
                //   eventDetail={eventDetail}
                //   categories={categoriesQualification}
                //   formSchedules={formSchedules}
                //   schedulesProvider={schedulesProvider}
                // />
                <ScreenSchedules
                  eventDetail={eventDetail}
                  categories={categoriesQualification}
                  eventType={eventType}
                  schedules={schedules}
                  schedulesProvider={schedulesProvider}
                />
              ) : (
                // <ScreenSchedulesMarathon
                //   eventDetail={eventDetail}
                //   categories={categoriesQualification}
                //   formSchedules={formSchedules}
                //   onSuccessSubmit={schedulesProvider.fetchSchedules}
                // />

                <ScreenSchedulesMarathon
                  eventDetail={eventDetail}
                  categories={categoriesQualification}
                  schedules={schedules}
                  eventType={eventType}
                  onSuccessSubmit={schedulesProvider.fetchSchedules}
                />
              )}
            </StepBody>

            <StepFooterActions>
              <ButtonSave
                disabled={formSchedules.isEmpty}
                onSubmit={({ next }) => {
                  toast.success("Selesai mengisi data event!");
                  next();
                }}
              >
                Selesai
              </ButtonSave>
            </StepFooterActions>
          </StepContent>

          <StepContent id={stepId.SELESAI}>
            <StepBody>
              <ScreenFinish
                eventDetail={eventDetail}
                fetchEventDetail={fetchEventDetail}
              />
            </StepBody>
          </StepContent>
        </StepDisplay>
      </StepByStepScreen>
    </ContentLayoutWrapper>
  );
}

const SelectContigentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const RegionBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  &.reverse-box {
    flex-direction: column-reverse;
  }
`;

const SpacedHeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  > *:nth-child(1) {
    flex-grow: 1;
  }

  > *:nth-child(2) {
    flex-shrink: 0;

    > * + * {
      margin-left: 0.5rem;
    }
  }
`;

const CardForm = styled.div`
  background: white;
  padding: 35px;
  margin-bottom: 20px;
  border-radius: 8px;
  color: #1c1c1c;

  .card-box {
    padding: 20px;
    border: 1px solid var(--ma-gray-200);
    border-radius: 8px;
    > * + * {
      margin-top: 1.5rem;
    }
  }

  .card-box-classification {
    padding: 20px;
    border: 1px solid var(--ma-gray-200);
    border-radius: 8px;
    > * + * {
      margin: 0.5rem 0;
    }
  }
`;

const SubtitleTextClassification = styled.div`
  font-weight: 400;
  font-size: 14px;
  color: #1c1c1c;
  padding-top: 10px;
`;

/* ======================================= */
// utils

function _checkEventType(eventDetail, qsEventType) {
  return eventDetail?.eventType || qsEventType || null;
}

function _checkMatchType(eventDetail, qsMatchType) {
  return eventDetail?.eventCompetition || qsMatchType || null;
}

export { PageCreateEventFullday };
