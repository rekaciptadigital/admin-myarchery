import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";

import { List, ListInlineItem } from "reactstrap";
import { LoadingScreen } from "components";
import { Button, ButtonBlue } from "components/ma";
import NewEventPreview from "./NewEventPreview";

const StyledPreviewContainer = styled.div`
  --preview-toolbar-height: 70px;

  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;

  .inner-container {
    height: 100vh;
    position: relative;

    .preview-toolbar-top,
    .preview-content {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    .preview-toolbar-top {
      z-index: 20;
      height: var(--preview-toolbar-height);
      background-color: #ffffff;
      box-shadow: 0 0.25rem 0.8rem rgb(18 38 63 / 7.5%);
    }

    .preview-content {
      top: var(--preview-toolbar-height);
      z-index: 10;
      overflow-y: auto;
      background-color: var(--bs-body-bg);
    }
  }
`;

function FullScreenPreviewContainer({ children, isLoading, onClose, onSave, onPublish }) {
  const handleSaveEvent = () => onSave?.();
  const handlePublishEvent = () => onPublish?.();

  React.useEffect(() => {
    // Mencegah scrolling dari konten asli halaman form
    // ketika preview terbuka
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    // cleanup, kembalikan
    return function () {
      document.body.style.overflow = "unset";
      document.body.style.height = "unset";
    };
  }, []);

  return (
    <StyledPreviewContainer>
      <div className="inner-container">
        <div className="preview-toolbar-top">
          <div className="navbar-header" style={{ paddingLeft: 12 }}>
            <div className="d-flex">
              <h3 className="m-0">Preview</h3>
            </div>

            <List className="d-none d-lg-flex my-auto">
              <ListInlineItem className="d-flex justify-content-center align-items-center">
                <Button style={{ width: 100, color: "var(--ma-blue)" }} onClick={() => onClose?.()}>
                  Ubah
                </Button>
              </ListInlineItem>

              <ListInlineItem className="d-flex justify-content-center align-items-center">
                <Button onClick={handleSaveEvent} style={{ width: 100, color: "var(--ma-blue)" }}>
                  Simpan
                </Button>
              </ListInlineItem>

              <ListInlineItem className="d-flex justify-content-center align-items-center">
                <ButtonBlue onClick={handlePublishEvent} style={{ width: 100 }}>
                  Publikasi
                </ButtonBlue>
              </ListInlineItem>
            </List>
          </div>
        </div>
        <div className="preview-content">{children}</div>
      </div>
      <LoadingScreen loading={isLoading} />
    </StyledPreviewContainer>
  );
}

function PreviewPortal({ isActive, isLoading, eventData, onClose, onSave, onPublish }) {
  const portalRef = React.useRef(null);

  React.useEffect(() => {
    const portalTargetDOM = document.createElement("div");
    portalRef.current = portalTargetDOM;

    portalTargetDOM.setAttribute("id", "preview-event-landing");
    document.body.appendChild(portalTargetDOM);

    return function () {
      portalTargetDOM.remove();
    };
  }, []);

  if (portalRef.current && isActive) {
    return ReactDOM.createPortal(
      <FullScreenPreviewContainer
        isLoading={isLoading}
        onClose={onClose}
        onSave={onSave}
        onPublish={onPublish}
      >
        <NewEventPreview eventData={eventData} />
      </FullScreenPreviewContainer>,
      portalRef.current
    );
  }

  return null;
}

export { PreviewPortal };