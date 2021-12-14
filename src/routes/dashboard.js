// Dashboard
import EventsNewFullday from "pages/dashboard/events/new/fullday";
import EventsNewMarathon from "pages/dashboard/events/new/marathon";
import PreWizard from "pages/dashboard/events/new/pre-wizard";
import Congratulations from "pages/dashboard/events/new/congratulations";
import ScoringNew from "pages/dashboard/scoring/new";
import Dashboard from "../pages/dashboard";
import EventDetailHome from "../pages/dashboard/events/home";
import ListCategory from "../pages/dashboard/category";
import ListEvent from "../pages/dashboard/events";
import EventsNew from "../pages/dashboard/events/new";
import ListMember from "../pages/dashboard/member";
import ListScoring from "../pages/dashboard/scoring";
import ListResult from "pages/dashboard/results";
import Bagan from "pages/dashboard/results/bagan";
import EditResult from "pages/dashboard/results/edit";
import ListSchedule from "../pages/dashboard/schedule";
import Eliminasi from "../pages/dashboard/eliminasi";

const dashboardRoutes = [
  { path: "/dashboard", component: Dashboard },
  { path: "/dashboard/events", component: ListEvent },
  { path: "/dashboard/event/:event_id/home", component: EventDetailHome },
  { path: "/dashboard/member/:event_id", component: ListMember },
  { path: "/dashboard/category", component: ListCategory },
  { path: "/dashboard/scoring", component: ListScoring },
  { path: "/dashboard/scoring/new", component: ScoringNew },
  { path: "/dashboard/result", component: ListResult },
  { path: "/dashboard/result/bagan", component: Bagan },
  { path: "/dashboard/result/edit", component: EditResult },
  { path: "/dashboard/schedule/:event_id", component: ListSchedule },
  { path: "/dashboard/eliminasi/:event_id", component: Eliminasi },

  { path: "/dashboard/events/new/prepare", component: PreWizard },
  { path: "/dashboard/events/new/congratulations", component: Congratulations },

  // this route should be at the end of all other routes
  { path: "/dashboard/events/new", component: EventsNew },
  { path: "/dashboard/events/new/fullday", component: EventsNewFullday },
  { path: "/dashboard/events/new/marathon", component: EventsNewMarathon },
];

export default dashboardRoutes;
