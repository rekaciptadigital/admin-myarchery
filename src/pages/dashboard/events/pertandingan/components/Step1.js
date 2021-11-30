import * as React from "react";
import { selectConstants } from "constants/index";

import { Row, Col, Card, CardBody, Button } from "reactstrap";
import { TextInput, RadioButtonInput, TextEditor } from "components";
import { ButtonBiru } from "./buttons";

export default function Step1({ eventDetail }) {
  return (
    <Card>
      <CardBody>
        <h3>Banner Event</h3>

        {/* Poster Image Picker */}
        <div
          style={{
            position: "relative",
            backgroundColor: "#545454",
            backgroundImage: `url(${eventDetail?.poster})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "#545454",
              opacity: 0.5,
            }}
          ></div>
          <div
            className="text-white d-flex flex-column justify-content-center align-items-center"
            style={{
              position: "relative",
              height: 400,
            }}
          >
            <div className="mb-3">
              <ButtonBiru>Ganti Background</ButtonBiru>
              <Button color="link" className="text-white ms-2">
                <i className="bx bx-trash font-size-18 align-middle" />
              </Button>
            </div>
            <p>PNG/JPEG, Ukuran 1280 x 908 pixel</p>
          </div>
        </div>

        <hr />
        <h3>Judul dan Deskripsi</h3>

        <Row>
          <Col md={12}>
            <TextInput
              label="Nama Event"
              name="eventName"
              value={eventDetail?.eventName}
              readOnly
              disabled
              required
            />
          </Col>

          <Col md={12}>
            <TextInput label="Link Event" name="eventUrl" value={eventDetail?.eventUrl} disabled />
          </Col>

          <Col md={6}>
            <TextInput label="Lokasi" name="location" value={eventDetail?.location} />
          </Col>

          <Col md={6}>
            <TextInput label="Kota" name="city" value={eventDetail?.city} />
          </Col>

          <Col md={12}>
            <div className="d-flex h-100 align-items-center">
              <RadioButtonInput
                name="locationType"
                options={selectConstants.eventLocationType}
                value={eventDetail?.locationType}
                valueOnly
              />
            </div>
          </Col>

          <Col md={12}>
            <TextEditor
              label="Deskripsi Tambahan"
              name="description"
              value={eventDetail?.description}
              placeholder="Hadiah kompetisi, Flow lomba, peraturan, informasi tambahan mengenai lomba..."
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}
