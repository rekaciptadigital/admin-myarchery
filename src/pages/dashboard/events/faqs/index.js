import * as React from "react";
import { useParams } from "react-router-dom";
// ... imports

import { SubNavbar } from "../components/submenus-settings";

function PageEventFaqs() {
  const { event_id } = useParams();
  // ...

  return (
    <React.Fragment>
      <SubNavbar eventId={event_id} />
    </React.Fragment>
  );
}

export default PageEventFaqs;
