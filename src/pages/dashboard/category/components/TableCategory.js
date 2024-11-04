import React, { Component } from "react"
import { Row, Col, Card, CardBody } from "reactstrap"

// datatable related plugins
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory, { PaginationProvider, SizePerPageDropdownStandalone, PaginationListStandalone } from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';

// Data for dummy
import { dummyConstants } from '../../../../constants'

//Import Breadcrumb
import './sass/datatables.scss'
// import '../../member/components/sass/datatables.scss'

class TableCategory extends Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      sizePerPage: 10,
      productData: dummyConstants.category
    }

  }

  render() {

    const columns = [{
      dataField: 'id',
      text: 'Id',
      sort: true,
    }, {
      dataField: 'class',
      text: 'Kelas',
      sort: true
    }, {
      dataField: 'death_bird',
      text: 'Batas Lahir',
      sort: true
    }, {
      dataField: 'arange',
      text: 'Jarak',
      sort: true
    }, {
      dataField: 'kuota',
      text: 'Kuota Terisi',
      sort: true
    }, {
      dataField: 'registrasi',
      text: 'Biaya Registrasi',
    }, {
      dataField: 'status',
      text: 'Status',
      formatter: (cell, row) => {
        return (
          <div>
            <span className={`${row.status ? "bg-danger" : "bg-success"} text-white rounded-3 px-2`}>{row.status ? "Full Booked" : "On Sale"}</span>
          </div>
        )
      }
    }
];

    const defaultSorted = [{
      dataField: 'id',
      order: 'asc'
    }];

    const pageOptions = {
      sizePerPage: 10,
      totalSize: dummyConstants.category.length, // replace later with size(customers),
      custom: true,
    }

    // Custom Pagination Toggle
    // const sizePerPageList = [
    //   { text: '5', value: 5 },
    //   { text: '10', value: 10 },
    //   { text: '15', value: 15 },
    //   { text: '20', value: 20 },
    //   { text: '25', value: 25 },
    //   { text: 'All', value: (this.state.productData).length }];

  
    // Select All Button operation
    const selectRow = {
      mode: 'checkbox'
    }

    // const { SearchBar } = Search;

    return (
      <React.Fragment>
        <div>
          <div>
            <Row>
              <Col className="col-12">
                <Card>
                  <CardBody>
                    <PaginationProvider
                      pagination={paginationFactory(pageOptions)}
                      keyField='id'
                      columns={columns}
                      data={this.state.productData}
                    >
                      {({ paginationProps, paginationTableProps }) => (
                        <ToolkitProvider
                          keyField='id'
                          columns={columns}
                          data={this.state.productData}
                          search
                        >
                          {toolkitProps => (
                            <React.Fragment>

                              <Row className="mb-2">
                                <Col md="4">
                                  <div className="search-box me-2 mb-2 d-inline-block">
                                    <div className="position-relative">
                                      {/* <SearchBar
                                        {...toolkitProps.searchProps}
                                      /> */}
                                      {/* <i className="bx bx-search-alt search-icon" /> */}
                                    </div>
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col xl="12">
                                  <div className="table-responsive">
                                    <BootstrapTable
                                      keyField={"id"}
                                      responsive
                                      bordered={false}
                                      striped={false}
                                      defaultSorted={defaultSorted}
                                      selectRow={selectRow}
                                      classes={
                                        "table align-middle table-nowrap"
                                      }
                                      headerWrapperClasses={"thead-light"}
                                      {...toolkitProps.baseProps}
                                      {...paginationTableProps}
                                    />

                                  </div>
                                </Col>
                              </Row>

                              <Row className="align-items-md-center mt-30">
                                <Col className="inner-custom-pagination d-flex">
                                  <div className="d-inline">
                                    <SizePerPageDropdownStandalone
                                      {...paginationProps}
                                    />
                                  </div>
                                  <div className="text-md-right ms-auto">
                                    <PaginationListStandalone
                                      {...paginationProps}
                                    />
                                  </div>
                                </Col>
                              </Row>
                            </React.Fragment>
                          )
                          }
                        </ToolkitProvider>
                      )
                      }</PaginationProvider>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default TableCategory
