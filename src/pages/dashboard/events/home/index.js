import * as React from "react";
import { useParams } from "react-router-dom";
import { EventsService } from "services";

import MetaTags from "react-meta-tags";
import { Container, Row, Col } from "reactstrap";
import CardMenu from "../components/CardMenu";

import menus from "./utils/menus";

export default function EventDetailHome() {
  const { event_id } = useParams();
  const [eventDetail, setEventDetail] = React.useState(null);

  React.useEffect(() => {
    const getEventDetail = async () => {
      const { data } = await EventsService.getEventById({ id: event_id });
      if (data) {
        setEventDetail(data);
      }
    };
    getEventDetail();
  }, []);

  return (
    <div className="page-content">
      <MetaTags>
        <title>Dashboard | Event {eventDetail && `- ${eventDetail.eventName}`}</title>
      </MetaTags>

      <Container fluid className="mt-4 mb-5">
        {eventDetail ? (
          <React.Fragment>
            <h1>{eventDetail.eventName}</h1>
            <p>Atur eventmu di sini</p>

            <Row className="mt-5">
              {menus?.map((menu) => (
                <Col key={menu.id} sm={6} md={4} xl={4}>
                  <CardMenu menu={menu} href={menu.computeLink(event_id)} />
                </Col>
              ))}
            </Row>
          </React.Fragment>
        ) : (
          <div>Loading...</div>
        )}
      </Container>
    </div>
  );
}
