import * as React from "react";
import styled from "styled-components";
import { useScoringMembers } from "../../hooks/scoring-members";

import { Row, Col } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import { SpinnerDotBlock, ButtonBlue, Button, ButtonOutlineBlue } from "components/ma";

import logoUpdate from "assets/images/myachery/update-category.png";

function MemberTable({ categoryDetail, searchName, eventId, isTeam, paymentStatus, eventDetail }) {

  const {
    data: scoringMembers,
    isLoading: isLoadingScoringMembers,
    isError: isErrorScoringMembers,
  } = useScoringMembers({
    categoryDetail,
    inputSearchQuery: searchName,
    eventId,
    isTeam,
    status: paymentStatus,
  });

  const [isOpenAlert, setIsOpenAlert] = React.useState(false);
  const [dataCategories, setDataCategories] = React.useState([]);
  const [idParticipant, setIdParticipant] = React.useState(0);
  const [categoryId, setCategoryId] = React.useState(0);
  const [isUpdateCategory, setIsUpdateCategory] = React.useState(false);

  const isSettledScoringMembers = scoringMembers || (!scoringMembers && isErrorScoringMembers);

  const onConfirm = async (participantId) => {
    const { message, errors, data } = await EventsService.getAccessCategories({
      participant_id: participantId,
    });
    if (message === "Success") {
      setDataCategories(data);
      if (data) {
        setIsOpenAlert(true);
      }
    }
    console.info(errors);
  };

  const onCancel = () => {
    setIsOpenAlert(false);
  };

  const onUpdateCategory = async () => {
    const { message, errors } = await EventsService.updateCategory(null, {
      participant_id: idParticipant,
      category_id: categoryId,
    });
    if (message === "Success") {
      console.log("Update success");
      setIsUpdateCategory(true);
    }
    console.info(errors);
  };

  const onBackToList = () => {
    setIsUpdateCategory(false);
    window.location.reload();
  };

  if (!isSettledScoringMembers) {
    return <SpinnerDotBlock />;
  }

  if (!scoringMembers?.length) {
    return (
      <React.Fragment>
        <EmptyMembers>
          <div>
            Tidak ada peserta {paymentStatus === 1 || paymentStatus === 0 ? "di kategori ini" : ""}
          </div>
          <LoadingBlocker isLoading={isLoadingScoringMembers} />
        </EmptyMembers>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <TableContainer>
        <LoadingBlocker isLoading={isLoadingScoringMembers} />
        <MembersTable className="table table-responsive">
          <thead>
            <tr>
              <th>No.</th>
              <th className="name">Nama Peserta</th>
              {!eventDetail.withContingent ? <th className="name">Nama Klub</th> : <th className="name">Kontingen</th>}
              <th className="name">Email</th>
              <th className="name">Telepon</th>
              <th className="name">Status Pembayaran</th>
              <th className="name"></th>
            </tr>
          </thead>

          <tbody>
            {scoringMembers?.map((row, index) => {
              return (
                <tr key={row.participantId}>
                  <td>{index + 1}.</td>
                  <td className="name">{row?.member?.name}</td>
                  <td className="name">
                    {!eventDetail.withContingent ? <ClubName>{row?.member?.clubName}</ClubName> : <ClubName>{row?.member?.cityName}</ClubName>}
                  </td>
                  <td className="name">
                    <ClubName>{row?.member?.email}</ClubName>
                  </td>
                  <td className="name">
                    <ClubName>{row?.member?.phoneNumber}</ClubName>
                  </td>
                  <td className="name">
                    {row?.member?.statusPayment === "Gratis" ? (
                      <span
                        className="py-1 px-2"
                        style={{
                          color: "#05944F",
                          backgroundColor: "#DAF0E3",
                          borderRadius: "25px",
                        }}
                      >
                        {row.statusPayment}
                      </span>
                    ) : row?.member?.statusPayment === "Belum Lunas" ? (
                      <span
                        className="py-1 px-2"
                        style={{
                          color: "#FFB420",
                          backgroundColor: "#FFE8BA",
                          borderRadius: "25px",
                        }}
                      >
                        {row.statusPayment}
                      </span>
                    ) : row?.member?.statusPayment === "Expired" ? (
                      <span
                        className="py-1 px-2"
                        style={{
                          color: "#FFB420",
                          backgroundColor: "#AFAFAF",
                          borderRadius: "25px",
                        }}
                      >
                        {row.statusPayment}
                      </span>
                    ) : (
                      row?.member?.statusPayment === "Lunas" && (
                        <span
                          className="py-1 px-2"
                          style={{
                            color: "#05944F",
                            backgroundColor: "#DAF0E3",
                            borderRadius: "25px",
                          }}
                        >
                          {row.statusPayment}
                        </span>
                      )
                    )}
                  </td>

                  {/* Gak perlu tombol atur kategori di beregu kurasa */}
                  {!isTeam && (
                    <td className="cell-nowrap">
                      {row?.member?.statusPayment === "Lunas" ? (
                        <ButtonOutlineBlue
                          onClick={() => {
                            onConfirm(row?.member?.participantId);
                            setIdParticipant(row?.member?.participantId);
                          }}
                        >
                          Atur Kategori
                        </ButtonOutlineBlue>
                      ) : (
                        <ButtonOutlineBlue disabled>Atur Kategori</ButtonOutlineBlue>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </MembersTable>
      </TableContainer>

      <SweetAlert
        show={isOpenAlert}
        title=""
        onConfirm={() => {}}
        custom
        style={{ width: 1100, borderRadius: "1.25rem" }}
        customButtons={
          <span className="d-flex justify-content-end" style={{ gap: "0.5rem", width: "100%" }}>
            <Button onClick={onCancel} style={{ color: "var(--ma-blue)" }}>
              Batal
            </Button>
            <ButtonBlue onClick={onUpdateCategory}>Ubah</ButtonBlue>
          </span>
        }
      >
        <div style={{ textAlign: "start" }}>
          <span>Kategori Lomba</span>
          <br />
          <span>Silakan pilih salah satu kategori lomba</span>
        </div>
        <div style={{ height: "500px", overflowY: "auto", overflowX: "hidden" }}>
          <Row>
            {dataCategories.map((catagory) => {
              return (
                <Col key={catagory.id} md={4}>
                  <div
                    onClick={() => setCategoryId(catagory.id)}
                    className="py-4 ps-2 mt-3"
                    style={{
                      border: "1px solid #E2E2E2",
                      borderRadius: "5px",
                      textAlign: "start",
                      cursor: "pointer",
                      backgroundColor: `${catagory.id === categoryId ? "#E7EDF6" : "#FFF"}`,
                    }}
                  >
                    <span style={{ fontSize: "18px", fontWeight: "600" }}>
                      {catagory.labelCategory}
                    </span>
                    <div className="mt-3">
                      <span
                        className="px-2 py-1"
                        style={{ backgroundColor: "#AEDDC2", borderRadius: "25px" }}
                      >
                        Sisa kuota 0 dari {catagory.quota}
                      </span>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </SweetAlert>

      <SweetAlert
        show={isUpdateCategory}
        title=""
        onConfirm={() => {}}
        custom
        style={{ width: 740, borderRadius: "1.25rem" }}
        customButtons={
          <span className="d-flex justify-content-center" style={{ gap: "0.5rem", width: "100%" }}>
            <ButtonBlue onClick={onBackToList}>Lanjut ke Data Peserta</ButtonBlue>
          </span>
        }
      >
        <div>
          <div>
            <img src={logoUpdate} />
          </div>
          <div>
            <span style={{ fontWeight: "600", fontSize: "18px" }}>
              Atur Kategori Peserta Berhasil
            </span>
            <br />
            <span>Data kategori peserta telah diubah</span>
          </div>
        </div>
      </SweetAlert>
    </React.Fragment>
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
  position: relative;
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
    vertical-align: middle;

    &.name {
      text-align: left;
    }

    &.stats {
      text-align: right;
    }

    &.cell-nowrap {
      white-space: nowrap;
    }
  }

  th,
  td {
    cursor: auto;
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

export { MemberTable };
