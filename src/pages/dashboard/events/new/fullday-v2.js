import * as React from "react";
import styled from "styled-components";
import { useRouteQueryParams } from "./hooks/route-params";
import { useEventDetail } from "./hooks/event-detail";
import { useFormPublicInfos } from "./hooks/form-public-infos";
import { useFormFees } from "./hooks/form-fees";
import { useFormCategories } from "./hooks/form-categories";
import { useFormSchedules } from "./hooks/form-schedules";
import { useSubmitPublicInfos } from "./hooks/submit-public-infos";
import { useSubmitCategories } from "./hooks/submit-categories";

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

import { stepId } from "./constants/step-ids";
import { computeLastUnlockedStep } from "./utils/last-unlocked-step";

function PageCreateEventFullday() {
  const { qs, setParamEventId } = useRouteQueryParams();
  const eventId = qs.event_id ? parseInt(qs.event_id) : null;

  const { data: eventDetail, fetchEventDetail } = useEventDetail(eventId);

  // Forms
  const formPublicInfos = useFormPublicInfos(eventDetail);
  const formFees = useFormFees(eventDetail);
  const formCategories = useFormCategories(eventDetail);
  const formSchedules = useFormSchedules(eventDetail);

  const lastUnlockedStep = computeLastUnlockedStep([
    formPublicInfos.isEmpty,
    formFees.isEmpty,
    formCategories.isEmpty,
    formSchedules.isEmpty,
  ]);

  // Submit functions
  const {
    submit: submitPublicInfos,
    isLoading: isSubmitingPublicInfos,
    isError: isErrorPublicInfos,
    errors: publicInfosErrors,
  } = useSubmitPublicInfos();

  const {
    submit: submitCategories,
    isLoading: isSubmitingCategories,
    isError: isErrorCategories,
    errors: categoriesErrors,
  } = useSubmitCategories();

  const isLoadingSubmit = isSubmitingPublicInfos || isSubmitingCategories;

  return (
    <ContentLayoutWrapper pageTitle="Buat Event Baru">
      <ProcessingToast />
      <LoadingScreen loading={isLoadingSubmit} />
      <AlertSubmitError isError={isErrorPublicInfos} errors={publicInfosErrors} />
      <AlertSubmitError isError={isErrorCategories} errors={categoriesErrors} />

      <StepByStepScreen lastUnlocked={lastUnlockedStep}>
        <StepListIndicator title="Pertandingan">
          <StepItem id={stepId.INFO_UMUM}>Informasi Umum</StepItem>
          <StepItem id={stepId.BIAYA}>Biaya Registrasi</StepItem>
          <StepItem id={stepId.KATEGORI}>Kategori Lomba</StepItem>
          <StepItem id={stepId.JADWAL_KUALIFIKASI}>Jadwal Pertandingan</StepItem>
          <StepItem id={stepId.SELESAI}>Selesai</StepItem>
        </StepListIndicator>

        <StepDisplay>
          <StepContent id={stepId.INFO_UMUM}>
            <StepHeader>
              <h2>Informasi Umum</h2>
              <p>Banner dan informasi mengenai event Anda</p>
            </StepHeader>

            <StepBody>
              <ScreenPublicInfos eventDetail={eventDetail} form={formPublicInfos} />
            </StepBody>

            <StepFooterActions>
              <ButtonSave
                onSubmit={({ next }) => {
                  submitPublicInfos(formPublicInfos.data, {
                    eventId: eventDetail?.id,
                    onSuccess(data) {
                      toast.success("Informasi umum event berhasil disimpan");
                      const isCreateMode = !eventDetail?.id || !eventId;
                      if (isCreateMode) {
                        setParamEventId(data.id);
                      } else {
                        fetchEventDetail();
                      }
                      next();
                    },
                  });
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
                      next();
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
                    corner="8"
                    disabled={formCategories.data?.length >= formCategories.maxLength}
                    onClick={() => formCategories.createEmptyCategory()}
                  >
                    Tambah Kategori
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
                      toast.success("Berhasil menyimpan kategori");
                      fetchEventDetail();
                      next();
                    },
                  });
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
              <h1>TBD: Form Jadwal Pertandingan</h1>
            </StepBody>

            <StepFooterActions />
          </StepContent>

          <StepContent id={stepId.SELESAI}>
            <StepBody>
              <div>[TBD: gambar ilustrasi]</div>

              <h2>Pengaturan Pertandingan berhasil disimpan</h2>
              <p>
                Atur pertandingan, jadwal kualifikasi &amp; semua tentang event di Manage Event.
                Buat lebih banyak event di Dashboard EO.
              </p>

              <div>
                <button>Pratinjau</button>
                <button>Publikasi</button>
              </div>
            </StepBody>
          </StepContent>
        </StepDisplay>
      </StepByStepScreen>
    </ContentLayoutWrapper>
  );
}

const SpacedHeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export { PageCreateEventFullday };