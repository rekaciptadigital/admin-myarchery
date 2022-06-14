import * as React from "react";
import styled from "styled-components";
import { useEliminationBracketTemplate } from "../hooks/elimination-template";

// import { Modal, ModalBody } from "reactstrap";
import {
  Bracket,
  Seed as RBSeed,
  SeedItem as RBSeedItem,
  SeedTeam as RBSeedTeam,
} from "react-brackets";
import { LoadingScreen, AlertSubmitError } from "components/ma";

// import IconBranch from "components/ma/icons/mono/branch";
// import IconX from "components/ma/icons/mono/x";

import classnames from "classnames";

function ButtonShowBracket({ categoryDetailId }) {
  // const [isOpen, setOpen] = React.useState(false);
  const {
    data: bracketData,
    fetchEliminationTemplate,
    isLoading,
    isError,
    errors,
  } = useEliminationBracketTemplate(categoryDetailId);

  React.useEffect(() => {
    if(categoryDetailId) {
      fetchEliminationTemplate();
    }
  }, [categoryDetailId]);

  return (
    <React.Fragment>
      <LoadingScreen loading={isLoading} />
      <AlertSubmitError isError={isError} errors={errors} />

      {/* <ButtonYellow
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
      </ButtonYellow> */}

      {/* {isOpen && (
        <Modal
          isOpen
          size={bracketData.eliminationId ? "xl" : "md"}
          centered
          backdrop="static"
          autoFocus
          toggle={() => setOpen((open) => !open)}
          onClosed={() => setOpen(false)}
        >
          <ModalBody> */}
            <BodyWrapper>
              {/* <TopBar>
                <EditorCloseButton flexible onClick={() => setOpen(false)}>
                  <IconX size="16" />
                </EditorCloseButton>
              </TopBar> */}

              <div>
                {bracketData?.eliminationId ? (
                  <Scrollable>
                    <Bracket
                      rounds={bracketData.rounds || []}
                      renderSeedComponent={(bracketProps) => (
                        <SeedBagan
                          bracketProps={bracketProps}
                          configs={{
                            totalRounds: bracketData.rounds.length - 1,
                            eliminationId: bracketData.eliminationId,
                          }}
                        />
                      )}
                    />
                  </Scrollable>
                ) : (
                  <NoBracketAvailable />
                )}
              </div>
            </BodyWrapper>
          {/* </ModalBody>
        </Modal>
      )} */}
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

function SeedBagan({ bracketProps, configs }) {
  const { roundIndex, seed, breakpoint } = bracketProps;

  const noData = !seed.teams[0]?.name || !seed.teams[0]?.name;
  const isBye = seed.teams.some((team) => team.status === "bye");

  const isFinalRound =
    (configs.totalRounds === 4 && roundIndex === 3) ||
    (configs.totalRounds === 3 && roundIndex === 2);
  const isThirdPlaceRound =
    (configs.totalRounds === 4 && roundIndex === 4) ||
    (configs.totalRounds === 3 && roundIndex === 3);

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
          {isFinalRound && <FinalHeading>Medali Emas</FinalHeading>}
          {isThirdPlaceRound && <FinalHeading>Medali Perunggu</FinalHeading>}
          {seed.teams.map((team, index) => (
            <SeedTeam
              key={index}
              className={classnames({
                "item-active": !noData,
                "item-winner": parseInt(team.win) === 1 && !isBye,
              })}
            >
              <BoxName>{team.name || <React.Fragment>&ndash;</React.Fragment>}</BoxName>
              <BoxScore team={team} />
            </SeedTeam>
          ))}
        </ItemContainer>
      </SeedItem>
    </Seed>
  );
}

function BoxScore({ team }) {
  if (!team) {
    return null;
  }

  if (team.adminTotal && typeof team.adminTotal === "number") {
    return <BoxScoreWrapper>{team.adminTotal}</BoxScoreWrapper>;
  }

  if (team.totalScoring && typeof team.totalScoring === "number") {
    return <BoxScoreWrapper>{team.totalScoring}</BoxScoreWrapper>;
  }

  return null;
}

/* ================================== */
// styles

const BodyWrapper = styled.div`
  > * + * {
    margin-top: 1rem;
  }
`;

// const ButtonYellow = styled(ButtonBlue)`
//   &,
//   &:focus,
//   &:active {
//     border-color: var(--ma-secondary);
//     background-color: var(--ma-secondary);
//     color: var(--ma-blue);
//   }

//   &:hover {
//     border-color: #ffcd3a;
//     background-color: #ffcd3a;
//     color: var(--ma-blue);
//   }
// `;

// const TopBar = styled.div`
//   display: flex;
//   justify-content: flex-end;
//   gap: 1rem;
// `;

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

// const EditorCloseButton = styled.button`
//   padding: 0.375rem 0.625rem;
//   border: none;
//   background-color: transparent;
//   color: var(--ma-blue);

//   transition: all 0.15s;

//   &:hover {
//     box-shadow: 0 0 0 1px var(--ma-gray-200);
//   }
// `;

const FinalHeading = styled.h6`
  position: absolute;
  top: -3.6em;
  left: 0;
  right: 0;
  font-weight: 600;
  text-align: center;
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
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.05);
  background-color: var(--ma-primary-blue-50);
`;

const SeedTeam = styled(RBSeedTeam)`
  gap: 0.25rem;
  padding: 0.5rem;
  border: solid 2px #757575;
  border-radius: 0.375rem;
  background-color: #ffffff;
  color: var(--bs-body-color);
  font-size: var(--bs-body-font-size);

  &.item-active {
    border-color: #0d47a1;
  }

  &.item-winner {
    border-color: var(--ma-blue);
    background-color: #bc8b2c;
    color: #000000;
  }
`;

const ItemContainer = styled.div`
  position: relative;
  max-width: 12.5rem;

  > ${SeedTeam} + ${SeedTeam} {
    border-top: none;
  }
`;

const BoxName = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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

export { ButtonShowBracket };