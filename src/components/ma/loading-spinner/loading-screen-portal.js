import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import { FadeLoader } from "react-spinners";

function LoadingScreen({ loading: isLoading, message }) {
  const portalRef = React.useRef(null);

  React.useEffect(() => {
    const portalTargetDOM = document.createElement("div");
    portalRef.current = portalTargetDOM;

    portalTargetDOM.setAttribute("class", "loading-screen-spinner");
    document.body.appendChild(portalTargetDOM);

    return function () {
      portalTargetDOM.remove();
    };
  }, []);

  if (!portalRef.current || !isLoading) {
    return null;
  }

  return ReactDOM.createPortal(
    <FullpageContainer>
      <FullViewportLoading>
        <div className="spinner-container">
          <FadeLoader color="white" loading={isLoading} />
        </div>
        {message && <p className="wait-message">{message}</p>}
      </FullViewportLoading>
    </FullpageContainer>,
    portalRef.current
  );
}

const FullpageContainer = styled.div`
  position: fixed;
  z-index: 5000;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const FullViewportLoading = styled.div`
  width: 100%;
  height: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  background: radial-gradient(rgba(20, 20, 20, 0.8), rgba(0, 0, 0, 0.8));
  text-align: center;

  .spinner-container {
    width: 60px;
    height: 60px;

    > * {
      display: block;
    }
  }

  .wait-message {
    color: #ffffff;
    font-weight: 600;
  }
`;

export { LoadingScreen };
