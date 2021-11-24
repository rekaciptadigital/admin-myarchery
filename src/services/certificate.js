import API from "../utils/api";

export default {
  getForEditor(qs = null) {
    return API.get("/web/v1/event-certificate-templates/", qs);
  },
  save(data = null) {
    return API.post("/web/v1/event-certificate-templates", data, null, true);
  },
};
