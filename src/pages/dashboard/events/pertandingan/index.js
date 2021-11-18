import * as React from "react";
import { useParams } from "react-router-dom";
import { EventsService } from "services";

import MetaTags from "react-meta-tags";
import { Container } from "reactstrap";

export default function EventDetailPertandingan() {
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
        <title>Manage Pertandingan{eventDetail && ` | ${eventDetail.eventName}`}</title>
      </MetaTags>

      <Container fluid>
      </Container>
    </div>
  );
}
