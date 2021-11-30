import * as React from "react";

import { Card, CardBody } from "reactstrap";
import { TabList, Tab, TabContent } from "./tabs";
import TabJadwalEliminasi from "./TabJadwalEliminasi";

export default function Step3({ eventDetail }) {
  const [activeTab, setActiveTab] = React.useState(2);

  const handleClickTab = (tabNumber) => setActiveTab(tabNumber);

  const getTabProps = (tabNumber) => ({
    tabNumber: tabNumber,
    isActive: activeTab === tabNumber,
  });

  return (
    <Card>
      <CardBody>
        <TabList>
          <Tab {...getTabProps(1)} disabled>
            Kualifikasi
          </Tab>

          <Tab {...getTabProps(2)} onClick={handleClickTab}>
            Eliminasi
          </Tab>

          <Tab {...getTabProps(3)} onClick={handleClickTab}>
            Technical Meeting
          </Tab>
        </TabList>

        <TabContent {...getTabProps(1)}>
          <h2>1</h2>
        </TabContent>

        <TabContent {...getTabProps(2)}>
          <TabJadwalEliminasi data={eventDetail} />
        </TabContent>

        <TabContent {...getTabProps(3)}>
          <h2>3</h2>
        </TabContent>
      </CardBody>
    </Card>
  );
}
