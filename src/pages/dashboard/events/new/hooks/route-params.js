import { useParams, useNavigate, useLocation } from "react-router-dom";

function useRouteQueryParams() {
  const { event_id: param_event_id } = useParams();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const queryStrings = new URLSearchParams(search);
  const qs_event_id = queryStrings.get("event_id");
  const qs_event_type = queryStrings.get("event_type");
  const qs_match_type = queryStrings.get("match_type");

  const eventId = makeEventIdFromRoute(param_event_id, qs_event_id);
  const isManageEvent = Boolean(param_event_id);
  const isCreateEvent = !param_event_id && qs_event_id;

  const setParamEventId = (eventId) => {
    queryStrings.set("event_id", eventId);
    const URLWithParams = queryStrings.toString();
    navigate(`${pathname}?${URLWithParams}`);
  };

  return {
    eventId,
    isManageEvent,
    isCreateEvent,
    setParamEventId,
    eventType: qs_event_type,
    matchType: qs_match_type,
    pathname,
  };
}

function makeEventIdFromRoute(param_event_id, qs_event_id) {
  if (param_event_id) {
    return parseInt(param_event_id);
  }
  if (qs_event_id) {
    return parseInt(qs_event_id);
  }
  return null;
}

export { useRouteQueryParams };
