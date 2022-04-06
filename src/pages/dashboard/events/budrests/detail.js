import * as React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useRouteQueryParams } from "./hooks/route-params";
import { useMemberBudrests } from "./hooks/member-budrests";
import { useSearchMemberBudrests } from "./hooks/search-member-budrest";

import { ButtonBlue, ButtonOutlineBlue } from "components/ma";
import { SubNavbar } from "../components/submenus-settings";
import { ContentLayoutWrapper } from "./components/content-layout-wrapper";
import { ListMemberBudrestsByCategory } from "./components/list-member-budrest-by-category";
import { SearchBox } from "./components/search-box";

import { datetime } from "utils";

function PageEventBudRestDetail() {
  const { eventId, date: dateFromParam } = useRouteQueryParams();

  const { data: memberBudrests, isLoading: isLoadingMemberBudrests } = useMemberBudrests(
    eventId,
    dateFromParam
  );

  const {
    searchKeyword,
    setSearchKeyword,
    searchResults: searchResultsByName,
  } = useSearchMemberBudrests(memberBudrests);

  // Fallback ke data awal kalau belum ada search karena datanya
  // masih `null` meskipun loading API sudah selesai, bisa crash.
  const memberBudrestsData = searchResultsByName || memberBudrests;

  if (!dateFromParam) {
    return (
      <ContentLayoutWrapper
        pageTitle="Pengaturan Bantalan"
        navbar={<SubNavbar eventId={eventId} />}
      >
        <CardSheet>
          <VerticalSpacedBox>
            <div>
              Tanggal bertanding tidak valid. Silakan terapkan pengaturan bantalan lebih dulu.
            </div>
            <div>
              <ButtonOutlineBlue as={Link} to={`/dashboard/event/${eventId}/budrests`}>
                Ke pengaturan bantalan
              </ButtonOutlineBlue>
            </div>
          </VerticalSpacedBox>
        </CardSheet>
      </ContentLayoutWrapper>
    );
  }

  if (!memberBudrests && isLoadingMemberBudrests) {
    return (
      <ContentLayoutWrapper
        pageTitle="Pengaturan Bantalan"
        navbar={<SubNavbar eventId={eventId} />}
      >
        <CardSheet>Sedang menyiapkan data nomor bantalan...</CardSheet>
      </ContentLayoutWrapper>
    );
  }

  if (!memberBudrests) {
    return (
      <ContentLayoutWrapper
        pageTitle="Pengaturan Bantalan"
        navbar={<SubNavbar eventId={eventId} />}
      >
        <CardSheet>
          <VerticalSpacedBox>
            <div>Data tidak tersedia.</div>
            <div>
              <ButtonOutlineBlue as={Link} to={`/dashboard/event/${eventId}/budrests`}>
                Ke pengaturan bantalan
              </ButtonOutlineBlue>
            </div>
          </VerticalSpacedBox>
        </CardSheet>
      </ContentLayoutWrapper>
    );
  }

  const dateLabel = datetime.formatFullDateLabel(memberBudrests.date);

  return (
    <ContentLayoutWrapper pageTitle="Pengaturan Bantalan" navbar={<SubNavbar eventId={eventId} />}>
      <CardSheet>
        <VerticalSpacedBox>
          <SpacedHeader>
            <div>
              <h5>Data Peserta</h5>
              <h6 className="fw-bold">{dateLabel}</h6>
            </div>

            <div>
              <ButtonBlue as={Link} to={`/dashboard/event/${eventId}/budrests`}>
                Selesai
              </ButtonBlue>
            </div>
          </SpacedHeader>

          <SearchBox
            placeholder="Cari peserta"
            value={searchKeyword}
            onChange={(ev) => setSearchKeyword(ev.target.value)}
          />

          <VerticalSpacedBoxLoose>
            {memberBudrestsData.groups.length ? (
              memberBudrestsData.groups.map((group) => (
                <ListMemberBudrestsByCategory
                  key={group.id}
                  group={group}
                  budrestList={memberBudrestsData.budrestsByCategory[group.id]}
                />
              ))
            ) : (
              <div>
                Data tidak ditemukan.
                <br />
                TODO: styling
              </div>
            )}
          </VerticalSpacedBoxLoose>
        </VerticalSpacedBox>
      </CardSheet>
    </ContentLayoutWrapper>
  );
}

const CardSheet = styled.div`
  position: relative;
  margin-bottom: 24px;

  padding: 35px;
  border: 0 solid #f6f6f6;
  border-radius: 8px;
  background-color: #ffffff;
  background-clip: border-box;
  box-shadow: 0 0.75rem 1.5rem rgb(18 38 63 / 3%);
`;

const VerticalSpacedBox = styled.div`
  > * + * {
    margin-top: 1.5rem;
  }
`;

const VerticalSpacedBoxLoose = styled.div`
  > * + * {
    margin-top: 3rem;
  }
`;

const SpacedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  > *:nth-child(1) {
    flex-grow: 1;
  }

  > *:nth-child(2) {
    flex-shrink: 0;
  }
`;

export default PageEventBudRestDetail;
