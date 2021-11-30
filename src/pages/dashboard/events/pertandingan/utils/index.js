function prepareResponseDataAsPayload(responseData) {
  return {
    id: responseData.id,
    eventType: responseData.eventType,

    // Step 1
    poster: responseData.poster || "",
    eventName: responseData.eventName || "",
    eventUrl: responseData.eventUrl || "",
    location: responseData.location || "",
    city: responseData.city || "Jakarta",
    locationType: responseData.locationType || "",
    description: responseData.description || "",

    // Step 2

    // Step 3

    // Step 4
  };
}

export { prepareResponseDataAsPayload };
