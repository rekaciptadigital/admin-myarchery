import * as React from "react";
import styled from "styled-components";
import { MetaTags } from "react-meta-tags";
// import { SearchBox } from "./components/search-box";

import { EventsService } from "services";
import { useParams } from "react-router-dom";
import { Container, Col, Row } from "reactstrap";
import { SubNavbar } from "../components/submenus-settings";
import { OfficialTable } from "./components/list-official";
import { ProcessingToast } from "./components/processing-toast";
import { ButtonDownloadIDCard } from "./components/button-download-id-card";
import { useOfficialMembers } from "./hooks/official-members";

const filterPayment = [
  { value: '1', label: 'Lunas'},
  { value: '2', label: 'Expired'},
  { value: '3', label: 'Failed'},
  { value: '4', label: 'Pending'},
];

function PageEventOfficial() {
  const [eventDetail, setEventDetail] = React.useState(null);

  const { event_id } = useParams();
  const eventId = event_id;

  // const [inputSearchQuery, setInputSearchQuery] = React.useState("");
  const [filter, setFilter] = React.useState(1);

  const {
    data: officialMembers
  } = useOfficialMembers(eventId, filter);

  React.useEffect(() => {
    const getEventDetail = async () => {
      const result = await EventsService.getEventDetailById({ id: event_id });
      if (result.success) {
        setEventDetail(result.data);
      }
    };

    getEventDetail();
  }, []);

  return (
    <React.Fragment>
        <SubNavbar eventId={event_id} />

        <MetaTags>
                <title>Dashboard | Official</title>
        </MetaTags>

        <ProcessingToast />
        <Container fluid>
        <ViewWrapper>
          <ToolbarTop>
            <FilterBars>
              <CategoryFilter>
                <FilterLabel>Status:</FilterLabel>
                <FilterList>
                  {filterPayment?.length > 0 ? (
                    filterPayment.map((option) => (
                      <li key={option.value}>
                        <FilterItemButton
                          onClick={() => {
                            setFilter(option.value);
                          }}
                        >
                          {option.label}
                        </FilterItemButton>
                      </li>
                    ))
                  ) : (
                    <li>Tidak tersedia filter kelas</li>
                  )}
                </FilterList>
              </CategoryFilter>
              </FilterBars>
              </ToolbarTop>

            <ToolbarRight>
                <HorizontalSpaced>
                    <Row>
                        <Col md={8}>
                            <OfficialLabel>
                                {officialMembers?.member?.length} Pendaftar
                            </OfficialLabel>
                        </Col>
                        <Col md={4}>
                            {/* <PushBottom>
                                <SearchBox
                                placeholder="Cari peserta"
                                value={inputSearchQuery}
                                onChange={(ev) => setInputSearchQuery(ev.target.value)}
                                />
                            </PushBottom> */}
                            <PushRight>
                              <ButtonDownloadIDCard />
                            </PushRight>
                        </Col>
                    </Row>

                </HorizontalSpaced>
            </ToolbarRight>

            <OfficialTable
              eventDetail={eventDetail}
              officialMembers={officialMembers}
            />
             </ViewWrapper>
        </Container>
    </React.Fragment>
  )
}

const HorizontalSpaced = styled.div`
  display: flex;
  gap: 0.5rem;

  > * {
    flex-grow: 1;
  }
`;

const ToolbarRight = styled.div`
  > * + * {
    margin-top: 0.75rem;
  }
`;

const OfficialLabel = styled.div`
margin-top: 5px;
justify-content: flex-end;
color: #757575;
  font-weight: 600;
  font-size: 16px;
`;

// const PushBottom = styled.div`
//   align-self: flex-end;
// `;

const ViewWrapper = styled.div`
  padding: 1.875rem;
  background-color: #ffffff;

  > * + * {
    margin-top: 1.875rem;
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
const CategoryFilter = styled.div`
  display: flex;
  align-items: center;

  > *:nth-child(1) {
    flex-shrink: 0;
    min-width: 6.25rem;
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

const PushRight = styled.div`
  margin: 0.75rem 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 0.5rem;
`;

export default PageEventOfficial