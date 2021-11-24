import * as React from "react";
import styled from "styled-components";
import { ScoringService } from "services";

import { Modal, ModalBody, ModalHeader, ModalFooter, Row, Col, Button } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import ScoringGrid from "./ScoringGrid";

const computeScoringTypeId = (data) => {
  return data[0].scores.eliminationtScoreType || data[1].scores.eliminationtScoreType;
};
const computeScoringTypeLabel = (data, options) => {
  const typeId = computeScoringTypeId(data);
  const typeObj = options.find((type) => parseInt(type.id) === parseInt(typeId));
  return typeObj.label;
};
const computeMemberId = (data) => data?.participant.member.id;
const computeMemberName = (data) => data?.participant.member.name;
const computeClubName = (data) => {
  if (data?.participant.club) {
    return `(${data?.participant.club})`;
  }
  return <span style={{ color: "var(--bs-gray-400)" }}>&mdash;</span>;
};
const computeCategoryLabel = (data) => {
  return data?.[0]?.participant.categoryLabel || data?.[1]?.participant.categoryLabel;
};
const computeTotalPoints = (data) => {
  return data?.shot.reduce((prev, rambahan) => prev + rambahan.point, 0);
};

const computeTotalScores = (data) => {
  return data?.shot.reduce((prev, rambahan) => prev + rambahan.total, 0);
};

export default function ModalScoring({
  data: { scoringData: initialScoringData, ...contextDetails },
  modalControl,
  onSavePermanent,
}) {
  const { isModalScoringOpen, toggleModalScoring, closeModalScoring } = modalControl;

  // cuman yang bagian `scores`-nya di payload
  // supaya bisa dipakai untuk refetch setelah save
  const [modalScoringData, setMembersScoringData] = React.useState(() =>
    initialScoringData.map((data) => data.scores)
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [savingStatus, setSavingStatus] = React.useState("idle");
  const [alertSavePermanent, setAlertSavePermanent] = React.useState(false);

  const handleGridChange = (index, ev) => {
    setMembersScoringData((value) => {
      const membersScoringUpdated = [...value];
      membersScoringUpdated[index] = { ...ev };
      return membersScoringUpdated;
    });
  };

  const computeDataToSave = () => {
    const { type, round, match, elimination_id } = contextDetails;
    return {
      save_permanent: 0,
      elimination_id: elimination_id,
      round: round,
      match: match,
      type: type,
      members: [
        {
          memberId: computeMemberId(initialScoringData[0]),
          scores: modalScoringData[0],
        },
        {
          memberId: computeMemberId(initialScoringData[1]),
          scores: modalScoringData[1],
        },
      ],
    };
  };

  const handleClickSave = async () => {
    setIsLoading(true);
    const { success } = await ScoringService.saveParticipantScore({ ...computeDataToSave() });

    if (success) {
      const queryString = {
        type: contextDetails.type,
        round: contextDetails.round,
        match: contextDetails.match,
        elimination_id: contextDetails.elimination_id,
      };
      const refetch = await ScoringService.findParticipantScoreDetail(queryString);
      if (refetch.success) {
        setMembersScoringData(refetch.data.map((data) => data.scores));
        setSavingStatus("success");
      } else {
        setSavingStatus("error");
      }
    } else {
      setSavingStatus("error");
    }
    setIsLoading(false);

    setTimeout(() => {
      setSavingStatus("idle");
    }, 3000);
  };

  const handleConfirmSavePermanent = () => {
    setAlertSavePermanent(true);
  };

  const executeSavePermanent = async () => {
    setIsLoading(true);
    const { success } = await ScoringService.saveParticipantScore({
      ...computeDataToSave(),
      save_permanent: 1,
    });

    setIsLoading(false);
    if (success) {
      closeModalScoring();
      onSavePermanent();
    } else {
      setSavingStatus("error");
      setTimeout(() => {
        setSavingStatus("idle");
      }, 3000);
    }

    setTimeout(() => {
      setIsLoading(false);
      closeModalScoring();
    }, 1500);
  };

  return (
    <Modal
      size="xl"
      backdrop="static"
      autoFocus={true}
      centered={true}
      isOpen={isModalScoringOpen}
      toggle={() => toggleModalScoring()}
      onClosed={() => closeModalScoring()}
    >
      <ModalHeader toggle={() => toggleModalScoring()}>
        Set Scoring &mdash;{" "}
        {computeScoringTypeLabel(initialScoringData, contextDetails.scoringTypeOptions)}
      </ModalHeader>

      <ModalBody>
        <SavingOverlay loading={isLoading} />

        {initialScoringData?.length ? (
          <React.Fragment>
            <Row className="mt-4 mb-4">
              <Col>
                <h4 className="text-center">{computeCategoryLabel(initialScoringData)}</h4>
              </Col>
            </Row>

            <Row>
              <Col className="border-end border-2 px-4">
                <h5 className="text-center">{computeMemberName(initialScoringData[0])}</h5>
                <h6 className="text-center mb-3">{computeClubName(initialScoringData[0])}</h6>

                {computeScoringTypeId(initialScoringData) === 1 && (
                  <PointsDisplay scoringType={1} point={computeTotalPoints(modalScoringData[0])} />
                )}
                {computeScoringTypeId(initialScoringData) === 2 && (
                  <PointsDisplay scoringType={2} point={computeTotalScores(modalScoringData[0])} />
                )}

                <ScoringGrid
                  scoringType={computeScoringTypeId(initialScoringData)}
                  scores={modalScoringData[0]}
                  onChange={(ev) => handleGridChange(0, ev)}
                />
              </Col>

              <Col className="px-4">
                <h5 className="text-center">{computeMemberName(initialScoringData[1])}</h5>
                <h6 className="text-center mb-3">{computeClubName(initialScoringData[1])}</h6>

                {computeScoringTypeId(initialScoringData) === 1 && (
                  <PointsDisplay scoringType={1} point={computeTotalPoints(modalScoringData[1])} />
                )}
                {computeScoringTypeId(initialScoringData) === 2 && (
                  <PointsDisplay scoringType={2} point={computeTotalScores(modalScoringData[1])} />
                )}

                <ScoringGrid
                  scoringType={computeScoringTypeId(initialScoringData)}
                  scores={modalScoringData[1]}
                  onChange={(ev) => handleGridChange(1, ev)}
                />
              </Col>
            </Row>

            <SweetAlert
              title=""
              show={alertSavePermanent}
              custom
              btnSize="md"
              reverseButtons={true}
              showCancel
              cancelBtnText="Batal"
              confirmBtnText="OK"
              confirmBtnBsStyle="outline-primary"
              cancelBtnBsStyle="primary"
              onConfirm={() => {
                setAlertSavePermanent(false);
                executeSavePermanent();
              }}
              onCancel={() => setAlertSavePermanent(false)}
              style={{ padding: "30px 40px" }}
            >
              <p className="text-muted">
                Skor tidak akan dapat diubah lagi. Pastikan semua skor telah diisi dengan benar.
              </p>
            </SweetAlert>
          </React.Fragment>
        ) : (
          <div>Preparing...</div>
        )}
      </ModalBody>

      {initialScoringData?.length && (
        <ModalFooter>
          <div style={{ position: "relative" }}>
            <Button color="primary" onClick={handleClickSave}>
              Simpan
            </Button>

            <Button
              color="success"
              outline
              className="ms-2"
              onClick={handleConfirmSavePermanent}
              disabled={false}
            >
              Tentukan
            </Button>

            <FeedBackSavingStatus status={savingStatus} />
          </div>
        </ModalFooter>
      )}
    </Modal>
  );
}

function PointsDisplay({ scoringType, point = 0 }) {
  return (
    <StyledPointsDisplay className="mt-4 mb-4">
      <span className="label-point">
        {scoringType === 1 && "point"}
        {scoringType === 2 && "skor"}
      </span>
      <span>{point}</span>
    </StyledPointsDisplay>
  );
}

const StyledPointsDisplay = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  padding: 6px 20px;
  max-width: 60px;
  border-radius: 4px;
  border: solid 1px var(--bs-primary);

  color: var(--bs-primary);
  text-align: center;
  font-size: 1.6rem;
  font-weight: bold;

  .label-point {
    font-size: 0.35em;
    font-weight: normal;
  }
`;

function SavingOverlay({ loading }) {
  if (loading) {
    return (
      <SavingOverlayContainer>
        <h5 className="text-muted">Menyimpan...</h5>
      </SavingOverlayContainer>
    );
  }
  return null;
}

const SavingOverlayContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #ffffff;
  opacity: 0.8;
  z-index: 10;

  display: flex;
  justify-content: center;
  align-items: center;
`;

function FeedBackSavingStatus({ status }) {
  if (status === "success") {
    return (
      <FeedbackMessageSaving className="text-success">
        Skor berhasil disimpan!
      </FeedbackMessageSaving>
    );
  }

  if (status === "error") {
    return (
      <FeedbackMessageSaving className="text-danger">Gagal menyimpan skor!</FeedbackMessageSaving>
    );
  }

  return null;
}

const FeedbackMessageSaving = styled.div`
  position: absolute;
  top: 0.8em;
  left: -100%;
  opacity: 0.5;
`;
