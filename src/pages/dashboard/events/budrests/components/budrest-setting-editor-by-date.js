import * as React from "react";
import styled from "styled-components";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useFormBudrestSettings } from "../hooks/form-budrest-settings";
import { useSubmitBudrestSettings } from "../hooks/submit-budrest-settings";
import { ButtonDownloadIdCard } from "../hooks/button-download-id-card";

import { ButtonBlue, ButtonOutlineBlue, AlertSubmitError } from "components/ma";
import { LoadingScreen } from "../../new/components/loading-screen-portal";
import { FieldInputDateSmall, FieldInputTextSmall } from "../../components/form-fields";
import { DisplayTextSmall } from "./display-text-small";
import { ButtonConfirmPrompt } from "./button-confirm-prompt";
import { toast } from "components/ma/processing-toast";
import { formatServerDate } from "../../new/utils/datetime";
import { useIdcardDownloadBudrest } from "../hooks/download-idcard-budrest";

function BudrestSettingEditorByDate({ settingsByDate }) {
  const history = useNavigate();
  const { event_id } = useParams();
  const eventId = parseInt(event_id);

  const {
    data: formSettings,
    updateFieldStart,
    updateFieldEnd,
    updateFieldTargetFace,
    getValidationProps,
    isSubmitAllowed,
  } = useFormBudrestSettings(settingsByDate);

  const dateString = formatServerDate(settingsByDate.date);

  const {
    submit,
    isLoading: isSubmiting,
    isError: isErrorSubmit,
    errors: errorsSubmit,
  } = useSubmitBudrestSettings(formSettings, eventId);

  const {
    download: downloadIDCard,
    isError: isErrorDownloadIDCard,
    errors: errorsDownloadIDCard,
  } = useIdcardDownloadBudrest(eventId);

  return (
    <React.Fragment>
      <LoadingScreen loading={isSubmiting} />
      <AlertSubmitError isError={isErrorSubmit} errors={errorsSubmit} />
      <AlertSubmitError isError={isErrorDownloadIDCard} errors={errorsDownloadIDCard} />

      <DayGroup>
        <VerticalSpacedBox>
          <SpacedHeader>
            <SpacedHeaderLeft>
              <FieldInputDateSmall
                label="Bertanding Tanggal"
                disabled
                value={settingsByDate.date}
              />
              <div style={{ marginTop: "24px" }}>
                <ButtonDownloadIdCard
                  buttonLabel="Unduh No. Bantalan Peserta"
                  sessionCount={3}
                  disabled={!isSubmitAllowed}
                  onDownload={(type) => {
                    toast.loading("Sedang menyiapkan file data...");
                    downloadIDCard(dateString, type, {
                      onSuccess: () => {
                        toast.dismiss();
                      },
                      onError: () => {
                        toast.dismiss();
                        toast.error("Gagal memulai unduhan");
                      },
                    });
                  }}
                />
              </div>
            </SpacedHeaderLeft>

            <HorizontalSpacedButtonGroups>
              {Boolean(settingsByDate.isSettingApplied) && (
                <ButtonOutlineBlue as={Link} to={getDetailUrl(eventId, dateString)}>
                  Ubah Bantalan Peserta
                </ButtonOutlineBlue>
              )}

              <ButtonConfirmPrompt
                customButton={ButtonBlue}
                disabled={!isSubmitAllowed}
                onConfirm={() => {
                  submit({
                    onSuccess() {
                      const detailUrl = getDetailUrl(eventId, dateString);
                      history.push(detailUrl);
                    },
                  });
                }}
                messagePrompt="Sudah Yakin dengan Pengaturan Bantalan?"
                messageDescription={
                  <React.Fragment>
                    Anda akan melakukan generate bantalan ke peserta.
                    <br />
                    Bantalan masih dapat diubah sebelum pertandingan dimulai.
                  </React.Fragment>
                }
                buttonCancelLabel="Cek Lagi"
                buttonConfirmLabel="Masukkan Bantalan ke Peserta"
              >
                Terapkan
              </ButtonConfirmPrompt>
            </HorizontalSpacedButtonGroups>
          </SpacedHeader>

          <DetailList>
            <VerticalSpacedBox>
              {formSettings.map((setting) => (
                <DetailItem key={setting.key}>
                  <DetailInput>
                    <div title={setting.categoryDetailLabel}>
                      <DisplayTextSmall
                        label="Kategori"
                        displayValue={setting.categoryDetailLabel}
                      />
                    </div>

                    <BudrestInputGroup>
                      {setting.totalParticipant ? (
                        <React.Fragment>
                          <FieldInputTextSmall
                            name={`${setting.key}-start`}
                            placeholder="0"
                            disabled={!setting.totalParticipant}
                            value={setting.start}
                            onChange={(ev) => updateFieldStart(setting.key, ev.target.value)}
                            {...getValidationProps(setting.key, "start")}
                          >
                            Awal Bantalan
                          </FieldInputTextSmall>

                          <FieldInputTextSmall
                            name={`${setting.key}-end`}
                            placeholder="0"
                            disabled={!setting.totalParticipant}
                            value={setting.end}
                            onChange={(ev) => updateFieldEnd(setting.key, ev.target.value)}
                            {...getValidationProps(setting.key, "end")}
                          >
                            Akhir Bantalan
                          </FieldInputTextSmall>

                          <FieldInputTextSmall
                            name={`${setting.key}-targetFace`}
                            placeholder="0"
                            disabled={!setting.totalParticipant}
                            value={setting.targetFace}
                            onChange={(ev) => {
                              updateFieldTargetFace(setting.key, ev.target.value);
                            }}
                            {...getValidationProps(setting.key, "targetFace")}
                          >
                            Target Face
                          </FieldInputTextSmall>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <DisplayTextSmall
                            label="Awal Bantalan"
                            displayValue={<React.Fragment>&ndash;</React.Fragment>}
                          />

                          <DisplayTextSmall
                            label="Akhir Bantalan"
                            displayValue={<React.Fragment>&ndash;</React.Fragment>}
                          />

                          <DisplayTextSmall
                            label="Target Face"
                            displayValue={<React.Fragment>&ndash;</React.Fragment>}
                          />
                        </React.Fragment>
                      )}

                      <DisplayTextSmall
                        noBorder
                        displayValue={
                          setting.totalParticipant || (
                            <React.Fragment>Tidak ada peserta</React.Fragment>
                          )
                        }
                      >
                        Total Peserta
                      </DisplayTextSmall>
                    </BudrestInputGroup>
                  </DetailInput>
                </DetailItem>
              ))}
            </VerticalSpacedBox>
          </DetailList>
        </VerticalSpacedBox>
      </DayGroup>
    </React.Fragment>
  );
}

const VerticalSpacedBox = styled.div`
  > * + * {
    margin-top: 1.5rem;
  }
`;

const DayGroup = styled.div`
  padding: 1rem;
  border: 1px solid var(--ma-gray-200);
  border-radius: 0.5rem;
`;

const SpacedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  > *:nth-child(1) {
    flex-grow: 1;
  }

  > *:nth-child(2) {
    flex-shrink: 0;
  }
`;

const SpacedHeaderLeft = styled.div`
  display: flex;
  gap: 1rem;

  > * {
    max-width: 13rem;
    // flex: 1;
  }
`;

const HorizontalSpacedButtonGroups = styled.div`
  > * + * {
    margin-left: 0.5rem;
  }
`;

const DetailList = styled.div`
  position: relative;
  padding: 1rem;
  border: 1px solid var(--ma-gray-100);
  border-radius: 0.25rem;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  > *:nth-child(1) {
    flex-grow: 1;
  }

  > *:nth-child(2) {
    flex-shrink: 0;
  }
`;

const DetailInput = styled.div`
  display: flex;
  gap: 1rem;

  > *:nth-child(1) {
    max-width: 20rem;
    flex: 1;
  }

  > *:nth-child(2) {
    width: 0;
    flex: 1;
  }
`;

const BudrestInputGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  > * {
    max-width: 6.375rem;
    flex: 1;

    &:last-child {
      max-width: max-content;
    }
  }
`;

/* ===================================== */
// utils

function getDetailUrl(eventId, dateString) {
  if (!eventId) {
    return "#";
  }
  if (!dateString) {
    return `/dashboard/event/${eventId}/budrests/detail`;
  }
  return `/dashboard/event/${eventId}/budrests/detail?date=${dateString}`;
}

export { BudrestSettingEditorByDate };
