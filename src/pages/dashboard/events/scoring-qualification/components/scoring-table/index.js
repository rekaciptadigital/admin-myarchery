import * as React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useScoringMembers } from "../../hooks/scoring-members";
import { useScoreEditor } from "../../hooks/score-editor";
import { useParticipantPresence } from "../../hooks/participant-presence";
import { useSubmitScore } from "../../hooks/submit-score";
import { toast } from "../processing-toast";

import { LoadingScreen, SpinnerDotBlock, AlertConfirmAction } from "components/ma";
import { Checkbox } from "../../../components/form-fields";
import { ScoreEditor } from "./score-editor";

import IconChevronLeft from "components/ma/icons/mono/chevron-left";
import IconChevronRight from "components/ma/icons/mono/chevron-right";
import IconAlertCircle from "components/ma/icons/mono/alert-circle";
import IconBudrest from "components/ma/icons/mono/bud-rest";
import IconMedal from "components/ma/icons/fill/medal-gold";
import classnames from "classnames";

function ScoringTable({
  categoryDetailId,
  isLocked,
  isSelectionType,
  eliminationParticipantsCount,
  onChangeParticipantPresence,
  searchName,
  eventDetail
}) {
  const { event_id } = useParams();
  const eventId = event_id;
  const scoreType = isSelectionType ? 3 : undefined;

  const {
    data: scoringMembers,
    searchQuery,
    isLoading: isLoadingScoringMembers,
    isError: isErrorScoringMembers,
    getSessionNumbersList,
    fetchScoringMembers,
  } = useScoringMembers(
    categoryDetailId,
    searchName,
    eliminationParticipantsCount,
    false, // bukan beregu
    scoreType
  );
  const isSettledScoringMembers = scoringMembers || (!scoringMembers && isErrorScoringMembers);

  const { submitParticipantPresence, isLoading: isLoadingCheckPresence } = useParticipantPresence();

  const {
    isEditorOpen,
    activeRow,
    editorValue,
    checkIsRowActive,
    selectRow,
    closeEditor,
    updateEditorValue,
  } = useScoreEditor(scoringMembers, searchQuery);

  const { submitScore, isLoading: isSaving } = useSubmitScore();

  const sessionNumbersList = getSessionNumbersList();
  const shouldActiveRowRenderShootoff = [1, 2].indexOf(parseInt(activeRow?.haveShootOff)) >= 0;

  const _getParamEliminationTemplate = (count) => {
    if (editorValue.sessionNumber !== 11) {
      return;
    }
    return count;
  };

  const handleClickSelectRow = (rowData) => {
    if (!editorValue?.isDirty) {
      selectRow(rowData.member.id);
      return;
    }

    const payload = {
      code: editorValue.sessionCode,
      shoot_scores: editorValue.value,
      elimination_template: _getParamEliminationTemplate(eliminationParticipantsCount),
    };

    submitScore(payload, {
      onSuccess() {
        selectRow(rowData.member.id);
        fetchScoringMembers();
      },
      onError() {
        // TODO: prompt retry / switch without saving anyway
      },
    });
  };

  const handleCollapseEditor = () => {
    if (!editorValue?.isDirty) {
      closeEditor();
      return;
    }

    const payload = {
      code: editorValue.sessionCode,
      shoot_scores: editorValue.value,
    };

    submitScore(payload, {
      onSuccess() {
        closeEditor();
        fetchScoringMembers();
      },
      onError() {
        // TODO: prompt retry / switch without saving anyway
      },
    });
  };

  const checkPresenceByRow = (row) => {
    const params = {
      eventId,
      participantId: row.member.participantId,
      isPresent: row.member.isPresent ? 0 : 1,
    };

    submitParticipantPresence(params, {
      onSuccess() {
        const message = row.member.isPresent
          ? "Peserta tidak diikutkan dalam eliminasi"
          : "Peserta diikutkan dalam eliminasi";

        toast.success(message);
        onChangeParticipantPresence?.();
        fetchScoringMembers();
      },
    });
  };

  if (!isSettledScoringMembers) {
    return <SpinnerDotBlock />;
  }

  if (!scoringMembers?.length) {
    return <EmptyMembers>Tidak ada peserta di kategori ini</EmptyMembers>;
  }

  return (
    <React.Fragment>
      <LoadingScreen loading={isLoadingCheckPresence} />

      <TableContainer>
        <div>
          <LoadingBlocker isLoading={isLoadingScoringMembers} />
          <MembersTable className="table table-responsive">
            <thead>
              <tr>
                <th title="Bantalan">
                  <BudrestColumn />
                </th>
                <th title="Peringkat">
                  <IconMedal />
                </th>
                <th className="name">Nama Peserta</th>
                {!eventDetail.withContingent ? <th className="name">Nama Klub</th> : <th className="name">Kontingen</th>}
                <SessionStatsColumnHeadingGroup
                  isSelectionType={isSelectionType}
                  collapsed={isEditorOpen}
                  sessionList={sessionNumbersList}
                />
                <th></th>
              </tr>
            </thead>

            <tbody>
              {scoringMembers?.map((row) => {
                const shouldRenderShootoffWarning = [1, 2].indexOf(parseInt(row.haveShootOff)) >= 0;
                const getCheckboxTitleText = (row) => {
                  if (!isLocked) {
                    return row.member.isPresent
                      ? "Hapus centang untuk tidak mengikutkan dalam eliminasi"
                      : "Centang untuk mengikutkan dalam eliminasi";
                  }
                  if (isLocked)
                    return row.member.isPresent
                      ? "Peserta diikutkan dalam pemeringkatan eliminasi"
                      : "Peserta tidak diikutkan dalam pemeringkatan eliminasi";
                };
                return (
                  <tr
                    key={row.member.id}
                    className={classnames({ "row-active": checkIsRowActive(row.member.id) })}
                  >
                    <td>
                      <TargetFaceNumber
                        budRestNumber={row.member.budRestNumber}
                        targetFace={row.member.targetFace}
                      />
                    </td>
                    <td>
                      {row.rank || (
                        <GrayedOutText style={{ fontSize: "0.75em" }}>
                          belum
                          <br />
                          ada data
                        </GrayedOutText>
                      )}
                    </td>
                    <td className="name">{row.member.name}</td>
                    {!eventDetail.withContingent ?
                      <td className="name">
                        <ClubName>{row.clubName}</ClubName>
                      </td>
                     :
                      <td className="name">
                        {row.member.cityName}
                      </td>
                     }
                    <SessionStatsCellsGroup
                      collapsed={isEditorOpen}
                      sessions={row.sessions}
                      sessionNumbersList={sessionNumbersList}
                      total={row.total}
                      totalX={row.totalX}
                      totalXPlusTen={row.totalXPlusTen}
                      isSelectionType={isSelectionType}
                      totalArrow={row.totalArrow}
                      totalIrat={row.totalIrat}
                    />

                    <td>
                      <CellExpander>
                        {shouldRenderShootoffWarning && (
                          <WarningIconWrapper title="Peringkat terbawah memiliki skor yang sama">
                            <IconAlertCircle />
                          </WarningIconWrapper>
                        )}

                        {!isSelectionType && (
                          <CheckboxWithPrompt
                            disabled={isLocked || isEditorOpen}
                            checked={row.member.isPresent}
                            onChange={() => checkPresenceByRow(row)}
                            title={getCheckboxTitleText(row)}
                          />
                        )}

                        {checkIsRowActive(row.member.id) ? (
                          <ExpanderButton flexible onClick={handleCollapseEditor}>
                            <IconChevronLeft size="16" />
                          </ExpanderButton>
                        ) : (
                          <ExpanderButton
                            flexible
                            onClick={() => handleClickSelectRow(row)}
                            disabled={!row.member.isPresent}
                          >
                            <IconChevronRight size="16" />
                          </ExpanderButton>
                        )}
                      </CellExpander>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </MembersTable>
        </div>

        <ScoreEditor
          key={`${categoryDetailId}-${activeRow?.member.id}`}
          isSelectionType={isSelectionType}
          isLocked={isLocked}
          isOpen={isEditorOpen}
          memberId={activeRow?.member.id}
          sessionNumbersList={sessionNumbersList}
          scoreTotal={activeRow?.total}
          hasShootOff={shouldActiveRowRenderShootoff}
          isLoading={isSaving}
          onChange={updateEditorValue}
          onSaveSuccess={fetchScoringMembers}
          onClose={() => closeEditor()}
        />
      </TableContainer>
    </React.Fragment>
  );
}

function BudrestColumn() {
  return (
    <BudrestColumnIconWrapper>
      <IconBudrest />
    </BudrestColumnIconWrapper>
  );
}

function SessionStatsColumnHeadingGroup({ isSelectionType, collapsed, sessionList }) {
  if (collapsed) {
    return <th className="stats">Total</th>;
  }

  return (
    <React.Fragment>
      {sessionList?.map((sessionNumber) => (
        <th key={sessionNumber} className="stats">
          Sesi {sessionNumber}
        </th>
      ))}

      <th className="stats">Total</th>

      {!isSelectionType ? (
        <React.Fragment>
          <th className="stats">X+10</th>
          <th className="stats">X</th>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <th className="stats">Jumlah Arrow</th>
          <th className="stats">IRAT</th>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

function SessionStatsCellsGroup({
  isSelectionType,
  collapsed,
  sessions,
  sessionNumbersList,
  total,
  totalX,
  totalXPlusTen,
  totalArrow,
  totalIrat,
}) {
  if (collapsed) {
    return <td className="stats">{total}</td>;
  }

  return (
    <React.Fragment>
      {sessionNumbersList?.map((sessionNumber) => (
        <td key={sessionNumber} className="stats">
          {<span>{sessions[sessionNumber]?.total}</span> || <GrayedOutText>&ndash;</GrayedOutText>}
        </td>
      ))}

      <td className="stats">{total}</td>

      {!isSelectionType ? (
        <React.Fragment>
          <td className="stats">{totalXPlusTen}</td>
          <td className="stats">{totalX}</td>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <td className="stats">{totalArrow}</td>
          <td className="stats">{totalIrat}</td>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

function TargetFaceNumber({ targetFace, budRestNumber }) {
  if (!budRestNumber || !targetFace) {
    return <GrayedOutText>&ndash;</GrayedOutText>;
  }
  return <React.Fragment>{budRestNumber + targetFace}</React.Fragment>;
}

function ClubName({ children, clubName }) {
  if (!children && !clubName) {
    return <GrayedOutText>&ndash;</GrayedOutText>;
  }
  return children || clubName;
}

function CheckboxWithPrompt({ checked, onChange, title, disabled }) {
  const [showPrompt, setShowPrompt] = React.useState(false);
  return (
    <CheckboxWrapper title={title}>
      <Checkbox
        disabled={disabled}
        checked={checked}
        onChange={() => {
          if (checked) {
            setShowPrompt(true);
          } else {
            onChange?.();
          }
        }}
      />

      <AlertConfirmAction
        shouldConfirm={showPrompt}
        labelConfirm="Yakin"
        onConfirm={() => {
          setShowPrompt(false);
          onChange?.();
        }}
        labelCancel="Batal"
        onClose={() => setShowPrompt(false)}
      >
        Peserta akan tidak dihitung dalam pemeringkatan eliminasi.
        <br />
        Yakin?
      </AlertConfirmAction>
    </CheckboxWrapper>
  );
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

  .row-active {
    position: sticky;
    top: var(--ma-header-height);
    bottom: 0;
    background-color: var(--ma-gray-50);
    transition: all 0.15s;
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
    padding: 0.125rem 0.125rem;
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

const BudrestColumnIconWrapper = styled.span`
  color: var(--ma-red);
`;

const CellExpander = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;

  white-space: nowrap;
  text-align: right;
`;

const ExpanderButton = styled.button`
  padding: 0.375rem 0.625rem;
  border: none;
  border-radius: 1px;
  background-color: transparent;
  color: var(--ma-blue);

  transition: all 0.15s;

  &:hover {
    box-shadow: 0 0 0 1px var(--ma-gray-100);
  }

  &:focus {
    box-shadow: 0 0 0 1px #2684ff;
  }

  &:disabled {
    color: var(--ma-gray-200);
    box-shadow: none;
  }
`;

const WarningIconWrapper = styled.span`
  color: var(--ma-yellow);
`;

const CheckboxWrapper = styled.span`
  .rc-checkbox-disabled,
  .rc-checkbox-disabled .rc-checkbox-input {
    cursor: default;
  }
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

export { ScoringTable };
