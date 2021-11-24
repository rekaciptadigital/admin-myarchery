import * as React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { CertificateService } from "services";
import {
  optionsFontSize,
  optionsFontFamily,
  optionsTypeCertificate,
  getCurrentTypeCertificate,
  getSelectedFontFamily,
  renderTemplateString,
  convertBase64,
} from "../utils";
import { DEJAVU_SANS } from "../utils/font-family-list";

import { Container, Col, Row, Card, Button, Modal, ModalBody } from "reactstrap";
import { CompactPicker } from "react-color";
import Select from "react-select";

import { Breadcrumbs } from "components";
import EditorBgImagePicker from "../components/EditorBgImagePicker";
import EditorCanvasHTML from "../components/EditorCanvasHTML";
import FontBoldToggle from "../components/FontBoldToggle";
import ColorPickerContainer from "../components/ColorPickerContainer";
import PreviewCanvas from "../components/preview/PreviewCanvas";

const defaultEditorData = {
  paperSize: "A4", // || [1280, 908] || letter
  backgroundUrl: undefined,
  backgroundPreviewUrl: undefined,
  backgroundFileRaw: undefined,
  backgroundImage: undefined, // base64, yang nanti diupload
  fields: [
    {
      name: "member_name",
      x: 640,
      y: 280,
      fontFamily: DEJAVU_SANS,
      fontSize: 60,
    },
    {
      name: "peringkat_name",
      x: 640,
      y: 370,
      fontFamily: DEJAVU_SANS,
      fontSize: 36,
    },
    {
      name: "kategori_name",
      x: 640,
      y: 430,
      fontFamily: DEJAVU_SANS,
      fontSize: 36,
    },
  ],
};

export default function CertificateNew() {
  const [currentCertificateType, setCurrentCertificateType] = React.useState(1);
  const [status, setStatus] = React.useState("idle");
  const [editorData, setEditorData] = React.useState(null);
  const [currentObject, setCurrentObject] = React.useState(null);

  const [isModePreview, setModePreview] = React.useState(false);

  const isSaving = status === "saving";
  const isLoading = status === "loading";

  const image = {
    preview:
      editorData?.backgroundUrl ||
      editorData?.backgroundPreviewUrl ||
      editorData?.backgroundImage ||
      null,
    raw: editorData?.backgroundFileRaw || null,
  };

  const event_id = new URLSearchParams(useLocation().search).get("event_id");

  React.useEffect(() => {
    setStatus("loading");

    const getCertificateData = async () => {
      const queryString = { event_id, type_certificate: currentCertificateType };
      const { data: certificate } = await CertificateService.getForEditor(queryString);

      if (certificate) {
        // Data editor dari data sertifikat yang sudah ada di server
        const editorDataGet = JSON.parse(certificate.editorData);
        setEditorData({
          ...defaultEditorData,
          typeCertificate: currentCertificateType,
          certificateId: certificate.id,
          backgroundUrl: certificate.backgroundUrl,
          backgroundImage: editorDataGet.backgroundImage, // sudah base64, karena hasil dari save sebelumnya
          fields: editorDataGet.fields,
        });
      } else {
        // Dari yang belum ada, dikenali dari gak ada `certificateId`-nya
        setEditorData({
          ...defaultEditorData,
          typeCertificate: currentCertificateType,
        });
      }
      setStatus("done");
    };

    getCertificateData();
  }, [currentCertificateType]);

  React.useEffect(() => {
    if (!currentObject) {
      return;
    }
    setEditorData((editorData) => {
      const fieldsUpdated = editorData.fields.map((field) => {
        if (field.name === currentObject.name) {
          return currentObject;
        }
        return field;
      });

      return {
        ...editorData,
        fields: fieldsUpdated,
      };
    });
  }, [currentObject]);

  /**
   * 1. Simpan data editor untuk sertifikat yang sedang aktif
   * 2. Ganti ke current certificate
   */
  const handleTipeSertifikatChange = async (ev) => {
    if (parseInt(ev.value) === parseInt(editorData.typeCertificate)) {
      return;
    }

    setStatus("saving");
    const queryString = { event_id, type_certificate: currentCertificateType };
    const data = await prepareSaveData(editorData, queryString);

    const result = await CertificateService.save(data);
    if (result.success || result.data) {
      const editorDataCreated = JSON.parse(result.data.editorData);
      setEditorData((editorData) => ({
        ...editorData,
        ...editorDataCreated,
        certificateId: result.data.id,
      }));
    }
    setCurrentCertificateType(ev.value);
    setStatus("done");
    setCurrentObject(null);
  };

  const handleEditorChange = (data) => {
    setCurrentObject((currentData) => ({
      ...currentData,
      ...data,
    }));
  };

  const handleFontSizeChange = (ev) => {
    const { value } = ev;
    setCurrentObject((currentData) => ({
      ...currentData,
      fontSize: value,
    }));
  };

  const handleFontFamilyChange = (ev) => {
    const { value } = ev;
    setCurrentObject((currentData) => ({
      ...currentData,
      fontFamily: value,
    }));
  };

  const handleFontColorChange = (color) => {
    setCurrentObject((currentData) => ({
      ...currentData,
      color: color.hex,
    }));
  };

  const handleFontBoldChange = () => {
    setCurrentObject((currentData) => ({
      ...currentData,
      fontWeight: currentData.fontWeight ? undefined : "bold",
    }));
  };

  const handleSelectBg = (imageData) => {
    if (!imageData) {
      return;
    }
    const imagePreviewUrl = URL.createObjectURL(imageData);
    setEditorData((data) => {
      return {
        ...data,
        backgroundPreviewUrl: imagePreviewUrl,
        backgroundFileRaw: imageData,
      };
    });
  };

  const handleHapusBg = () => {
    setEditorData((data) => {
      return {
        ...data,
        backgroundPreviewUrl: undefined,
        backgroundFileRaw: undefined,
        backgroundUrl: null,
        backgroundImage: null,
      };
    });
  };

  const handleClickSave = async () => {
    setStatus("saving");
    const queryString = { event_id, type_certificate: currentCertificateType };
    const data = await prepareSaveData(editorData, queryString);

    const result = await CertificateService.save(data);
    if (result.data) {
      const editorDataSaved = JSON.parse(result.data.editorData);
      setEditorData((editorData) => ({
        ...editorData,
        ...editorDataSaved,
        certificateId: result.data.id,
      }));
    }

    setStatus("done");
  };

  const handleOpenPreview = () => setModePreview(true);
  const handleClosePreview = () => setModePreview(false);
  const handleTogglePreview = () => setModePreview((isModePreview) => !isModePreview);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Dashboards" breadcrumbItems={[{ title: "Dashboard" }]} />

        {/* Konten */}
        <Row>
          <Col lg="12">
            <Row>
              <Col lg="8">
                <h1>Sertifikat Event</h1>
                <p>
                  Klik untuk mengubah jenis dan ukuran teks. Geser untuk mengatur komposisi
                  sertifikat.
                </p>
              </Col>

              <Col lg="4">
                <EditorActionButtons>
                  <div>
                    <Select
                      options={optionsTypeCertificate}
                      placeholder="Tipe Sertifikat"
                      value={getCurrentTypeCertificate(currentCertificateType)}
                      onChange={(ev) => handleTipeSertifikatChange(ev)}
                      isDisabled={isSaving || isLoading}
                    />
                  </div>

                  <div>
                    <Button
                      tag="a"
                      color="primary"
                      onClick={() => handleClickSave()}
                      disabled={isSaving || isLoading}
                    >
                      Save
                    </Button>
                  </div>

                  <div>
                    <Button
                      tag="a"
                      color="secondary"
                      outline
                      onClick={() => handleOpenPreview()}
                      disabled={isSaving || isLoading}
                    >
                      Preview
                    </Button>

                    <Modal
                      isOpen={isModePreview}
                      size="lg"
                      autoFocus={true}
                      centered={true}
                      className="modalPreview"
                      tabIndex="-1"
                      toggle={() => handleTogglePreview()}
                    >
                      <ModalBody>
                        <PreviewCanvas data={editorData} />
                        <div className="mt-4 mb-2 text-center">
                          <Button color="primary" onClick={() => handleClosePreview()}>
                            Tutup
                          </Button>
                        </div>
                      </ModalBody>
                    </Modal>
                  </div>

                  {isSaving && <div className="indicator-message">Saving certificate...</div>}
                  {isLoading && <div className="indicator-message">Loading certificate...</div>}
                </EditorActionButtons>
              </Col>
            </Row>

            <Row>
              <Col lg="8">
                <Card>
                  {editorData ? (
                    <React.Fragment>
                      <EditorCanvasHTML
                        data={editorData}
                        onChange={(data) => handleEditorChange(data)}
                        currentObject={currentObject}
                        onSelect={(target) => setCurrentObject(target)}
                      />
                      {(isSaving || isLoading) && <ProcessingBlocker />}
                    </React.Fragment>
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{ height: 160 }}
                    >
                      Preparing editor...
                    </div>
                  )}
                </Card>
              </Col>

              <Col lg="4">
                <div className="ratio ratio-16x9">
                  <EditorBgImagePicker
                    image={image}
                    onSelectImage={(imageData) => handleSelectBg(imageData)}
                    onRemoveImage={() => handleHapusBg()}
                  />
                  {(isSaving || isLoading) && <ProcessingBlocker />}
                </div>

                {currentObject?.name && (
                  <div className="mt-5">
                    <div>
                      <label>Font family:</label>
                      <Select
                        options={optionsFontFamily}
                        placeholder="Font Family"
                        value={getSelectedFontFamily(optionsFontFamily, currentObject)}
                        onChange={(ev) => handleFontFamilyChange(ev)}
                      />
                    </div>

                    <div className="mt-2">
                      <label>Font size:</label>
                      <Select
                        options={optionsFontSize}
                        placeholder="font size"
                        value={{
                          value: currentObject?.fontSize,
                          label: currentObject?.fontSize,
                        }}
                        onChange={(ev) => handleFontSizeChange(ev)}
                      />
                    </div>

                    <div className="mt-2">
                      <label>Font color:</label>
                      <div>
                        <ColorPickerContainer color={currentObject?.color}>
                          <CompactPicker
                            color={currentObject?.color}
                            onChange={(color) => handleFontColorChange(color)}
                          />
                        </ColorPickerContainer>
                      </div>
                    </div>

                    <div className="mt-2">
                      <label>Bold?</label>
                      <div>
                        <FontBoldToggle
                          bold={currentObject?.fontWeight}
                          onChange={() => handleFontBoldChange()}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

const EditorActionButtons = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 10px;

  & > * {
    flex: 1 1 30%;

    :first-child {
      flex: 1 0 40%;
    }
  }

  & > * > a {
    display: block;
  }

  .indicator-message {
    position: absolute;
    bottom: -1.8em;
  }
`;

async function prepareSaveData(editorData, qs) {
  const dataCopy = { ...editorData };

  if (dataCopy.backgroundFileRaw) {
    dataCopy.backgroundImage = await convertBase64(dataCopy.backgroundFileRaw);
  } else {
    dataCopy.backgroundImage = dataCopy.backgroundImage || null;
  }

  const certificateHtmlTemplate = renderTemplateString(dataCopy);
  const templateInBase64 = btoa(certificateHtmlTemplate);

  const payload = {
    event_id: parseInt(qs.event_id),
    type_certificate: dataCopy.typeCertificate,
    html_template: templateInBase64,
    background_url: dataCopy.backgroundUrl || null,
    editor_data: JSON.stringify({
      ...dataCopy,
      backgroundFileRaw: undefined,
      backgroundPreviewUrl: undefined,
    }),
  };

  return payload;
}

function ProcessingBlocker() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ffffff",
        opacity: 0.5,
      }}
    />
  );
}
