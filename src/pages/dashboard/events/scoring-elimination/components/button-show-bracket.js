import * as React from "react";
import styled from "styled-components";
import { useEliminationBracketTemplate } from "../hooks/elimination-template";

import { Modal, ModalBody } from "reactstrap";
import {
  Bracket,
  Seed as RBSeed,
  SeedItem as RBSeedItem,
  SeedTeam as RBSeedTeam,
} from "react-brackets";
import { ButtonBlue, LoadingScreen, AlertSubmitError } from "components/ma";
import { ErrorBoundary } from "components/ma/error-boundary";

import IconBranch from "components/ma/icons/mono/branch";
import IconX from "components/ma/icons/mono/x";
import IconMedalGold from "components/ma/icons/fill/medal-gold";
import IconMedalSilver from "components/ma/icons/fill/medal-silver";
import IconMedalBronze from "components/ma/icons/fill/medal-bronze";

import classnames from "classnames";

function ButtonShowBracket({ categoryDetailId, eliminationMemberCount, eventDetail }) {
  const [isOpen, setOpen] = React.useState(false);
  const {
    data: bracketData,
    fetchEliminationTemplate,
    isLoading,
    isError,
    errors,
  } = useEliminationBracketTemplate(categoryDetailId, eliminationMemberCount);

  const eliminationNumber = _getEliminationNumber(bracketData);

  return (
    <React.Fragment>
      <LoadingScreen loading={isLoading} />
      <AlertSubmitError isError={isError} errors={errors} />

      <ButtonYellow
        flexible
        title="Lihat Bagan"
        onClick={() => {
          fetchEliminationTemplate({
            onSuccess() {
              setOpen(true);
            },
          });
        }}
      >
        <IconBranch size="20" /> Lihat Bagan
      </ButtonYellow>

      <ErrorBoundary>
        {isOpen && (
          <Modal
            isOpen
            size={
              bracketData.eliminationId || bracketData.eliminationGroupId
                ? "xl"
                : "md"
            }
            centered
            backdrop="static"
            autoFocus
            toggle={() => setOpen((open) => !open)}
            onClosed={() => setOpen(false)}
          >
            <ModalBody>
              <BodyWrapper>
                <TopBar>
                  <div>
                    {Boolean(
                      bracketData?.eliminationId ||
                        bracketData?.eliminationGroupId
                    ) && <Heading>{eliminationNumber} Besar</Heading>}
                  </div>
                  <div>
                    <EditorCloseButton flexible onClick={() => setOpen(false)}>
                      <IconX size="16" />
                    </EditorCloseButton>
                  </div>
                </TopBar>

                <div>
                  {bracketData.eliminationId ||
                  bracketData.eliminationGroupId ? (
                    <Scrollable>
                      <EliminationBracket data={bracketData} eventDetail={eventDetail} />
                    </Scrollable>
                  ) : (
                    <NoBracketAvailable />
                  )}
                </div>
              </BodyWrapper>
            </ModalBody>
          </Modal>
        )}
      </ErrorBoundary>
    </React.Fragment>
  );
}

function NoBracketAvailable() {
  return (
    <NoBracketWrapper>
      <h4>Bagan belum tersedia</h4>
    </NoBracketWrapper>
  );
}

function EliminationBracket({ data, eventDetail }) {
  const { hasWinner, winnerIndex } = _checkThirdPlaceHasWinner(data);

  if (data.eliminationId) {
    return (
      <Scrollable>
        <Bracket
          rounds={data.rounds || []}
          renderSeedComponent={(bracketProps) => (
            <SeedBagan
              bracketProps={bracketProps}
              configs={{
                isSettingApplied: !data.updated,
                totalRounds: data.rounds.length - 1,
                eliminationId: data.eliminationId,
                thirdPlaceHasWinner: hasWinner,
                thirdPlaceWinnerIndex: winnerIndex,
              }}
              eventDetail={eventDetail}
            />
          )}
        />
      </Scrollable>
    );
  }

  if (data.eliminationGroupId) {
    return (
      <Scrollable>
        <Bracket
          rounds={data.rounds || []}
          renderSeedComponent={(bracketProps) => (
            <SeedBaganTeam
              bracketProps={bracketProps}
              configs={{
                isSettingApplied: !data.updated,
                totalRounds: data.rounds.length - 1,
                eliminationId: data.eliminationGroupId,
                thirdPlaceHasWinner: hasWinner,
                thirdPlaceWinnerIndex: winnerIndex,
              }}
            />
          )}
        />
      </Scrollable>
    );
  }

  return null;
}

function SeedBagan({ bracketProps, configs, eventDetail }) {
  const { roundIndex, seed, breakpoint } = bracketProps;
  const {
    totalRounds,
    isSettingApplied,
    thirdPlaceHasWinner,
    thirdPlaceWinnerIndex,
  } = configs;
  const { isFinalRound, isThirdPlaceRound } = _getRoundPositions({
    totalRounds,
    roundIndex,
  });
  const roundNumber = roundIndex + 1;

  const noData = !seed.teams[0]?.name || !seed.teams[1]?.name;
  const hasWinner = seed.teams.some((team) => team.win === 1);
  const isBye =
    seed.teams.some((team) => team.status === "bye") ||
    (roundNumber === 1 && seed.teams.every((team) => !team.name));

  return (
    <Seed
      mobileBreakpoint={breakpoint}
      className={classnames({
        "round-final": isFinalRound,
        "round-third-place": isThirdPlaceRound,
      })}
    >
      <SeedItem>
        <ItemContainer>
          {seed.teams?.map((team, index) => {
            const isWinner = isSettingApplied && Boolean(team.win) && !isBye;
            const isThirdPlaceWinner =
              isThirdPlaceRound && index === thirdPlaceWinnerIndex;
            return (
              <SeedWrapper key={index}>
                <SeedBudrest
                  className={classnames({
                    "budrest-odd": index === 0,
                    "budrest-even": index === 1,
                  })}
                  title={team.budrestNumber}
                >
                  {team.budrestNumber || (
                    <React.Fragment>&ndash;</React.Fragment>
                  )}
                </SeedBudrest>

                <SeedTeam
                  key={index}
                  title={team.name}
                  className={classnames({
                    "item-active": !noData,
                    "item-winner":
                      (!isBye && parseInt(team.win) === 1) ||
                      isThirdPlaceWinner,
                    "item-even": index === 1,
                  })}
                >
                  <BoxNameGroup>
                    <BoxName title={team.name}>
                      {team.name || <ByeLabel isBye={isBye} />}
                    </BoxName>
                    {!eventDetail.withContingent ? (
                      <>
                        {team.club && (
                          <BoxName title={team.club} className="name-club">
                            {team.club}
                          </BoxName>
                        )}
                      </>
                    ) : (
                      <>
                        {team.city && (
                          <BoxName title={team.city} className="name-club">
                            {team.city}
                          </BoxName>
                        )}
                      </>
                    )}
                  </BoxNameGroup>
                  <BoxScore team={team} />

                  {/* ! Hati-hati, logika kondisionalnya ruwet pakai ternary wkwk */}
                  {/* TODO: refaktor jadi komponen (?) */}
                  {isFinalRound && hasWinner ? (
                    isWinner ? (
                      <FinalHeading
                        className={classnames({ "final-bottom": index > 0 })}
                      >
                        Medali Emas <IconMedalGold size="20" />
                      </FinalHeading>
                    ) : (
                      <FinalHeading
                        className={classnames({ "final-bottom": index > 0 })}
                      >
                        Medali Perak <IconMedalSilver size="20" />
                      </FinalHeading>
                    )
                  ) : isFinalRound && !hasWinner ? (
                    <FinalHeading>Babak Final</FinalHeading>
                  ) : isThirdPlaceRound && thirdPlaceHasWinner ? (
                    isThirdPlaceWinner ? (
                      <FinalHeading
                        className={classnames({ "final-bottom": index > 0 })}
                      >
                        <IconMedalBronze size="20" /> Medali Perunggu
                      </FinalHeading>
                    ) : null
                  ) : isThirdPlaceRound && !thirdPlaceHasWinner ? (
                    <FinalHeading>Perebutan Juara 3</FinalHeading>
                  ) : null}
                </SeedTeam>

                <SeedRank>
                  {team.potition ? (
                    <React.Fragment>#{team.potition}</React.Fragment>
                  ) : (
                    <React.Fragment>&nbsp;</React.Fragment>
                  )}
                </SeedRank>
              </SeedWrapper>
            );
          })}
        </ItemContainer>
      </SeedItem>
    </Seed>
  );
}

function SeedBaganTeam({ bracketProps, configs }) {
  const { roundIndex, seed, breakpoint } = bracketProps;
  const {
    totalRounds,
    isSettingApplied,
    thirdPlaceHasWinner,
    thirdPlaceWinnerIndex,
  } = configs;
  const { isFinalRound, isThirdPlaceRound } = _getRoundPositions({
    totalRounds,
    roundIndex,
  });
  const roundNumber = roundIndex + 1;

  // ?: cari pengecekan yang lebih sederhana?
  const noData =
    !seed.teams[0]?.teamName ||
    !seed.teams[1]?.teamName ||
    !seed.teams[0]?.memberTeam?.length ||
    !seed.teams[1]?.memberTeam?.length;

  const hasWinner = seed.teams.some((team) => team.win === 1);

  const isBye =
    seed.teams.some((team) => team.status === "bye") ||
    (roundNumber === 1 && seed.teams.every((team) => !team.teamName));

  return (
    <Seed
      mobileBreakpoint={breakpoint}
      className={classnames({
        "round-final": isFinalRound,
        "round-third-place": isThirdPlaceRound,
      })}
    >
      <SeedItem>
        <ItemContainer>
          {seed.teams?.map((team, index) => {
            const isWinner = isSettingApplied && Boolean(team.win) && !isBye;
            const isThirdPlaceWinner =
              isThirdPlaceRound && index === thirdPlaceWinnerIndex;
            return (
              <SeedWrapper key={index}>
                <SeedBudrest
                  className={classnames({
                    "budrest-odd": index === 0,
                    "budrest-even": index === 1,
                  })}
                  title={team.budrestNumber}
                >
                  {team.budrestNumber || (
                    <React.Fragment>&ndash;</React.Fragment>
                  )}
                </SeedBudrest>

                <SeedTeam
                  title={team.teamName}
                  className={classnames({
                    "item-active": !noData,
                    "item-winner":
                      (parseInt(team.win) === 1 && !isBye) ||
                      isThirdPlaceWinner,
                    "item-even": index === 1,
                  })}
                >
                  <BoxNameGroup>
                    <BoxName title={team.teamName}>
                      {team.teamName || <ByeLabel isBye={isBye} />}
                    </BoxName>
                    <MemberList>
                      {team.memberTeam?.map((member, index) => (
                        <li key={index}>
                          <span className="member-name" title={member.name}>
                            <span className="member-number">{index + 1}.</span>
                            <span>{member.name}</span>
                          </span>
                        </li>
                      ))}
                    </MemberList>
                  </BoxNameGroup>
                  <BoxScore team={team} />

                  {/* ! Hati-hati, logika kondisionalnya ruwet pakai ternary wkwk */}
                  {/* TODO: refaktor jadi komponen (?) */}
                  {isFinalRound && hasWinner ? (
                    isWinner ? (
                      <FinalHeading
                        className={classnames({ "final-bottom": index > 0 })}
                      >
                        Medali Emas <IconMedalGold size="20" />
                      </FinalHeading>
                    ) : (
                      <FinalHeading
                        className={classnames({ "final-bottom": index > 0 })}
                      >
                        Medali Perak <IconMedalSilver size="20" />
                      </FinalHeading>
                    )
                  ) : isFinalRound && !hasWinner ? (
                    <FinalHeading>Babak Final</FinalHeading>
                  ) : isThirdPlaceRound && thirdPlaceHasWinner ? (
                    isThirdPlaceWinner ? (
                      <FinalHeading
                        className={classnames({ "final-bottom": index > 0 })}
                      >
                        <IconMedalBronze size="20" /> Medali Perunggu
                      </FinalHeading>
                    ) : null
                  ) : isThirdPlaceRound && !thirdPlaceHasWinner ? (
                    <FinalHeading>Perebutan Juara 3</FinalHeading>
                  ) : null}
                </SeedTeam>

                <SeedRank>
                  {team.potition ? (
                    <React.Fragment>#{team.potition}</React.Fragment>
                  ) : (
                    <React.Fragment>&nbsp;</React.Fragment>
                  )}
                </SeedRank>
              </SeedWrapper>
            );
          })}
        </ItemContainer>
      </SeedItem>
    </Seed>
  );
}

function ByeLabel({ isBye }) {
  if (isBye) {
    return <ByeLabelSpan>&#171; bye &#187;</ByeLabelSpan>;
  }
  return <React.Fragment>&ndash;</React.Fragment>;
}

function BoxScore({ team }) {
  if (!team) {
    return null;
  }

  if (typeof team.adminTotal === "number") {
    return <BoxScoreWrapper>{team.adminTotal}</BoxScoreWrapper>;
  }

  if (typeof team.totalScoring === "number") {
    return <BoxScoreWrapper>{team.totalScoring}</BoxScoreWrapper>;
  }

  return null;
}

/* ================================== */
// styles

const BoxNameGroup = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
`;

const ByeLabelSpan = styled.span`
  text-align: center;
  vertical-align: middle;
  color: var(--ma-gray-200);
  font-weight: 600;
`;

const BodyWrapper = styled.div`
  > * + * {
    margin-top: 1rem;
  }
`;

const ButtonYellow = styled(ButtonBlue)`
  &,
  &:focus,
  &:active {
    border-color: var(--ma-secondary);
    background-color: var(--ma-secondary);
    color: var(--ma-blue);
  }

  &:hover {
    border-color: #ffcd3a;
    background-color: #ffcd3a;
    color: var(--ma-blue);
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  > *:nth-child(1) {
    flex-grow: 1;
  }

  > *:nth-child(2) {
    flex-shrink: 0;
  }
`;

const Heading = styled.h5`
  margin-top: 0.5rem;
  margin-bottom: 0;
  color: var(--ma-blue);
  font-weight: 600;
`;

const NoBracketWrapper = styled.div`
  min-height: 10rem;
  display: flex;
  justify-content: center;
  align-items: center;

  > *:nth-child(1) {
    margin-top: -2rem;
    color: var(--ma-gray-400);
  }
`;

const Scrollable = styled.div`
  overflow-x: auto;
`;

const EditorCloseButton = styled.button`
  padding: 0.375rem 0.625rem;
  border: none;
  background-color: transparent;
  color: var(--ma-blue);

  transition: all 0.15s;

  &:hover {
    box-shadow: 0 0 0 1px var(--ma-gray-200);
  }
`;

const FinalHeading = styled.h6`
  position: absolute;
  top: -2.5em;
  left: 0;
  right: 0;
  font-weight: 600;
  text-align: center;

  &.final-bottom {
    top: unset;
    bottom: -3em;
  }
`;

const Seed = styled(RBSeed)`
  padding-top: 2rem;
  padding-bottom: 2rem;

  &.round-third-place {
    margin-left: 3.75rem;
  }
`;

const SeedItem = styled(RBSeedItem)`
  border-radius: 0.5rem;
  background-color: #ffffff;
  box-shadow: none;
`;

const SeedWrapper = styled.div`
  display: flex;

  > *:nth-child(2) {
    flex-grow: 1;
    min-width: 10rem;
    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.15);
  }
`;

const SeedBudrest = styled.div`
  flex-shrink: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 2.5rem;
  padding: 0.5rem;
  background-color: var(--ma-primary-blue-50);

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: var(--ma-txt-black);
  font-size: 0.625rem;

  &.budrest-odd {
    border-top-left-radius: 0.5rem;
  }

  &.budrest-even {
    border-bottom-left-radius: 0.5rem;
  }
`;

const SeedRank = styled.div`
  flex-shrink: 0;

  width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;

  color: var(--ma-gray-600);
  font-size: 0.625rem;
  vertical-align: middle;
`;

const SeedTeam = styled(RBSeedTeam)`
  gap: 0.25rem;
  padding: 0.5rem;
  border: solid 2px #757575;
  border-radius: 0.375rem;
  background-color: #ffffff;
  color: var(--bs-body-color);
  font-size: var(--bs-body-font-size);

  &.item-even {
    border-top: none;
  }

  &.item-active {
    border-color: #0d47a1;
  }

  &.item-winner {
    border-color: var(--ma-blue);
    background-color: #bc8b2c;
    color: #000000;

    .name-club,
    .member-name {
      color: var(--ma-text-black);
    }
  }
`;

const ItemContainer = styled.div`
  position: relative;
`;

const BoxName = styled.span`
  max-width: 10rem;
  white-space: wrap;
  overflow: hidden;
  word-wrap: break-word;
  text-align: left;
  text-overflow: ellipsis;

  &.name-club {
    color: var(--ma-gray-500);
    font-size: 0.7em;
  }
`;

const MemberList = styled.ol`
  margin: 0.5rem 0 0 0;
  padding-left: 0;
  list-style: none;
  text-align: left;
  font-size: 0.7em;

  .member-name {
    margin-top: -0.25rem;
    display: inline-block;
    max-width: 7.5rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--ma-gray-500);

    .member-number {
      display: inline-block;
      width: 7.5px;
      margin-right: 0.25rem;
    }
  }
`;

const BoxScoreWrapper = styled.span`
  display: inline-block;
  padding: 2px 0.375rem;
  border-radius: 0.25rem;
  background-color: var(--ma-gray-400);
  color: #ffffff;
  font-weight: 600;

  .item-winner & {
    background-color: #000000;
  }
`;

/* ========================= */
// utils

function _getEliminationNumber(bracketData) {
  if (!bracketData) {
    return 0;
  }

  const numbersByLength = {
    6: 32, // besar
    5: 16, // besar
    4: 8, // besar
    3: 4, // besar
  };
  return numbersByLength[bracketData.rounds.length];
}

function _getRoundPositions({ totalRounds, roundIndex }) {
  const positionByRounds = {
    5: { finalIndex: 4, thirdPlaceIndex: 5 }, // 32 besar
    4: { finalIndex: 3, thirdPlaceIndex: 4 }, // 16 besar
    3: { finalIndex: 2, thirdPlaceIndex: 3 }, // 8 besar
    2: { finalIndex: 1, thirdPlaceIndex: 2 }, // 4 besar
  };

  const { finalIndex, thirdPlaceIndex } = positionByRounds[totalRounds] || {};
  const isFinalRound = roundIndex === finalIndex;
  const isThirdPlaceRound = roundIndex === thirdPlaceIndex;

  return { isFinalRound, isThirdPlaceRound };
}

function _checkThirdPlaceHasWinner(data) {
  const defaultValue = { hasWinner: false, winnerIndex: -1 };

  if (!data) {
    return defaultValue;
  }

  const winningStatusByRound = [];
  for (const index in data.rounds) {
    const round = data.rounds[index];
    const previousIndex = parseInt(index) - 1;
    const previousStatus =
      previousIndex > -1 ? winningStatusByRound[previousIndex] : true;

    const thisRoundDone = round.seeds.every((seed) => {
      const thisMatchIsBye = seed.teams.some((team) => team.status === "bye");
      const thisMatchHasWinner = seed.teams.some((team) => Boolean(team.win));
      const thisMatchAllWait = seed.teams.every(
        (team) => team.status === "wait"
      );
      const isDone =
        thisMatchIsBye ||
        thisMatchHasWinner ||
        (previousStatus && thisMatchAllWait);
      return isDone;
    });

    winningStatusByRound.push(thisRoundDone);
  }

  const thirdPlaceRoundIndex = winningStatusByRound.length - 1;
  const finalRoundIndex = thirdPlaceRoundIndex - 1;
  const semiFinalIndex = finalRoundIndex - 1;

  const ongoingIndex = _getOngoingIndex(winningStatusByRound);

  // Belum kelihatan di perebutan juara 3 ada pemenang apa enggak
  if (ongoingIndex <= semiFinalIndex) {
    return defaultValue;
  }

  const thirdPlaceSeed = data.rounds[thirdPlaceRoundIndex].seeds[0];
  return _checkSeedHasWinner(thirdPlaceSeed);
}

/**
 * Yang ongoing harusnya satu round setelah round
 * yang match-nya udah dapat pemenang semua
 */
function _getOngoingIndex(statusByRound) {
  let foundIndex = 0;
  const rounds = [...statusByRound];
  for (const index in rounds) {
    const status = rounds[index];
    const lastIndex = statusByRound.length - 1;
    if (status === true && parseInt(index) < lastIndex) {
      continue;
    }
    foundIndex = parseInt(index);
    break;
  }
  return foundIndex;
}

function _checkSeedHasWinner(seed) {
  const hasPlayerName = seed.teams.some((player) => Boolean(player.name));
  if (hasPlayerName) {
    const winIndex = seed.teams.findIndex((team) => Boolean(team.win));
    const playerIndex = seed.teams.findIndex((player) => Boolean(player.name));
    const foundIndex =
      winIndex > -1 ? winIndex : playerIndex > -1 ? playerIndex : -1;
    return {
      hasWinner: hasPlayerName,
      winnerIndex: foundIndex,
    };
  }

  const hasTeamName = seed.teams.some((team) => Boolean(team.teamName));
  if (hasTeamName) {
    const winIndex = seed.teams.findIndex((team) => Boolean(team.win));
    const teamIndex = seed.teams.findIndex((team) => Boolean(team.teamName));
    const foundIndex =
      winIndex > -1 ? winIndex : teamIndex > -1 ? teamIndex : -1;
    return {
      hasWinner: hasTeamName,
      winnerIndex: foundIndex,
    };
  }

  return { hasWinner: false, winnerIndex: -1 };
}

export { ButtonShowBracket };
