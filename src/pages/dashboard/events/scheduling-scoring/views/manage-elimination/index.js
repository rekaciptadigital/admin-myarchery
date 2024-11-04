import * as React from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import queryString from "query-string";
import { useCategoriesElimination } from "./hooks/event-categories-elimination";

import { ButtonOutlineBlue } from "components/ma";
import { FolderPanel } from "../../components";
import { FieldSelectCategory } from "./field-select-category";

function StepManageElimination() {
  const { event_id } = useParams();
  const eventId = parseInt(event_id);
  const location = useLocation();
  const { menu, teamCategoryId } = queryString.parse(location.search);
  const history = useNavigate();

  const { data: categories, groupNames } = useCategoriesElimination(eventId);
  const tabsList = makeTeamCategoriesFilters(groupNames);

  const [currentFilter, setCurrentFilter] = React.useState(null);
  const currentCategories = categories?.[currentFilter?.value];

  React.useEffect(() => {
    const selectedFilter = teamCategoryId
      ? tabsList.find((filter) => filter.value === teamCategoryId)
      : tabsList[0];
    setCurrentFilter(selectedFilter);
  }, [categories]);

  React.useEffect(() => {
    if (!currentFilter) {
      return;
    }

    const makeURLWithParams = (location, selectedTeamCategoryId) => {
      return `${location.pathname}?menu=${menu}&teamCategoryId=${selectedTeamCategoryId}`;
    };
    const URLWithParams = makeURLWithParams(location, currentFilter.value);
    history.replace(URLWithParams);
  }, [currentFilter]);

  return (
    <FolderPanel>
      <GroupHeader>
        <HeaderTitle>
          <h3>Eliminasi</h3>
          <div>Atur skor tiap kategori</div>
        </HeaderTitle>

        <HeaderActions>
          <FieldSelectCategory
            options={tabsList}
            value={currentFilter}
            onChange={(option) => setCurrentFilter(option)}
          >
            Kategori Tim
          </FieldSelectCategory>
        </HeaderActions>
      </GroupHeader>

      <table className="table table-responsive">
        <thead>
          <tr>
            <THCateg>Kategori</THCateg>
            <THCateg>Kelas</THCateg>
            <THCateg>Jenis Regu</THCateg>
            <THCateg>Jarak</THCateg>
            <THCateg>Peserta</THCateg>
            <THCateg>&nbsp;</THCateg>
          </tr>
        </thead>

        {currentCategories && (
          <tbody>
            {currentCategories.map((category) => (
              <tr key={category.id}>
                <TDCateg>{category.competitionCategoryId}</TDCateg>
                <TDCateg>{category.ageCategoryId}</TDCateg>
                <TDCateg style={{ width: 135 }}>{category.teamCategoryDetail.label}</TDCateg>
                <TDCateg className="text-lowercase">{category.distanceId}m</TDCateg>
                <TDCateg>{category.totalParticipant}</TDCateg>
                <TDCategAction>
                  <ButtonOutlineBlue
                    as={Link}
                    to={{
                      pathname: `/dashboard/event/${eventId}/scheduling-scoring/elimination`,
                      state: {
                        from: `${location.pathname}${location.search}`,
                        category: category,
                      },
                    }}
                  >
                    Atur
                  </ButtonOutlineBlue>
                </TDCategAction>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </FolderPanel>
  );
}

const GroupHeader = styled.div`
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
`;

const HeaderTitle = styled.div`
  flex: 1 0 5rem;

  > * + * {
    margin-top: 0.5rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;

  > * {
    width: 20rem;
  }
`;

const THCateg = styled.th`
  text-transform: uppercase;
`;

const TDCateg = styled.td`
  text-transform: capitalize;
`;

const TDCategAction = styled.td`
  text-align: right;
`;

// utils
function makeTeamCategoriesFilters(groupNames) {
  if (!groupNames) {
    return [];
  }

  const teamCategoryOptions = {
    "individu male": { name: "Individu Putra", type: "individu" },
    "individu female": { name: "Individu Putri", type: "individu" },
    maleTeam: { name: "Beregu Putra", type: "team" },
    femaleTeam: { name: "Beregu Putri", type: "team" },
    mixTeam: { name: "Beregu Campuran", type: "team" },
  };

  const filterOptions = groupNames.map((teamCategId) => ({
    value: teamCategId,
    label: teamCategoryOptions[teamCategId].name,
    type: teamCategoryOptions[teamCategId].type,
  }));

  return filterOptions;
}

export { StepManageElimination };
