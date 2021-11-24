import React, { useState } from 'react'
import {
    Card,
    CardBody,
    Button,
    Row,
    Col,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
  } from "reactstrap";

  import satuDashboard from '../../../../assets/images/myachery/dashboard-1.png'
//   import poster from '../../../../assets/images/myachery/logo-myarchery.png'


function CardEvent(props) {
    const [menu, setMenu] = useState(false);
    const [check, setCheck] = useState(false)
    const getCheckCopy = () => {
        navigator.clipboard.writeText(props.detail.event.eventUrl)
        setCheck(true)
    }
    let dStart = new Date(props.detail.event.registrationStartDatetime)
    let dEnd = new Date(props.detail.event.registrationEndDatetime)
    // console.log(d.toDateString())

    // if (!props.detail) {
    //     return (
    //         <dvi>
    //             <Card className="mini-stats-wid">
    //             <CardBody>
    //                 <Row>
    //                     <Col md={6} sm={12}>
    //                         <div>
    //                             <span>
    //                                 {/* <i className="bx bx-home font-size-24"></i> */}
    //                                 <img src={satuDashboard} />
    //                             </span>
    //                         </div>
    //                     </Col>
    //                     <Col md={6} sm={12}>
    //                         <div>
    //                         <div className="d-flex justify-content-between">
    //                             <h4>Jakarta Archery 2021</h4>
    //                             <Dropdown
    //                                 isOpen={menu}
    //                                 toggle={() => setMenu(!menu)}
    //                             >
    //                                 <DropdownToggle tag="span">
    //                                     <h3 className="bx bx-dots-vertical" style={{cursor: 'pointer'}}></h3>
    //                                 </DropdownToggle>
    //                                 <DropdownMenu className="dropdown-menu-end">
    //                                     <DropdownItem tag="a" href={"/dashboard/schedule"}>
    //                                         {" "}
    //                                         <span>Lihat Jadwal</span>
    //                                     </DropdownItem>
    //                                     <DropdownItem tag="a" href={"/dashboard/member"}>
    //                                         {" "}
    //                                         <span>Lihat Peserta</span>
    //                                     </DropdownItem>
    //                                     <DropdownItem tag="a" href={"/dashboard/eliminasi"}>
    //                                         {" "}
    //                                         <span>Setting Eliminasi</span>
    //                                     </DropdownItem>
    //                                 </DropdownMenu>
    //                             </Dropdown>
    //                         </div>
    //                         <p className="text-muted fw-medium">
    //                             13 Agustus - 16 Agustus 2021
    //                         </p>
    //                         <p className="text-muted fw-medium">
    //                             Gelora Bung Karno
    //                         </p>
    //                         <Button color="primary">Manage Event</Button>
    //                         </div>
    //                     </Col>
    //                 </Row>
    //             </CardBody>
    //         </Card>
    //         </dvi>
    //     )
    // }

    return (
        <div>
            <Card className="mini-stats-wid">
                <CardBody>
                    <Row>
                        <Col md={6} sm={12}>
                            <div>
                                <span>
                                    {/* <i className="bx bx-home font-size-24"></i> */}
                                    <img src={props.detail.event.poster ? props.detail.event.poster : satuDashboard} height="120" width="200" />
                                </span>
                            </div>
                        </Col>
                        <Col md={6} sm={12}>
                            <div>
                            <div className="d-flex justify-content-between">
                                <h4>{props.detail.event.eventName}</h4>
                                <Dropdown
                                    isOpen={menu}
                                    toggle={() => setMenu(!menu)}
                                >
                                    <DropdownToggle tag="span">
                                        <h3 className="bx bx-dots-vertical" style={{cursor: 'pointer'}}></h3>
                                    </DropdownToggle>
                                    <DropdownMenu className="dropdown-menu-end">
                                        <DropdownItem tag="a" href={"/dashboard/schedule/"+props.detail.event.id}>
                                            {" "}
                                            <span>Lihat Jadwal</span>
                                        </DropdownItem>
                                        <DropdownItem tag="a" href={"/dashboard/member/"+props.detail.event.id}>
                                            {" "}
                                            <span>Lihat Peserta</span>
                                        </DropdownItem>
                                        <DropdownItem tag="a" href={"/dashboard/eliminasi/"+props.detail.event.id}>
                                            {" "}
                                            <span>Konfigurasi Eliminasi</span>
                                        </DropdownItem>

                                        <DropdownItem tag="a" href={`/dashboard/certificate/new?event_id=${props.detail.event.id}`}>
                                            {" "}
                                            <span>Ubah Sertifikat</span>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <p className="text-muted fw-medium">
                                {dStart != undefined ? dStart.toDateString() : ""} - {dEnd != undefined? dEnd.toDateString():""}
                            </p>
                            <p className="text-muted fw-medium">
                                {props.detail.event.location} - {props.detail.event.locationType}
                            </p>
                            <div className="mb-2">
                                <div className="d-flex">
                                    <a style={{marginRight: '0.5rem'}} target="_blank" rel="noreferrer" href={props.detail.event.eventUrl}>Link Event</a>
                                    <a onClick={getCheckCopy}>Copy Link</a>
                                    {!check ? null : (<i className="bx bx-check"></i>)}
                                </div>
                                <label style={{color:"green"}}>{props.detail.totalParticipant} peserta terdaftar</label>
                            </div>
                                <Button tag="a" color="primary" href={`/dashboard/event/${props.detail.event.id}/home`}>
                                    Manage Event
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </div>
    )
}

export default CardEvent
