function renderTemplateString(editorData) {
  const documentTitle = editorData.title || "My Archery Certificate";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>${documentTitle}</title>
    <style>
      @page {
        margin: 0px;
        ${renderCssBackgroundImage(editorData.backgroundImage)}
      }

      body {
        position: relative;
        margin: 0px;
        padding: 0px;
        font-family: "DejaVu Sans", sans-serif;
      }

      .field-text {
        position: absolute;
        left: 0px;
        right: 0px;
        text-align: center;
      }

      .qr-code-container {
        position: absolute;
        right: 20px;
        bottom: 20px;
        padding: 2.5mm;
        width: 25mm;
        height: 25mm;
        background-color: white;
      }

      .qr-code-img {
        margin: 0;
      }

      ${renderCssField("member_name", editorData.fields[0])}
      ${renderCssField("peringkat_name", editorData.fields[1])}
      ${renderCssField("kategori_name", editorData.fields[2])}
    </style>
  </head>

  <body>
    ${renderFieldText("member_name")}
    ${editorData.typeCertificate === 2 ? renderFieldText("peringkat_name") : ""}
    ${renderFieldText("kategori_name")}
    ${renderQrCode()}
  </body>
</html>`;
}

const renderCssBackgroundImage = (backgroundImage) => {
  if (backgroundImage) {
    return `
        background-image: url(${backgroundImage});
        background-image-resize: 6; /* properti custom mpdf, mirip background-size: cover */`;
  }
  return "";
};

function renderCssField(name, data = {}) {
  const { y, fontFamily, fontWeight, fontSize, color } = data;

  const computeColor = () => (color ? `color: ${color};` : "");
  const computeFontWeight = () => fontWeight || "normal";

  return `
      #field-${name} {
        top: ${y}px;
        ${computeColor()}
        font-family: ${fontFamily};
        font-size: ${fontSize}px;
        font-weight: ${computeFontWeight()};
      }`;
}

function renderFieldText(name) {
  const placeholderString = `{%${name}%}`;
  return `<div class="field-text" id="field-${name}">${placeholderString}</div>`;
}

function renderQrCode() {
  const urlPlaceholder = "{%sertif_verif_url%}";
  return `
    <div class="qr-code-container">
      <barcode
        class="qr-code-img"
        code="${urlPlaceholder}"
        type="QR"
        error="M"
        class="barcode"
        size="1"
        disableborder="1" />
    </div>`;
}

export { renderTemplateString };
