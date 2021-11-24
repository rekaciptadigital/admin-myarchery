import * as React from "react";
import styled from "styled-components";
import PreviewFieldText from "./PreviewFieldText";
import QrCodeField from "../QrCodeField";

export default function PreviewCanvas({ data }) {
  const { backgroundImage, backgroundUrl, backgroundPreviewUrl, fields } = data;
  const containerDiv = React.useRef(null);

  const getBackgroundImage = () => backgroundUrl || backgroundPreviewUrl || backgroundImage;

  return (
    <PreviewCanvasContainer ref={containerDiv} ratio={908 / 1280}>
      <PreviewImage
        width={1280}
        height={908}
        backgroundImage={getBackgroundImage()}
        scale={containerDiv.current?.offsetWidth / 1280}
      >
        {fields?.length ? (
          fields.map((field) => {
            if (field.name === "peringkat_name" && data.typeCertificate !== 2) {
              return;
            }
            return <PreviewFieldText key={field.name} name={field.name} data={field} />;
          })
        ) : (
          <div>Ada error pada data editor</div>
        )}

        <QrCodeField preview />
      </PreviewImage>

      <PreviewBlocker />
    </PreviewCanvasContainer>
  );
}

const PreviewCanvasContainer = styled.div`
  position: relative;
  height: 0;
  padding-bottom: ${({ ratio }) => 100 * ratio}%;
  overflow: hidden;
`;

const PreviewImage = styled.div`
  position: relative;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  background-color: white;
  background-image: url(${({ backgroundImage }) => backgroundImage});
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  transform: scale(${({ scale }) => scale});
  transform-origin: top left;
`;

const PreviewBlocker = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
`;
