import * as React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useEventDetail } from "../scoring-qualification/hooks/event-detail";
import { useCategoryDetails } from "./hooks/category-details";
import { useDownloadScoresheetSelection } from "./hooks/download-scoresheet-selection";

import { ButtonOutlineBlue, SpinnerDotBlock } from "components/ma";
import { ToolbarFilter } from "components/ma/toolbar-filters";
import { toast } from "components/ma/processing-toast";
import { ScoringPageWrapper } from "../components/scoring-page-wrapper";
import { SelectionKnobsView } from "../components/selection-knobs-view";
import { ButtonShowBracket } from "./components/button-show-bracket";
import { MenuDownloadScoresheet } from "./components/menu-download-scoresheet";
import { ScoringTable } from "./components/scoring-table";
import { ScoringTableTeam } from "./components/scoring-table-team";
import { ScoringTableSelection } from "./components/scoring-table-selection";
import IconDownload from "components/ma/icons/mono/download";
import { useDownloadBaganElimination } from "./hooks/download-bagan-elimination";

function PageEventScoringElimination() {
  const { event_id } = useParams();
  const eventId = parseInt(event_id);
  const { data: eventDetail } = useEventDetail(eventId);

  const isSelectionType = eventDetail?.eventCompetition === "Selection";
  const pageProps = { pageTitle: "Skoring Eliminasi", isSelectionType: isSelectionType };

  const {
    isSettled: isSettledCategories,
    isLoading: isLoadingCategories,
    data: categoryDetails,
    errors: errorsCategoryDetail,
  } = useCategoryDetails(eventId);

  const [activeCategory, setActiveCategory] = React.useState(null);
  const isIndividual = activeCategory?.categoryTeam?.toLowerCase?.() === "individual";

  const { download } = useDownloadScoresheetSelection(activeCategory?.id);

  const { download: downloadBagan } = useDownloadBaganElimination(eventId, activeCategory?.id);

  const errorFetchingInitialCategories = !categoryDetails && errorsCategoryDetail;

  if (errorFetchingInitialCategories) {
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

  // TODO: loading ganti ketika belum settle filter, enggak lagi ke fetch detail
  if (!isSettledCategories) {
    return (
      <ScoringPageWrapper {...pageProps}>
        <SpinnerDotBlock />
      </ScoringPageWrapper>
    );
  }

  if (isSelectionType) {
    return (
      <ScoringPageWrapper {...pageProps}>
        <ToolbarFilter
          categories={categoryDetails}
          onChange={(data) => setActiveCategory(data?.categoryDetail)}
          viewLeft={<SelectionKnobsView />}
          viewRight={
            <div>
              <MenuDownloadScoresheet
                buttonLabel="Unduh Scoresheet"
                sessionCount={
                  activeCategory ? Number(activeCategory?.sessionInEliminationSelection) : 0
                }
                onDownload={(session) => {
                  toast.loading("Sedang memproses unduhan...");
                  download(session, {
                    onSuccess() {
                      toast.dismiss();
                      toast.success("Memulai unduhan...");
                    },
                    onError() {
                      toast.dismiss();
                      toast.error("Gagal memulai unduhan");
                    },
                  });
                }}
              />
            </div>
          }
        />

        <ViewWrapper>
          {activeCategory && (
            <ScoringTableSelection
              key={"selection-" + activeCategory?.id}
              categoryDetailId={activeCategory?.id}
              isSelectionType={isSelectionType}
              isLocked={Boolean(!activeCategory || activeCategory?.eliminationLock)}
              eliminationParticipantsCount={activeCategory?.defaultEliminationCount}
            />
          )}
        </ViewWrapper>
      </ScoringPageWrapper>
    );
  }

  return (
    <ScoringPageWrapper {...pageProps}>
      <ToolbarFilter
        categories={categoryDetails}
        isLoading={isLoadingCategories}
        onChange={(data) => setActiveCategory(data?.categoryDetail)}
        viewRight={
          <div key={activeCategory?.id}>
            <ButtonOutlineBlue style={{ marginRight: '10px' }} onClick={() => {
              toast.loading("Sedang memproses unduhan...");
              downloadBagan({
                onSuccess() {
                  toast.dismiss();
                  toast.success("Memulai unduhan...");
                },
                onError() {
                  toast.dismiss();
                  toast.error("Gagal memulai unduhan");
                },
              });
            }}>
              <span>
                <IconDownload size="16" />
              </span>{" "}
              <span>Cetak Bagan</span>
            </ButtonOutlineBlue>
            <ButtonShowBracket
              categoryDetailId={activeCategory?.id}
              eliminationMemberCount={activeCategory?.defaultEliminationCount}
              eventDetail={eventDetail}
            />
          </div>
        }
      >
        {activeCategory &&
          (isIndividual ? (
            <ScoringTable
              key={"elimination-" + activeCategory?.id}
              categoryDetailId={activeCategory?.id}
              categoryDetails={activeCategory}
              eliminationMemberCounts={activeCategory?.defaultEliminationCount}
            />
          ) : (
            <ScoringTableTeam
              key={"elimination-" + activeCategory?.id}
              categoryDetailId={activeCategory?.id}
              categoryDetails={activeCategory}
              eliminationMemberCounts={activeCategory?.defaultEliminationCount}
            />
          ))}
      </ToolbarFilter>
    </ScoringPageWrapper>
  );
}

/* =============================== */
// styles

const ViewWrapper = styled.div`
  padding: 1rem 1.875rem;
  background-color: #ffffff;

  > * + * {
    margin-top: 1.875rem;
  }
`;

export default PageEventScoringElimination;
