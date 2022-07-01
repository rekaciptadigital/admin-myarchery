import * as React from "react";
import styled from "styled-components";
import { useDisplaySettings } from "../contexts/display-settings";
import { useBracketTemplate } from "../hooks/bracket-template";

import { LoadingFullPage } from "./loading-fullpage";

import IconTrophyBlue from "components/ma/icons/fill/trophy-blue";
import IconTrophyNetral from "components/ma/icons/fill/trophy-netral";
import IconTrophyWin from "components/ma/icons/fill/trophy-win";
import IconLoading from "./icon-loading";

import classnames from "classnames";

function ScoringElimination() {
  const { activeCategoryDetail } = useDisplaySettings();
  const teamType = activeCategoryDetail?.categoryTeam?.toLowerCase?.();
  const { data, isLoading, isFetching } = useBracketTemplate({
    categoryId: activeCategoryDetail.id,
    shouldPoll: true,
  });
  // const [checkingSession, setCheckingSession] = React.useState(true);

  const hasData = Boolean(data);
  const isIndividual = teamType === "individual";
  const isTeam = teamType === "team";

  // Nge-skip yang gak ada datanya
  // TODO: pastikan dulu perlu skip di bagan yang belum ditentukan apa enggak
  // React.useEffect(() => {
  //   const noRoundData = data && !data.rounds[0].seeds.every(seed);
  //   if (noRoundData) {
  //     next();
  //   } else {
  //     setCheckingSession(false);
  //   }
  // }, [data]);

  if (isLoading) {
    return (
      <SectionTableContainer>
        <ScoringEmptyBar>
          <SpinningLoader>
            <IconLoading />
          </SpinningLoader>
        </ScoringEmptyBar>
      </SectionTableContainer>
    );
  }

  const selectedTab = 0;
  const currentRows = data?.rounds[selectedTab]?.seeds || [];

  if (isIndividual) {
    return (
      <AutoScrollingContainer shouldStart={hasData}>
        <SectionTableContainer>
          <LoadingFullPage isLoading={isFetching} />

          <MembersTable className="table table-responsive">
            <thead>
              <tr>
                <th className="text-start">
                  <MedalWrapper>
                    <IconTrophyBlue size="52" />
                  </MedalWrapper>
                </th>
                <th className="text-start">Nama</th>
                <th>{_getScoreLabel(activeCategoryDetail)}</th>
                <th className="text-start">Nama</th>
                <th className="text-end">
                  <MedalWrapper>
                    <IconTrophyBlue size="52" />
                  </MedalWrapper>
                </th>
              </tr>
            </thead>

            <tbody key={selectedTab}>
              {currentRows.map((row, index) => {
                const player1 = row.teams[0];
                const player2 = row.teams[1];

                const roundNumber = selectedTab + 1;

                const isBye =
                  row.teams.some((team) => team.status === "bye") ||
                  (roundNumber === 1 && row.teams.every((team) => !team.name));
                const noData = !player1?.name || !player2?.name;

                return (
                  <tr key={index}>
                    <td className="text-start">
                      <MedalWrapper>
                        {data.eliminationId && player1.win ? (
                          <IconTrophyWin size="52" />
                        ) : (
                          <IconTrophyNetral size="52" />
                        )}
                      </MedalWrapper>
                    </td>

                    <td width="40%">
                      <PlayerLabelContainerLeft>
                        <PlayerNameData>
                          <NameLabel>{player1?.name || <NoArcherLabel isBye={isBye} />}</NameLabel>
                        </PlayerNameData>
                      </PlayerLabelContainerLeft>
                    </td>

                    <td>
                      {!noData && (
                        <HeadToHeadScoreLabels>
                          <ScoreTotalLabel
                            className={classnames({
                              "score-label-higher":
                                player1?.status === "win" ||
                                player1?.adminTotal > player2?.adminTotal,
                            })}
                          >
                            {player1?.adminTotal || 0}
                          </ScoreTotalLabel>

                          <ScoreTotalLabel
                            className={classnames({
                              "score-label-higher":
                                player2?.status === "win" ||
                                player2?.adminTotal > player1?.adminTotal,
                            })}
                          >
                            {player2?.adminTotal || 0}
                          </ScoreTotalLabel>
                        </HeadToHeadScoreLabels>
                      )}
                    </td>

                    <td width="40%">
                      <PlayerLabelContainerRight>
                        <PlayerNameData>
                          <NameLabel>{player2?.name || <NoArcherLabel isBye={isBye} />}</NameLabel>
                        </PlayerNameData>
                      </PlayerLabelContainerRight>
                    </td>

                    <td className="text-end">
                      <MedalWrapper>
                        {data.eliminationId && player2.win ? (
                          <IconTrophyWin size="52" />
                        ) : (
                          <IconTrophyNetral size="52" />
                        )}
                      </MedalWrapper>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </MembersTable>
        </SectionTableContainer>
      </AutoScrollingContainer>
    );
  }

  if (isTeam) {
    return (
      <AutoScrollingContainer shouldStart={hasData}>
        <SectionTableContainer>
          <LoadingFullPage isLoading={isFetching} />

          <MembersTable className="table table-responsive">
            <thead>
              <tr>
                <th className="text-start">
                  <MedalWrapper>
                    <IconTrophyBlue size="52" />
                  </MedalWrapper>
                </th>
                <th className="text-start">Tim</th>
                <th>{_getScoreLabel(activeCategoryDetail)}</th>
                <th className="text-start">Tim</th>
                <th className="text-end">
                  <MedalWrapper>
                    <IconTrophyBlue size="52" />
                  </MedalWrapper>
                </th>
              </tr>
            </thead>

            <tbody key={selectedTab}>
              {currentRows.map((row, index) => {
                const team1 = row.teams[0];
                const team2 = row.teams[1];

                const roundNumber = selectedTab + 1;

                const isBye =
                  row.teams.some((team) => team.status === "bye") ||
                  (roundNumber === 1 && row.teams.every((team) => !team.teamName));
                const noData =
                  !team1?.teamName ||
                  !team2?.teamName ||
                  !team1?.memberTeam?.length ||
                  !team2?.memberTeam?.length;

                return (
                  <tr key={index}>
                    <td className="text-start">
                      <MedalWrapper>
                        {data.eliminationId && team1.win ? (
                          <IconTrophyWin size="52" />
                        ) : (
                          <IconTrophyNetral size="52" />
                        )}
                      </MedalWrapper>
                    </td>

                    <td width="40%">
                      <PlayerLabelContainerLeft>
                        <PlayerNameData>
                          <TeamMembersBlock>
                            <TeamNameLabel>
                              {team1?.teamName || <NoArcherTeamLabel isBye={isBye} />}
                            </TeamNameLabel>
                            {team1?.memberTeam?.length ? (
                              <MembersList>
                                {team1.memberTeam.map((member) => (
                                  <li key={member.memberId}>{member.name}</li>
                                ))}
                              </MembersList>
                            ) : (
                              team1?.teamName &&
                              !isBye && <EmptyMembers>Belum ada data peserta anggota</EmptyMembers>
                            )}
                          </TeamMembersBlock>
                        </PlayerNameData>
                      </PlayerLabelContainerLeft>
                    </td>

                    <td>
                      {!noData && (
                        <HeadToHeadScoreLabels>
                          <ScoreTotalLabel
                            className={classnames({
                              "score-label-higher":
                                team1?.status === "win" || team1?.adminTotal > team2?.adminTotal,
                            })}
                          >
                            {team1?.adminTotal || 0}
                          </ScoreTotalLabel>

                          <ScoreTotalLabel
                            className={classnames({
                              "score-label-higher":
                                team2?.status === "win" || team2?.adminTotal > team1?.adminTotal,
                            })}
                          >
                            {team2?.adminTotal || 0}
                          </ScoreTotalLabel>
                        </HeadToHeadScoreLabels>
                      )}
                    </td>

                    <td width="40%">
                      <PlayerLabelContainerRight>
                        <PlayerNameData>
                          <TeamMembersBlock>
                            <TeamNameLabel>
                              {team2?.teamName || <NoArcherTeamLabel isBye={isBye} />}
                            </TeamNameLabel>
                            {team2?.memberTeam?.length ? (
                              <MembersList>
                                {team2.memberTeam.map((member) => (
                                  <li key={member.memberId}>{member.name}</li>
                                ))}
                              </MembersList>
                            ) : (
                              team2?.teamName &&
                              !isBye && <EmptyMembers>Belum ada data peserta anggota</EmptyMembers>
                            )}
                          </TeamMembersBlock>
                        </PlayerNameData>
                      </PlayerLabelContainerRight>
                    </td>

                    <td className="text-end">
                      <MedalWrapper>
                        {data.eliminationGroupId && team2.win ? (
                          <IconTrophyWin size="52" />
                        ) : (
                          <IconTrophyNetral size="52" />
                        )}
                      </MedalWrapper>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </MembersTable>
        </SectionTableContainer>
      </AutoScrollingContainer>
    );
  }

  return (
    <SectionTableContainer>
      <ScoringEmptyBar>Error</ScoringEmptyBar>
    </SectionTableContainer>
  );
}

function AutoScrollingContainer({ children, shouldStart, deltaY = 2 }) {
  const scrollContainerRef = React.useRef(null);
  const direction = React.useRef(1);
  const [timerDone, setTimerDone] = React.useState(false);
  const [scrollDone, setScrollDone] = React.useState(false);
  const { next } = useDisplaySettings();

  // Timer untuk tabel yang isinya sedikit
  // set 5 detik
  React.useEffect(() => {
    if (!shouldStart) {
      return;
    }
    const timer = setTimeout(() => {
      setTimerDone(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [shouldStart]);

  // Eksekusi auto switch kategori
  React.useEffect(() => {
    if (!shouldStart || !timerDone || !scrollDone) {
      return;
    }
    next();
  }, [shouldStart, timerDone, scrollDone]);

  // Auto scrolling bolak-balik bawah-atas
  React.useEffect(() => {
    if (!shouldStart) {
      return;
    }

    const timer = setInterval(() => {
      if (!scrollContainerRef.current) {
        return;
      }

      const container = scrollContainerRef.current;
      direction.current *= _getDirection(container);
      container.scrollTop += direction.current * deltaY;

      if (!_checkIsFinish(container, direction.current)) {
        return;
      }
      setScrollDone(true);
    }, 50);

    return () => clearInterval(timer);
  }, [shouldStart]);

  return <div ref={scrollContainerRef}>{children}</div>;
}

function _checkIsFinish(container, direction) {
  return direction === -1 && container.scrollTop === 0;
}

function NoArcherLabel({ isBye }) {
  if (isBye) {
    return <NoArcherWrapper>&#171; bye &#187;</NoArcherWrapper>;
  }
  return <NoArcherWrapper>&#171; Belum ada archer &#187;</NoArcherWrapper>;
}

function NoArcherTeamLabel({ isBye }) {
  if (isBye) {
    return <NoArcherWrapper>&#171; bye &#187;</NoArcherWrapper>;
  }
  return <NoArcherWrapper>&#171; Belum ada tim &#187;</NoArcherWrapper>;
}

/* ========================== */
// styles

const SectionTableContainer = styled.div`
  position: relative;
`;

const ScoringEmptyBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 30rem;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  background-color: #ffffff;
  color: var(--ma-blue);
`;

const SpinningLoader = styled.span`
  display: inline-block;
  animation: spin-loading 0.7s infinite linear;

  @keyframes spin-loading {
    0% {
      transform: rotateZ(0deg);
    }

    100% {
      transform: rotateZ(360deg);
    }
  }
`;

const MembersTable = styled.table`
  --indicator-space-margin: 3rem;
  font-size: 1.75rem;
  text-align: center;

  thead {
    position: sticky;
    top: 0;
    z-index: 20;
  }

  thead {
    background-color: var(--ma-primary-blue-50);

    th {
      padding-top: 1.125rem;
      padding-bottom: 1.125rem;
      color: var(--ma-txt-black);
      font-weight: 600;
    }
  }

  tbody tr:nth-child(even) {
    background-color: var(--ma-gray-100);
  }

  thead th,
  tbody td {
    vertical-align: middle;
  }

  th,
  td {
    cursor: auto;
  }
`;

const MedalWrapper = styled.span`
  margin: 0 1.5rem;
`;

const PlayerLabelContainerLeft = styled.div`
  margin-right: var(--indicator-space-margin);
`;

const PlayerLabelContainerRight = styled.div`
  margin-left: var(--indicator-space-margin);
`;

const PlayerNameData = styled.div`
  min-height: 9rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const NameLabel = styled.div`
  font-weight: 600;
  text-align: left;
`;

const NoArcherWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  vertical-align: middle;
  width: 100%;
  color: var(--ma-gray-400);
`;

const HeadToHeadScoreLabels = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const ScoreTotalLabel = styled.span`
  color: var(--ma-primary-blue-100);
  font-weight: 600;
  white-space: nowrap;

  &.score-label-higher {
    color: var(--ma-blue);
  }
`;

const TeamNameLabel = styled.div`
  font-weight: 600;
  text-align: left;
`;

const TeamMembersBlock = styled.div`
  min-height: 10rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const EmptyMembers = styled.div`
  color: var(--ma-gray-200);
`;

const MembersList = styled.ol`
  margin: 0;
  margin-top: 0.5rem;
  padding-left: 1.5rem;
  text-align: left;
  font-size: 0.875em;
`;

/* ========================== */
// utils

function _getDirection(container) {
  let dir = 1;
  const lowestScrollPos = container.scrollTop + container.offsetHeight;
  if (lowestScrollPos >= container.scrollHeight) {
    dir = -1;
  }
  return dir;
}

function _getScoreLabel(categoryDetails) {
  if (!categoryDetails?.competitionCategoryId) {
    return "Total";
  }
  const TYPE_POINT = "Poin";
  const TYPE_ACCUMULATION = "Skor";
  return categoryDetails.competitionCategoryId.toLowerCase() === "compound"
    ? TYPE_ACCUMULATION
    : TYPE_POINT;
}

export { ScoringElimination };
