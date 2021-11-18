import React from "react";
import { Container, Row, Col } from "reactstrap";

function FooterPushedToBottom() {
  return (
    <footer className="footer mt-auto">
      <Container fluid>
        <Row>
          <Col sm={6}>{new Date().getFullYear()} &copy; MyArchery.</Col>
          <Col sm={6}>
            <div className="text-sm-end d-none d-sm-block">Design &amp; Develop by RCD</div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default FooterPushedToBottom;
