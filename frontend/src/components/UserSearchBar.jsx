import React, { useState, useEffect, useCallback } from "react";
import { Container, Form, ListGroup, ListGroupItem } from "react-bootstrap";
import { getAllUsersFromQuery } from "./api";
import { FaUserCircle } from "react-icons/fa";
import { debounce } from "../utils";
import AsyncSelect from "react-select/async";
import { useNavigate } from "react-router-dom";
import { components } from "react-select";
import { FaSearch } from "react-icons/fa";

export default function UserSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const results = await getAllUsersFromQuery(inputValue);
      // Map results to the format expected by AsyncSelect
      return results
        .filter((user) => user.profession === "student")
        .map((user) => ({
          value: user._id,
          label: user.firstName + " " + user.lastName,
          imageUrl: user.profilePicture, // Assuming 'imageUrl' is the property where the image URL is stored
        }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  const CustomDropdownIndicator = (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <FaSearch /> {/* Your custom icon */}
      </components.DropdownIndicator>
    );
  };

  const CustomOption = (props) => {
    return (
      <components.Option {...props}>
        {props.data.imageUrl ? (
          <img
            src={props.data.imageUrl}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              objectFit: "cover",
              marginRight: "10px",
            }}
            alt=""
          />
        ) : (
          <FaUserCircle
            style={{
              width: "30px",
              height: "30px",
              marginRight: "10px",
            }}
          />
        )}
        {props.data.label}
      </components.Option>
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectChange = (selectedOption) => {
    navigate(`/user?id=${selectedOption.value}`);
  };

  return (
    <Container>
      <Form styles={{ width: "300px" }}>
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          defaultOptions
          onChange={handleSelectChange}
          placeholder="Search for a user..."
          styles={{ control: (base) => ({ ...base, width: 250 }) }}
          components={{
            Option: CustomOption,
            DropdownIndicator: CustomDropdownIndicator,
          }}
        />
      </Form>
    </Container>
  );
}
