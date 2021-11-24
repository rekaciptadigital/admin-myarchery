import * as React from "react";
import styled from "styled-components";
import { Card, CardBody } from "reactstrap";

export default function CardMenu({ menu, href }) {
  return (
    <CardMenuContainer>
      <CardBody>
        <div className="menu-icon mb-3">
          <img className="menu-icon-img" src={menu.icon} />
        </div>

        <h3>{menu.title}</h3>
        <p>{menu.description}</p>

        <div className="float-end">
          <a className="menu-link" href={href}>
            <i className="bx bx-right-arrow-alt fs-3 text-primary" />
          </a>
        </div>
      </CardBody>
    </CardMenuContainer>
  );
}

const CardMenuContainer = styled(Card)`
  overflow: hidden;
  transition: all 0.4s;

  &::before {
    content: " ";
    --radius: 300px;

    position: absolute;
    width: var(--radius);
    height: var(--radius);
    border-radius: var(--radius);

    opacity: 0;
    background-color: #0d47a1;

    transform: translate(-40%, -50%) scale(0);
    transition: all 0.4s;
  }

  .card-body {
    z-index: 10;
  }

  .menu-icon {
    --icon-radius: 50px;
    width: var(--icon-radius);
    height: var(--icon-radius);

    &::before {
      content: " ";
      position: absolute;
      transition: all 0.4s;

      width: var(--icon-radius);
      height: var(--icon-radius);
      border-radius: var(--icon-radius);

      background-color: #fff971;

      transform: scale(0);
    }

    .menu-icon-img {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
    }
  }

  .menu-link::before {
    content: " ";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  &:hover {
    box-shadow: 0 0.75rem 2.5rem rgb(18 38 63 / 12.5%);
    transform: translateY(-0.05rem);
    transition: all 0.4s;

    .effect-pulse {
      transition: all 0.4s;
    }

    &::before {
      opacity: 0.08;
      transform: translate(-40%, -50%) scale(1);
    }

    .menu-icon::before {
      transform: scale(1.4);
    }
  }
`;
