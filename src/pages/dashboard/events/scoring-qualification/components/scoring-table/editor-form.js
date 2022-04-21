import * as React from "react";
import styled from "styled-components";
import { useScoringDetail } from "../../hooks/scoring-details";
import { useSubmitScore } from "../../hooks/submit-score";

import { SpinnerDotBlock } from "components/ma";
import { SelectScore } from "./select-score";

function EditorForm({ memberId, sessionNumber, onSaveSuccess }) {
  const code = _makeQualificationCode({ memberId, sessionNumber });
  const {
    data: scoreDetail,
    isLoading: isLoadingScore,
    fetchScoringDetail,
  } = useScoringDetail(code);
  const { submitScore, isLoading: isLoadingSubmit } = useSubmitScore(code, scoreDetail?.score);

  const isLoading = isLoadingScore || isLoadingSubmit;

  const getScores = (shotNumber) => {
    if (!scoreDetail) {
      return ["", "", "", "", "", ""];
    }
    return scoreDetail.score[shotNumber];
  };

  const handleSuccessSave = () => {
    onSaveSuccess?.();
    fetchScoringDetail();
  };

  return (
    <SessionContainer>
      <SessionBody>
        <LoadingBlocker isLoading={isLoading} />
        <ScoresTable className="table table-responsive">
          <thead>
            <tr>
              <th>End</th>
              <th colSpan="6">Shot</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {[1, 2, 3, 4, 5, 6].map((id, rambahanIndex) => (
              <tr key={id}>
                <td>{rambahanIndex + 1}</td>

                {getScores(id).map((scoreItem, shotIndex) => (
                  <td key={shotIndex}>
                    <SelectScore
                      name={`shot-score-${rambahanIndex}-${shotIndex}`}
                      value={scoreItem}
                      onChange={(value) => {
                        submitScore({
                          rambahan: id,
                          shotIndex: shotIndex,
                          value: value,
                          onSuccess: handleSuccessSave,
                        });
                      }}
                    />
                  </td>
                ))}

                <td>{_sumRambahanTotal(getScores(id))}</td>
              </tr>
            ))}
          </tbody>
        </ScoresTable>

        <ShotOffBar>
          <ShotOffGroup>
            <div>S-Off</div>
            <ShotOffGroup>
              {[1, 2, 3].map((number) => (
                <SelectScore
                  key={number}
                  name={`shot-off-score`}
                  value={""}
                  onChange={(value) => {
                    alert(`Simpan nilai jadi ${value}`);
                    handleSuccessSave();
                  }}
                />
              ))}
            </ShotOffGroup>
          </ShotOffGroup>

          {/* TODO: nilai dari data */}
          <div>{0}</div>
        </ShotOffBar>
      </SessionBody>

      <SessionStatsFooter>
        <StatItem>
          <span>X+10:</span>
          {isLoading ? (
            <SkeletonStatItem>{_countXPlusTen(scoreDetail?.score) || "00"}</SkeletonStatItem>
          ) : (
            <span>{_countXPlusTen(scoreDetail?.score)}</span>
          )}
        </StatItem>

        <StatItem>
          <span>X:</span>
          {isLoading ? (
            <SkeletonStatItem>{_countX(scoreDetail?.score) || "00"}</SkeletonStatItem>
          ) : (
            <span>{_countX(scoreDetail?.score)}</span>
          )}
        </StatItem>

        <StatItem>
          <span>Total:</span>
          {isLoading ? (
            <SkeletonStatItem className="total">
              {_sumTotal(scoreDetail?.score) || "00"}
            </SkeletonStatItem>
          ) : (
            <TotalNumber>{_sumTotal(scoreDetail?.score)}</TotalNumber>
          )}
        </StatItem>
      </SessionStatsFooter>
    </SessionContainer>
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

/* ============================== */
// styles

const SessionContainer = styled.div`
  > * + * {
    margin-top: 0.5rem;
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

const SkeletonStatItem = styled.span`
  border-radius: 0.25rem;
  color: transparent;
  background-color: var(--ma-gray-100);

  &.total {
    font-size: 1.125rem;
  }
`;

const SessionBody = styled.div`
  position: relative;
  min-width: 30rem;
  border-radius: 0.5rem;
  background-color: #ffffff;
`;

const SessionStatsFooter = styled.div`
  padding: 0.75rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 3rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
`;

const TotalNumber = styled.span`
  font-size: 1.125rem;
`;

const ScoresTable = styled.table`
  margin: 0;

  th {
    color: var(--ma-txt-black);
    font-weight: 600;
  }

  td {
    text-align: center;
    vertical-align: middle;
  }
`;

const ShotOffBar = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  padding: 0.5rem;
`;

const ShotOffGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

/* ============================ */
// utils

function _makeQualificationCode({ memberId, sessionNumber }) {
  if (!memberId || !sessionNumber) {
    return null;
  }
  return `1-${memberId}-${sessionNumber}`;
}

function _convertScoreValueType(inputValue) {
  if (!inputValue || inputValue === "-") {
    return "-";
  }
  if (["m", "x"].indexOf(inputValue.toLowerCase?.()) >= 0) {
    return inputValue;
  }
  return Number(inputValue);
}

function _sumRambahanTotal(list) {
  const _sumReducer = (total, inputValue) => {
    const value = _convertScoreValueType(inputValue);
    if (!inputValue || value === "m") {
      return total;
    }
    if (value === "x") {
      return total + 10;
    }
    return total + value;
  };
  return list.reduce(_sumReducer, 0);
}

function _sumTotal(gridData) {
  if (!gridData) {
    return 0;
  }
  const total = Object.keys(gridData).reduce((total, id) => {
    return total + _sumRambahanTotal(gridData[id]);
  }, 0);

  return total;
}

function _countX(gridData) {
  if (!gridData) {
    return 0;
  }

  const counts = Object.keys(gridData).reduce((total, id) => {
    let tempTotal = total;
    gridData[id].forEach((scoreValue) => {
      if (_convertScoreValueType(scoreValue) !== "x") {
        return;
      }
      tempTotal = tempTotal + 1;
    });
    return tempTotal;
  }, 0);

  return counts;
}

function _countXPlusTen(gridData) {
  if (!gridData) {
    return 0;
  }

  const counts = Object.keys(gridData).reduce((total, id) => {
    let tempTotal = total;
    gridData[id].forEach((scoreValue) => {
      const score = _convertScoreValueType(scoreValue);
      if (score !== "x" && score !== 10) {
        return;
      }
      tempTotal = tempTotal + 1;
    });
    return tempTotal;
  }, 0);

  return counts;
}

export { EditorForm };
