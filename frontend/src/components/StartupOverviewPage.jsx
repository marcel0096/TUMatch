import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { CircleFill, Circle } from "react-bootstrap-icons"; //
import { BsFilter } from "react-icons/bs";
import Select from "react-select";
import "./StartupOverviewPage.css";
import "./DetailPage.css";
import { fetchAllStartups, fetchUserById, getRecommendedStartups } from "./api";
import { getSkillNamesFromIds } from "../utils";
import LoadingScreen from "../LoadingScreen";
import TUMatchLogo from "../assets/TUMatch_logo.png";
import { getStartupsByPage, fetchStartupByStartupId } from "./api";

export default function StartupOverviewPage() {
  const navigate = useNavigate();
  const { userId, profession } = useAuth();
  const [startups, setStartups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [sortOption, setSortOption] = useState(
    profession === "student" ? "recommendation" : "mostRecentlyAdded"
  );
  const [selectedBusinessModels, setSelectedBusinessModels] = useState([]);
  const [selectedInvestmentStages, setSelectedInvestmentStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstEffectFinished, setFirstEffectFinished] = useState(false);
  const [isLazyLoading, setIsLazyLoading] = useState(false);
  const [recommendationList, setRecommendationList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalStartups, setTotalStartups] = useState(null);
  const [reRender, setReRender] = useState(false);

  const loadMoreRef = React.useRef(null);
  const startupsPerLoad = 9;

  useEffect(() => {
    const fetchStartupData = async () => {
      try {
        lazyLoadStartups();
      } catch (error) {
        console.error("Error fetching startup data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStartupData().then(() => setFirstEffectFinished(true));
  }, [userId]);

  // Filtering the startups based on the search query and the selected filters
  useEffect(() => {
    const filterAndSortStartups = async () => {
      const filteredStartups = startups.filter(
        (startup) =>
          startup.startupName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          (selectedIndustries.length === 0 ||
            selectedIndustries.some(
              (industry) => startup.industry.value === industry.value
            )) &&
          (selectedBusinessModels.length === 0 ||
            selectedBusinessModels.some(
              (businessModel) =>
                startup.businessModel.value === businessModel.value
            )) &&
          (selectedInvestmentStages.length === 0 ||
            selectedInvestmentStages.some(
              (investmentStage) =>
                startup.investmentStage.value === investmentStage.value
            ))
      );
      setFilteredStartups(filteredStartups); // update to sortedStartups
    };
    filterAndSortStartups();
  }, [
    searchQuery,
    sortOption,
    selectedIndustries,
    selectedBusinessModels,
    selectedInvestmentStages,
    firstEffectFinished,
    startups,
  ]);

  const handleFilterClick = () => {
    setShowFilter(!showFilter); // Toggle filter window visibility
  };

  const handleSortChange = (sortOption) => {
    setSortOption(sortOption);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleIndustryChange = (selectedOptions) => {
    setSelectedIndustries(selectedOptions || []);
  };

  const handleBusinessModelChange = (selectedOptions) => {
    setSelectedBusinessModels(selectedOptions || []);
  };

  const handleInvestmentStageChange = (selectedOptions) => {
    setSelectedInvestmentStages(selectedOptions || []);
  };

  const industryOptions = startups
    .map((startup) => ({
      value: startup.industry.value,
      label: startup.industry.label,
    }))
    .filter(
      (option, index, self) =>
        index === self.findIndex((o) => o.value === option.value)
    );

  const businessModelOptions = startups
    .map((startup) => ({
      value: startup.businessModel.value,
      label: startup.businessModel.label,
    }))
    .filter(
      (option, index, self) =>
        index === self.findIndex((o) => o.value === option.value)
    );

  const investmentStageOptions = startups
    .map((startup) => ({
      value: startup.investmentStage.value,
      label: startup.investmentStage.label,
    }))
    .filter(
      (option, index, self) =>
        index === self.findIndex((o) => o.value === option.value)
    );

  //This function is used to lazy load the startups
  const lazyLoadStartups = async () => {
    if (!totalStartups || startups.length <= totalStartups) {
      if (isLazyLoading) {
        return;
      }

      //turn on spinner and initalize values
      setIsLazyLoading(true);
      let data;
      let newStartups = [];
      let numTotalStartups = totalStartups ? totalStartups : 0;

      //check selected sorting option
      switch (sortOption) {
        case "recommendation":
          if (profession !== "student") {
            break;
          }
          //inital call to db to get order list of startudIds and inital load of full startups
          if (recommendationList.length === 0 && currentPage === 0) {
            const data = await getRecommendedStartups(userId, startupsPerLoad);
            setRecommendationList(data.recommendation);
            newStartups = data.initialStartupLoad;
            numTotalStartups = data.recommendation.length;
          } else {
            //load more recommended startups
            //iterate with starting offset over recommended startupId array and fetch each from db
            for (
              let i = startups.length;
              i < startups.length + startupsPerLoad;
              i++
            ) {
              if (i >= recommendationList.length) {
                break;
              }
              const startupObj = await fetchStartupByStartupId(
                recommendationList[i]
              );
              newStartups.push(startupObj);
            }
          }
          break;
        //getting ordered startups using backend sort in db
        //currentPage * startupsPerLoad is offset for starting value
        case "mostRecentlyAdded":
          data = await getStartupsByPage(currentPage, startupsPerLoad, "desc");
          newStartups = data.startups;
          numTotalStartups = data.totalStartups;

          break;
        case "leastRecentlyAdded":
          data = await getStartupsByPage(currentPage, startupsPerLoad, "asc");
          newStartups = data.startups;
          numTotalStartups = data.totalStartups;
          break;
        case "alphabetically":
          data = await getStartupsByPage(
            currentPage,
            startupsPerLoad,
            "alphabetical"
          );
          newStartups = data.startups;
          numTotalStartups = data.totalStartups;

          break;
        default:
          //no output on other / unallowed sorting options
          break;
      }
      //set state variables & turn off spinner
      setCurrentPage(currentPage + 1);
      setStartups([...startups, ...newStartups]);
      setTotalStartups(numTotalStartups);
      setIsLazyLoading(false);
    }
  };
  //This useEffect is used to lazy load the startups when the user scrolls to the bottom of the page
  //an invisible div is used as ref, which is tracked by an observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        //only load if ref is oberserved && there are addtional startups in the db
        if (entries[0].isIntersecting && startups.length < totalStartups) {
          lazyLoadStartups();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [isLazyLoading]);

  //reset the current page when the sort option changes
  useEffect(() => {
    setCurrentPage(0);
    setStartups([]);
    setTotalStartups(null);
    setFilteredStartups([]);
    setRecommendationList([]);
    setReRender(!reRender);
  }, [sortOption]);

  //ensure data gets loaded on reRender / change of sort option
  useEffect(() => {
    lazyLoadStartups();
  }, [reRender]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container fluid style={{ paddingTop: "30px" }}>
      <Row>
        <Col>
          <Card className="mb-0 main-card">
            <Card.Body
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
                background: "#f9f9f",
              }}
            >
              <Row className="mb-0 d-flex align-items-center justify-content-center">
                <Col className="d-flex align-items-center justify-content-start">
                  <div className="d-block d-md-inline mx-2">
                    <img
                      src={TUMatchLogo}
                      alt="TUM Logo"
                      style={{ height: "100px" }}
                    />
                  </div>
                  <div className="d-block d-lg-inline mx-3">
                    <div className="main-title">Browse startups</div>
                  </div>
                </Col>
                <Col className="d-flex align-items-center justify-content-end">
                  <div style={{ paddingRight: "20px" }}>
                    <Form.Control
                      type="text"
                      placeholder="Search for a startup"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div style={{ paddingRight: "20px" }}>
                    <DropdownButton id="dropdown-basic-button" title="Sort By">
                      {profession === "student" && (<Dropdown.Item
                        onClick={() => handleSortChange("recommendation")}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            width: "100%",
                          }}
                        >
                          <div style={{ marginRight: "10px" }}>
                            {sortOption === "recommendation" ? (
                              <CircleFill />
                            ) : (
                              <Circle />
                            )}
                          </div>
                          <div style={{ textAlign: "left" }}>
                            Recommendation
                          </div>
                        </div>
                      </Dropdown.Item>
                      )}
                      <Dropdown.Item
                        onClick={() => handleSortChange("mostRecentlyAdded")}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            width: "100%",
                          }}
                        >
                          <div style={{ marginRight: "10px" }}>
                            {sortOption === "mostRecentlyAdded" ? (
                              <CircleFill />
                            ) : (
                              <Circle />
                            )}
                          </div>
                          <div style={{ textAlign: "left" }}>
                            Most Recently Added
                          </div>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleSortChange("leastRecentlyAdded")}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            width: "100%",
                          }}
                        >
                          <div style={{ marginRight: "10px" }}>
                            {sortOption === "leastRecentlyAdded" ? (
                              <CircleFill />
                            ) : (
                              <Circle />
                            )}
                          </div>
                          <div style={{ textAlign: "left" }}>
                            Least Recently Added
                          </div>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleSortChange("alphabetically")}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            width: "100%",
                          }}
                        >
                          <div style={{ marginRight: "10px" }}>
                            {sortOption === "alphabetically" ? (
                              <CircleFill />
                            ) : (
                              <Circle />
                            )}
                          </div>
                          <div style={{ textAlign: "left" }}>
                            Alphabetically
                          </div>
                        </div>
                      </Dropdown.Item>
                    </DropdownButton>
                  </div>
                  <div>
                    <Button variant="secondary" onClick={handleFilterClick}>
                      <BsFilter /> {/* Displaying the filter icon */}
                      Filter Startups
                    </Button>
                    {showFilter && (
                      <div className="filter-window">
                        <Row className="filter-item">
                          <Col>
                            <h5>Industry</h5>
                            <Select
                              isMulti
                              name="industries"
                              options={industryOptions}
                              className="basic-multi-select"
                              classNamePrefix="select"
                              value={selectedIndustries}
                              onChange={handleIndustryChange}
                            />
                          </Col>
                        </Row>
                        <Row className="filter-item">
                          <Col>
                            <h5>Business Model</h5>
                            <Select
                              isMulti
                              name="businessModel"
                              options={businessModelOptions}
                              className="basic-multi-select"
                              classNamePrefix="select"
                              value={selectedBusinessModels}
                              onChange={handleBusinessModelChange}
                            />
                          </Col>
                        </Row>
                        <Row className="filter-item">
                          <Col>
                            <h5>Investment Stage</h5>
                            <Select
                              isMulti
                              name="investmentStage"
                              options={investmentStageOptions}
                              className="basic-multi-select"
                              classNamePrefix="select"
                              value={selectedInvestmentStages}
                              onChange={handleInvestmentStageChange}
                            />
                          </Col>
                        </Row>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row fluid style={{ paddingTop: "10px" }}>
        <hr />
        {filteredStartups.map((startup) => (
          <Col md={4} className="mb-4" key={startup._id}>
            <Card className="startup-card">
              <Card.Body className="align-items-center justify-content-between">
                <Row className="d-flex align-items-center justify-content-center pb-3 ">
                  <Col
                    xl={4}
                    className="d-flex align-items-center justify-content-center"
                  >
                    {startup.startupLogo ? (
                      <img
                        src={startup.startupLogo.imageUrl}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "3%",
                          objectFit: "cover",
                        }}
                        alt="startup-logo"
                        className="profile-picture"
                      />
                    ) : (
                      <img
                        src="https://waterfieldtech.com/wp-content/uploads/2019/02/placeholder-image-gray-3x2.png"
                        style={{
                          width: "100%",
                          height: "auto",
                          //borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </Col>
                  <Col
                    xl={8}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <Card.Title className="startup-title text-center">
                      {startup.startupName}
                    </Card.Title>
                  </Col>
                </Row>
                <Row>
                  <Card.Text
                    className="descriptionText"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: "4",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      height: "4.5em", // Adjust based on your line-height and font-size
                      lineHeight: "1.5em",
                    }}
                  >
                    {startup.shortDescription}
                  </Card.Text>
                </Row>
                <Row className="d-flex align-items-center justify-content-center equal-height-cols">
                  <Col sm={12} md={6} xl={3} className="tag">
                    {startup.industry.label}
                  </Col>
                  <Col sm={12} md={6} xl={3} className="tag">
                    {startup.businessModel.label}
                  </Col>
                  <Col sm={12} md={6} xl={3} className="tag">
                    {startup.investmentStage.label}
                  </Col>
                </Row>
                <Row>
                  <Container
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/startup?id=${startup._id}`)}
                    >
                      Learn more
                    </Button>
                  </Container>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
        <div ref={loadMoreRef} style={{ height: "20px" }} />
      </Row>
      {isLazyLoading && <LoadingScreen />}
    </Container>
  );
}
