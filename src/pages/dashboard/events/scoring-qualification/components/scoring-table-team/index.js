import * as React from "react";
import styled from "styled-components";
import { useScoringMembers } from "../../hooks/scoring-members";

import { SpinnerDotBlock } from "components/ma";
import { EditMember } from "./edit-member";

function ScoringTableTeam({
  categoryDetailId,
  isLocked,
  eliminationParticipantsCount,
  searchName,
  eventDetail
}) {
  // TODO: refaktor param jadi objek konfig
  const {
    data: scoringMembers,
    isLoading: isLoadingScoringMembers,
    isError: isErrorScoringMembers,
    fetchScoringMembers,
  } = useScoringMembers(categoryDetailId, searchName, eliminationParticipantsCount, true); // isTeam === true

  const isSettledScoringMembers =
    Boolean(scoringMembers) || (!scoringMembers && isErrorScoringMembers);

  if (!isSettledScoringMembers) {
    return <SpinnerDotBlock />;
  }

  if (!scoringMembers?.length) {
    return <EmptyMembers>Tidak ada peserta beregu di kategori ini</EmptyMembers>;
  }

  return (
    <TableContainer>
      <div>
        <LoadingBlocker isLoading={isLoadingScoringMembers} />
        <MembersTable className="table table-responsive">
          <thead>
            <tr>
              <th>Peringkat</th>
              <th className="name">Nama Tim</th>
              {!eventDetail.withContingent ? <th className="name">Klub</th> : <th className="name">Kontingen</th>}
              <th className="stats">Total</th>
              <th className="stats">X+10</th>
              <th className="stats">X</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {scoringMembers?.map((row, rowIndex) => (
              <tr key={row.participantId}>
                <td>{rowIndex + 1}</td>

                <td className="name">
                  <div>
                    <TeamNameLabel>{row.team}</TeamNameLabel>
                    {row.teams?.length ? (
                      <MembersList>
                        {row.teams?.map((teamMember, index) => (
                          <MemberItem
                            key={index}
                            participantId={row.participantId}
                            categoryId={categoryDetailId}
                            teamName={row.team}
                            teamMember={teamMember}
                            isLocked={isLocked}
                            onSuccess={fetchScoringMembers}
                          />
                        ))}
                      </MembersList>
                    ) : (
                      <span>Belum ada anggota</span>
                    )}
                  </div>
                </td>

                {!eventDetail.withContingent ?
                  <td className="name">
                    <ClubName>{row.clubName || "Club On"}</ClubName>
                  </td>
                :
                  <td className="name"> {row.cityName || "City On"}</td>
                }
                <td className="stats">{row.total || 0}</td>
                <td className="stats">{row.totalXPlusTen || 0}</td>
                <td className="stats">{row.totalX || 0}</td>
              </tr>
            ))}
          </tbody>
        </MembersTable>
      </div>
    </TableContainer>
  );
}

function MemberItem({ participantId, categoryId, teamName, teamMember, isLocked, onSuccess }) {
  return (
    <li>
      <MemberItemWrapper>
        <span>{teamMember.name}</span>
        {isLocked && (
          <span>
            <EditMember
              participantId={participantId}
              categoryId={categoryId}
              teamName={teamName}
              teamMember={teamMember}
              onSuccess={onSuccess}
            />
          </span>
        )}
      </MemberItemWrapper>
    </li>
  );
}

function ClubName({ children, clubName }) {
  if (!children && !clubName) {
    return <GrayedOutText>&ndash;</GrayedOutText>;
  }
  return children || clubName;
}

function LoadingBlocker({ isLoading = true }) {
  if (!isLoading) {
    return null;
  }
  return (
    <LoadingContainer>
      <SpinnerDotBlock />
    </LoadingContainer>
  );
}

/* =============================== */
// styles

const GrayedOutText = styled.span`
  color: var(--ma-gray-400);
`;

const EmptyMembers = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 12rem;
  border: solid 1px var(--ma-gray-50);
  border-radius: 0.5rem;
  color: var(--ma-gray-400);
  font-weight: 600;
`;

const TableContainer = styled.div`
  position: relative;
  display: flex;

  > *:first-child {
    flex-grow: 1;
  }

  > *:last-child {
    flex-shrink: 0;
  }
`;

const MembersTable = styled.table`
  text-align: center;

  thead {
    background-color: var(--ma-primary-blue-50);

    th {
      color: var(--ma-txt-black);
      font-weight: 600;

      &.name {
        text-align: left;
      }

      &.stats {
        text-align: right;
      }
    }
  }

  tbody td {
    padding: 0.25rem 0.25rem;
    vertical-align: middle;

    &.name {
      text-align: left;
    }

    &.stats {
      text-align: right;
    }
  }

  th,
  td {
    cursor: auto;
  }
`;

const TeamNameLabel = styled.span`
  display: block;
  font-weight: 600;
  text-align: left;
`;

const MembersList = styled.ol`
  margin: 0;
  margin-top: 0.5rem;
  padding-left: 1rem;
  text-align: left;
  font-size: 0.625rem;
`;

const MemberItemWrapper = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const LoadingContainer = styled.div`
  position: absolute;
  z-index: 100;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.6);
`;

export { ScoringTableTeam };
