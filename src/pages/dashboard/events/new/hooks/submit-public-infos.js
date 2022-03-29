import { useFetcher } from "utils/hooks/alt-fetcher";
import { EventsService } from "services";

import { makePayloadPublicInfos } from "../utils/event-public-infos";

function useSubmitPublicInfos() {
  const fetcher = useFetcher();

  const submit = async (formData, { eventId, onSuccess: consumerSuccessHandler }) => {
    const payload = await makePayloadPublicInfos(formData, eventId);
    const postFunction = () => EventsService.storeEventDetailV2(payload);
    const putFunction = () => {
      return EventsService.updateEventDetailV2(payload, { event_id: eventId });
    };

    const fetchingFunction = eventId ? putFunction : postFunction;
    fetcher.runAsync(fetchingFunction, {
      onSuccess: (data) => {
        consumerSuccessHandler?.(data);
      },
    });
  };

  return { ...fetcher, submit };
}

export { useSubmitPublicInfos };