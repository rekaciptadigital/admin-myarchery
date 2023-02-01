import * as React from "react";
import { MetaTags } from "react-meta-tags";
import styled from "styled-components";
import { useParams, useLocation } from "react-router-dom";
import { EventsService } from "services";
import { useCategoryDetails } from "./hooks/category-details";
import { useCategoriesWithFilters } from "./hooks/category-filters";
import { useMemberDownload } from "./hooks/member-download";
import { BreadcrumbDashboard } from "../events/components/breadcrumb";

import { SpinnerDotBlock, ButtonBlue, AlertSubmitError } from "components/ma";
import { ContentLayoutWrapper } from "./components/content-layout-wrapper";
import { MemberTable } from "./components/member-table";
import { ProcessingToast, toast } from "./components/processing-toast";

import IconDownload from "components/ma/icons/mono/download";

import classnames from "classnames";
import { Container } from "reactstrap";

function PageDosQualification() {
  const [eventDetail, setEventDetail] = React.useState(null);

  const { event_id } = useParams();
  const { search } = useLocation();

  const eventId = parseInt(event_id);
  const type = new URLSearchParams(search).get("type");
  const isTeam = type === "team";

  const {
    data: categoryDetails,
    errors: errorsCategoryDetail,
    isSettled: isSettledCategories,
  } = useCategoryDetails(eventId);

  const {
    activeCategoryDetail,
    activePaymentStatus,
    optionsCompetitionCategory,
    optionsAgeCategory,
    optionsGenderCategory,
    optionsPaymentStatus,
    selectOptionCompetitionCategory,
    selectOptionAgeCategory,
    selectOptionGenderCategory,
    selectOptionPaymentStatus,
  } = useCategoriesWithFilters({ eventCategories: categoryDetails, isTeam: isTeam });

  const [inputSearchQuery, setInputSearchQuery] = React.useState("");

  const {
    handleDownloadIdCard,
    isError: isErrorDownloadID,
    errors: errorsDownloadID,
  } = useMemberDownload(activeCategoryDetail?.categoryDetailId, eventId);

  const resetOnChangeCategory = () => {
    setInputSearchQuery("");
  };

  React.useEffect(() => {
    const getEventDetail = async () => {
      const result = await EventsService.getEventDetailById({ id: event_id });
      if (result.success) {
        setEventDetail(result.data);
      }
    };

    getEventDetail();
  }, []);

  const contentTitle = "Peserta" + (type ? (isTeam ? " Beregu" : " Individu") : "");
  const pageTitle = contentTitle + " | MyArchery.id";
  const errorFetchingInitialCategories = !categoryDetails && errorsCategoryDetail;

  if (errorFetchingInitialCategories) {
    return (
      <ContentLayoutWrapper pageTitle={pageTitle}>
        <ViewWrapper>
          <p>
            Terdapat kendala dalam mengambil data. Lihat detail berikut untuk melihat informasi
            teknis lebih lanjut:
          </p>

          <pre>{JSON.stringify(errorsCategoryDetail)}</pre>
        </ViewWrapper>
      </ContentLayoutWrapper>
    );
  }

  if (!isSettledCategories) {
    return (
      <ContentLayoutWrapper pageTitle={pageTitle}>
        <SpinnerDotBlock />
      </ContentLayoutWrapper>
    );
  }

  return (
    <React.Fragment>
      <div>
        <MetaTags>
          <title>{pageTitle}</title>
        </MetaTags>

        <Container fluid>
          <BreadcrumbDashboard to={`/dashboard/event/${event_id}/home`}>
            {contentTitle}
          </BreadcrumbDashboard>
          <ProcessingToast />

          <TabBar>
            <TabButtonList>
              {optionsCompetitionCategory.map((option) => (
                <li key={option.competitionCategory}>
                  <TabButton
                    className={classnames({ "tab-active": option.isActive })}
                    onClick={() => {
                      resetOnChangeCategory();
                      selectOptionCompetitionCategory(option.competitionCategory);
                    }}
                  >
                    {option.competitionCategory}
                  </TabButton>
                </li>
              ))}
            </TabButtonList>
          </TabBar>

          <ViewWrapper>
            <ToolbarTop>
              <FilterBars>
                <CategoryFilter>
                  <FilterLabel>Kelas:</FilterLabel>
                  <FilterList>
                    {optionsAgeCategory?.length > 0 ? (
                      optionsAgeCategory.map((option) => (
                        <li key={option.ageCategory}>
                          <FilterItemButton
                            className={classnames({ "filter-item-active": option.isActive })}
                            onClick={() => {
                              resetOnChangeCategory();
                              selectOptionAgeCategory(option.ageCategory);
                            }}
                          >
                            {option.ageCategory}
                          </FilterItemButton>
                        </li>
                      ))
                    ) : (
                      <li>Tidak tersedia filter kelas</li>
                    )}
                  </FilterList>
                </CategoryFilter>

                <CategoryFilter>
                  <FilterLabel>Jenis Regu:</FilterLabel>
                  <FilterList>
                    {optionsGenderCategory?.length > 0 ? (
                      optionsGenderCategory.map((option) => (
                        <li key={option.genderCategory}>
                          <FilterItemButton
                            className={classnames({ "filter-item-active": option.isActive })}
                            onClick={() => {
                              resetOnChangeCategory();
                              selectOptionGenderCategory(option.genderCategory);
                            }}
                          >
                            {option.genderCategoryLabel}
                          </FilterItemButton>
                        </li>
                      ))
                    ) : (
                      <li>Tidak tersedia filter jenis regu</li>
                    )}
                  </FilterList>
                </CategoryFilter>

                <CategoryFilter>
                  <FilterLabel>Status Pembayaran:</FilterLabel>
                  <FilterList>
                    {optionsPaymentStatus?.length > 0 ? (
                      optionsPaymentStatus.map((option) => (
                        <li key={option.status}>
                          <FilterItemButton
                            className={classnames({ "filter-item-active": option.isActive })}
                            onClick={() => {
                              selectOptionPaymentStatus(option.status);
                            }}
                          >
                            {option.label}
                          </FilterItemButton>
                        </li>
                      ))
                    ) : (
                      <li>Tidak tersedia filter status pembayaran</li>
                    )}
                  </FilterList>
                </CategoryFilter>
              </FilterBars>

              {!isTeam && (
                <ToolbarRight>
                  <HorizontalSpaced>
                    <ButtonBlue
                      onClick={() => {
                        toast.loading("Sedang menyiapkan dokumen ID card...");
                        handleDownloadIdCard({
                          onSuccess() {
                            toast.dismiss();
                            toast.success("ID card siap diunduh");
                          },
                          onError() {
                            toast.dismiss();
                            toast.error("Gagal mengunduh ID card");
                          },
                        });
                      }}
                    >
                      <span>
                        <IconDownload size="16" />
                      </span>{" "}
                      <span>Unduh ID Card</span>
                    </ButtonBlue>
                    <AlertSubmitError isError={isErrorDownloadID} errors={errorsDownloadID} />
                  </HorizontalSpaced>
                </ToolbarRight>
              )}
            </ToolbarTop>

            <MemberTable
              key={activeCategoryDetail?.categoryDetailId}
              isTeam={isTeam}
              eventId={event_id}
              categoryDetail={activeCategoryDetail}
              searchName={inputSearchQuery}
              paymentStatus={activePaymentStatus}
              eventDetail={eventDetail}
            />
          </ViewWrapper>
        </Container>
      </div>
    </React.Fragment>
  );
}

/* =============================== */
// styles

const ViewWrapper = styled.div`
  padding: 1.875rem;
  background-color: #ffffff;

  > * + * {
    margin-top: 1.875rem;
  }
`;

const TabBar = styled.div`
  margin-bottom: 0.25rem;
  background-color: #ffffff;
`;

const TabButtonList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;

  > * {
    flex-grow: 1;
  }
`;

const TabButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: none;
  background-color: #ffffff;
  color: var(--ma-blue);
  font-weight: 500;

  position: relative;

  &::after {
    content: " ";
    display: block;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    height: 5px;

    transform: scaleX(0);
    transition: all 0.2s;
  }

  &:hover {
    &::after {
      background-color: var(--ma-yellow);
      transform: scaleX(1);
    }
  }

  &.tab-active {
    &::after {
      background-color: var(--ma-yellow);
      transform: scaleX(1);
    }
  }
`;

const ToolbarTop = styled.div`
  display: flex;
  gap: 1.5rem;

  > *:nth-child(1) {
    flex-grow: 1;
  }

  > *:nth-child(2) {
    flex-shrink: 0;
    margin-top: auto;
  }
`;

const FilterBars = styled.div`
  > * + * {
    margin-top: 1.5rem;
  }
`;

const ToolbarRight = styled.div`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const HorizontalSpaced = styled.div`
  display: flex;
  gap: 0.5rem;

  > * {
    flex-grow: 1;
  }
`;

const CategoryFilter = styled.div`
  display: flex;
  align-items: center;

  > *:nth-child(1) {
    flex-shrink: 0;
    width: 7.5rem;
  }

  > *:nth-child(2) {
    flex-grow: 1;
  }
`;

const FilterLabel = styled.div`
  color: var(--ma-txt-black);
  font-weight: 600;
`;

const FilterList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterItemButton = styled.button`
  transition: all 0.15s;

  &,
  &:active,
  &:focus,
  &:focus-visible {
    padding: 0.5rem 0.75rem;
    border: solid 1px var(--ma-blue-400);
    border-radius: 0.5rem;
    background-color: transparent;

    color: var(--ma-blue-400);
    font-weight: 600;

    &.filter-item-active {
      background-color: var(--ma-primary-blue-50);
      border-color: var(--ma-blue);
      box-shadow: 0 0 0 1px var(--ma-blue);
      color: var(--ma-blue);
    }
  }

  &:hover {
    background-color: var(--ma-primary-blue-50);
  }
`;

export default PageDosQualification;
