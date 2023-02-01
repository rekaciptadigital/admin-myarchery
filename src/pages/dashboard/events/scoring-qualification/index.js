import * as React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useEventDetail } from "./hooks/event-detail";
import { useCategoryDetails } from "./hooks/category-details";
import { useSubmitEliminationCount } from "./hooks/submit-elimination-count";
import { useSubmitEliminationConfig } from "./hooks/submit-elimination-config";
import { useScoresheetDownload } from "./hooks/scoresheet-download";
import { useScoresheetDownloadSelection } from "./hooks/scoresheet-download-selection";

import Select from "react-select";
import { SpinnerDotBlock, ButtonBlue, LoadingScreen, AlertSubmitError } from "components/ma";
import { toast } from "components/ma/processing-toast";
import { ToolbarFilter } from "components/ma/toolbar-filters";
import { ScoringPageWrapper } from "../components/scoring-page-wrapper";
import { SelectionKnobsView } from "../components/selection-knobs-view";
import { ScoringTable } from "./components/scoring-table";
import { ScoringTableTeam } from "./components/scoring-table-team";
import { SearchBox } from "./components/search-box";
import { ButtonDownloadScoresheet } from "./components/button-download-scoresheet";
import { ButtonConfirmPrompt } from "./components/button-confirm-prompt";
import { ButtonCancelBracket } from "./components/button-cancel-bracket";
import { ButtonShowBracket } from "./components/button-show-bracket";

import IconCheck from "components/ma/icons/fill/check";
import { useQualificationDownload } from "./hooks/qualification-download";

const optionsParticipantsCount = [
  { value: 4, label: "4 Besar" },
  { value: 8, label: "8 Besar" },
  { value: 16, label: "16 Besar" },
  { value: 32, label: "32 Besar" },
];

function _getSelectedFromValue(countValue) {
  if (!countValue) {
    return null;
  }
  return optionsParticipantsCount.find((option) => option.value === countValue);
}

function PageEventScoringQualification() {
  const { event_id } = useParams();
  const eventId = parseInt(event_id);
  const { data: eventDetail, isLoading: isInitialLoadingEventDetail } = useEventDetail(eventId);

  const isSelectionType = eventDetail?.eventCompetition === "Selection";
  const pageProps = { pageTitle: "Skoring Kualifikasi", isSelectionType: isSelectionType };

  const {
    data: categoryDetails,
    errors: errorsCategoryDetail,
    isSettled: isSettledCategories,
    fetchCategoryDetails,
  } = useCategoryDetails(eventId);

  const [inputSearchQuery, setInputSearchQuery] = React.useState("");
  const [localCountNumber, setLocalCountNumber] = React.useState(null);
  const countNumberInputRef = React.useRef(null);

  const [activeCategory, setActiveCategory] = React.useState(null);
  const isIndividual = activeCategory?.categoryTeam?.toLowerCase?.() === "individual";

  const {
    submit: updateEliminationMemberCount,
    isLoading: isLoadingSubmitCount,
    isError: isErrorSubmitCount,
    errors: errorsSubmitCount,
  } = useSubmitEliminationCount(activeCategory?.id);

  const {
    submit: setElimination,
    isLoading: isLoadingSubmitElimination,
    isError: isErrorSubmitElimination,
    errors: errorsSubmitElimination,
  } = useSubmitEliminationConfig(activeCategory?.id);

  const { download } = useScoresheetDownload(activeCategory?.id);
  const { download: downloadQualification } = useQualificationDownload(eventId, activeCategory?.id);

  const {
    download: downloadSelection,
    isError: isErrorDownloadSelection,
    errors: errorsDownloadSelection,
  } = useScoresheetDownloadSelection(activeCategory?.id);

  const resetOnChangeCategory = () => {
    setLocalCountNumber(null);
    setInputSearchQuery("");
  };

  const errorFetchingData = !categoryDetails && errorsCategoryDetail;

  if (errorFetchingData) {
    return (
      <ScoringPageWrapper {...pageProps}>
        <ViewWrapper>
          <p>
            Terdapat kendala dalam mengambil data. Lihat detail berikut untuk melihat informasi
            teknis lebih lanjut:
          </p>

          <pre>{JSON.stringify(errorsCategoryDetail)}</pre>
        </ViewWrapper>
      </ScoringPageWrapper>
    );
  }

  if (!isSettledCategories || isInitialLoadingEventDetail) {
    return (
      <ScoringPageWrapper {...pageProps}>
        <SpinnerDotBlock />
      </ScoringPageWrapper>
    );
  }

  return (
    <ScoringPageWrapper {...pageProps}>
      <LoadingScreen loading={isLoadingSubmitCount || isLoadingSubmitElimination} />
      <AlertSubmitError isError={isErrorSubmitCount} errors={errorsSubmitCount} />
      <AlertSubmitError isError={isErrorSubmitElimination} errors={errorsSubmitElimination} />
      <AlertSubmitError isError={isErrorDownloadSelection} errors={errorsDownloadSelection} />

      <ToolbarFilter
        categories={categoryDetails}
        onChange={(data) => setActiveCategory(data?.categoryDetail)}
        viewLeft={isSelectionType ? <SelectionKnobsView /> : undefined}
        viewRight={
          isSelectionType ? (
            <div key={activeCategory?.id}>
              <ButtonDownloadScoresheet
                buttonLabel="Unduh Scoresheet"
                sessionCount={activeCategory?.sessionInQualification}
                disabled={!isIndividual}
                onDownload={(sessionNumber) => {
                  toast.loading("Sedang menyiapkan file...");
                  if (sessionNumber == 'qualification') {
                    downloadQualification({
                      onSuccess: () => {
                        toast.dismiss();
                      },
                      onError: () => {
                        toast.dismiss();
                        toast.error("Gagal memulai unduhan");
                      },
                    });
                  } else {
                    downloadSelection(sessionNumber, {
                      onSuccess: () => {
                        toast.dismiss();
                      },
                      onError: () => {
                        toast.dismiss();
                        toast.error("Gagal memulai unduhan");
                      },
                    });
                  }
                }}
              />
            </div>
          ) : (
            <ToolbarRight key={activeCategory?.id}>
              <HorizontalSpaced>
                <SelectEliminationCounts>
                  <label htmlFor="elimination-members-count">Babak Eliminasi</label>
                  <Select
                    ref={countNumberInputRef}
                    openMenuOnFocus
                    placeholder="Pilih jumlah"
                    options={optionsParticipantsCount}
                    value={_getSelectedFromValue(
                      localCountNumber || activeCategory?.defaultEliminationCount
                    )}
                    onChange={(option) => {
                      setLocalCountNumber(option.value);
                      updateEliminationMemberCount(option.value, {
                        onSuccess() {
                          fetchCategoryDetails();
                        },
                        onError() {
                          setLocalCountNumber(activeCategory?.defaultEliminationCount);
                        },
                      });
                    }}
                    isDisabled={Boolean(activeCategory?.eliminationLock)}
                  />

                  {Boolean(activeCategory?.defaultEliminationCount) && (
                    <AppliedIconWrapper>
                      <IconCheck size="20" />
                    </AppliedIconWrapper>
                  )}
                </SelectEliminationCounts>

                <PushBottom>
                  <SearchBox
                    placeholder="Cari peserta"
                    value={inputSearchQuery}
                    onChange={(ev) => setInputSearchQuery(ev.target.value)}
                  />
                </PushBottom>

                <PushBottom>
                  <ButtonShowBracket
                    categoryDetailId={activeCategory?.id}
                    eliminationMemberCount={activeCategory?.defaultEliminationCount}
                    eventDetail={eventDetail}
                  />
                </PushBottom>
              </HorizontalSpaced>

              <HorizontalSpaced>
                <ButtonDownloadScoresheet
                  sessionCount={activeCategory?.sessionInQualification}
                  disabled={!isIndividual}
                  onDownload={(sessionNumber) => {
                    toast.loading("Sedang menyiapkan dokumen...");
                    if (sessionNumber === 'qualification') {
                      downloadQualification({
                        onSuccess: () => {
                          toast.dismiss();
                        },
                        onError: () => {
                          toast.dismiss();
                          toast.error("Gagal memulai unduhan");
                        },
                      });
                    } else {
                      const options = {
                        onSuccess: () => {
                          toast.dismiss();
                        },
                      };
                      download(sessionNumber, options);
                    }
                  }}
                />

                {activeCategory?.eliminationLock ? (
                  <ButtonCancelBracket
                    categoryId={activeCategory?.id}
                    onSuccess={fetchCategoryDetails}
                  />
                ) : !localCountNumber ? (
                  <ButtonBlue onClick={() => countNumberInputRef.current?.focus?.()}>
                    Lanjut ke Eliminasi
                  </ButtonBlue>
                ) : (
                  <ButtonConfirmPrompt
                    title="Tentukan bagan eliminasi"
                    onConfirm={() => {
                      setElimination(localCountNumber, {
                        onSuccess: () => {
                          toast.success("Bagan eliminasi selesai");
                          fetchCategoryDetails();
                        },
                      });
                    }}
                  />
                )}
              </HorizontalSpaced>
            </ToolbarRight>
          )
        }
      />

      <ViewWrapper>
        {activeCategory &&
          (isIndividual ? (
            <ScoringTable
              key={_makeTableKeyByCategory(activeCategory)}
              categoryDetailId={activeCategory?.id}
              isSelectionType={isSelectionType}
              isLocked={Boolean(!activeCategory || activeCategory?.eliminationLock)}
              searchName={inputSearchQuery}
              onChangeParticipantPresence={resetOnChangeCategory}
              eliminationParticipantsCount={activeCategory?.defaultEliminationCount}
              eventDetail={eventDetail}
            />
          ) : (
            <ScoringTableTeam
              key={_makeTableKeyByCategory(activeCategory)}
              categoryDetailId={activeCategory?.id}
              isLocked={Boolean(!activeCategory || activeCategory?.eliminationLock)}
              searchName={inputSearchQuery}
              onChangeParticipantPresence={resetOnChangeCategory}
              eliminationParticipantsCount={activeCategory?.defaultEliminationCount}
              eventDetail={eventDetail}
            />
          ))}
      </ViewWrapper>
    </ScoringPageWrapper>
  );
}

/* =============================== */
// styles

const ViewWrapper = styled.div`
  padding: 1.875rem;
  padding-top: 0;
  background-color: #ffffff;

  > * + * {
    margin-top: 1.875rem;
  }
`;

const ToolbarRight = styled.div`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const SelectEliminationCounts = styled.div`
  position: relative;
  min-width: 7.5rem;
`;

const AppliedIconWrapper = styled.div`
  position: absolute;
  bottom: 0.5rem;
  left: -1.5rem;
`;

const HorizontalSpaced = styled.div`
  display: flex;
  gap: 0.5rem;

  > * {
    flex-grow: 1;
  }
`;

const PushBottom = styled.div`
  align-self: flex-end;
`;

/* ================================ */
// utils

function _makeTableKeyByCategory(activeCategoryDetail) {
  if (!activeCategoryDetail) {
    return "default-key";
  }
  return activeCategoryDetail.id;
}

export default PageEventScoringQualification;
