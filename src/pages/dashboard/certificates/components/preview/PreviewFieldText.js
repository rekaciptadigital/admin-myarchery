import * as React from "react";
import styled from "styled-components";

const previewTexts = {
  member_name: "Morgan Lundin",
  peringkat_name: "Juara 1",
  kategori_name: "Individu - Umum - Barebow - 50mm",
};

export default function PreviewFieldText({ name, data = {} }) {
  const { y, fontFamily, fontSize, color, fontWeight } = data;
  const divRef = React.useRef(null);
  const [currentOffsetWidth, setCurrentOffsetWidth] = React.useState(0);
  const placeholderString = previewTexts[name];

  React.useEffect(() => {
    setCurrentOffsetWidth(divRef.current?.offsetWidth);
  }, []);

  return (
    <FieldTextContainer
      ref={divRef}
      left={1280 / 2 - currentOffsetWidth / 2 || 0}
      fontSize={fontSize}
      color={color}
      y={y}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
    >
      {placeholderString}
    </FieldTextContainer>
  );
}

const FieldTextContainer = styled.div`
  position: absolute;
  top: 0;
  left: ${({ left }) => left}px;
  font-size: ${({ fontSize }) => fontSize || 60}px;
  ${({ color }) => (color ? `color: ${color};` : "")}
  transform: translate(0px, ${({ y }) => y}px);
  ${({ fontFamily }) => (fontFamily ? `font-family: ${fontFamily};` : "")}
  font-weight: ${({ fontWeight }) => fontWeight || "normal"};
`;
