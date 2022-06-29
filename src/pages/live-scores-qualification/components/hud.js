import * as React from "react";
import styled from "styled-components";
import { useDisplaySettings } from "../contexts/display-settings";

import { DisplaySettings } from "./display-settings";
import { MenuSessionOptions } from "./menu-session-options";

import IconDot from "components/ma/icons/mono/dot";

import classnames from "classnames";
import { datetime } from "utils";

import logo from "assets/images/myachery/myachery.png";

function HUD() {
  const { sessionNumber, setSessionNumber, isSessionSet } = useDisplaySettings();
  return (
    <SectionTop>
      <Header>
        <Infos>
          <div>
            <span className="logo-sm">
              <img src={logo} alt="" height="64" />
            </span>
          </div>
          <MainTitleContainer>
            <EventTitle>
              Judul Event Ini Panjang Anti Lorem Ipsum Lorem Ipsum Club Anti Lorem Ipsum Lorem Ipsum
              Club
            </EventTitle>
            {isSessionSet ? (
              <div>
                Kualifikasi | Terakhir diperbarui: {datetime.formatFullDateLabel(new Date())}
              </div>
            ) : (
              <div>Kualifikasi</div>
            )}
          </MainTitleContainer>
        </Infos>

        <Settings>
          <MenuSessionOptions
            sessionCount={2}
            sessionNumber={sessionNumber}
            onSelect={(value) => setSessionNumber(value)}
          >
            <LabelLiveScore className={classnames({ "label-is-live": isSessionSet })}>
              {isSessionSet ? (
                <React.Fragment>
                  <LiveScoreIndicator isLive />
                  {sessionNumber > 0 ? (
                    <span>Live Score Kualifikasi Sesi {sessionNumber}</span>
                  ) : (
                    <span>Live Score Kualifikasi Semua Sesi</span>
                  )}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <LiveScoreIndicator />
                  <span>Pilih Sesi Live Score</span>
                </React.Fragment>
              )}
            </LabelLiveScore>
          </MenuSessionOptions>
          <DisplaySettings
            sessionNumber={sessionNumber}
            onChangeSession={(value) => setSessionNumber(value)}
          />
        </Settings>
      </Header>
    </SectionTop>
  );
}

function LiveScoreIndicator({ isLive = false }) {
  return (
    <LiveScoreIndicatorWrapper className={classnames({ "indicator-is-live": isLive })}>
      <IconDot size="14" />
    </LiveScoreIndicatorWrapper>
  );
}

/* ========================= */
// styles

const SectionTop = styled.div`
  > * + * {
    margin-top: 1.25rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const Infos = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--ma-gray-500);

  > *:nth-child(1) {
    flex-shrink: 0;
  }

  > *:nth-child(2) {
    flex-grow: 1;
  }
`;

const MainTitleContainer = styled.div`
  max-width: 56.25rem;
`;

const EventTitle = styled.h1`
  margin: 0;
  color: var(--ma-blue);
  font-size: 1.25rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const Settings = styled.div`
  display: flex;
`;

const LabelLiveScore = styled.span`
  cursor: pointer;
  user-select: none;
  display: inline-block;
  min-height: 2.5rem;
  padding: 0.25rem 0.75rem;
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
  background-color: var(--ma-gray-200);

  color: var(--ma-gray-500);
  font-size: 1.25rem;
  font-weight: 600;
  text-transform: uppercase;
  text-align: center;
  vertical-align: middle;

  margin-right: 2px;

  > * + * {
    margin-left: 0.5rem;
  }

  &.label-is-live {
    color: var(--ma-blue);
  }

  transition: all 0.15s ease-in;

  &:hover {
    background-color: var(--ma-gray-100);
    color: var(--ma-blue);
  }
`;

const LiveScoreIndicatorWrapper = styled.span`
  color: var(--ma-gray-400);

  &.indicator-is-live {
    color: var(--ma-text-negative);
  }
`;

export { HUD };
