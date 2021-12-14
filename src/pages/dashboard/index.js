import * as React from "react";

import MetaTags from "react-meta-tags";
import { Container, Row, Col } from "reactstrap";
import { LatestEventList, CardUserProfile, CardMenuManageUsers } from "./components";

const Dashboard = () => {
  return (
    <div className="page-content">
      <MetaTags>
        <title>Dashboard | MyArchery.id</title>
      </MetaTags>

      <Container fluid className="mt-4 mb-5">
        <h1>Dashboard</h1>
        <p>Atur akun &amp; eventmu di sini</p>

        <Row className="mt-5">
          <Col md={6}>
            <CardUserProfile />
          </Col>

          <Col md={6}>
            <CardMenuManageUsers />
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-end my-3">
          <h3 className="mb-0">Event Terbaru</h3>
          <div>{/* TODO: Untuk ke depannya diisi tombol action: misal, ke list event */}</div>
        </div>

        <LatestEventList />
      </Container>
    </div>
  );
};

export default Dashboard;
