import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import Select from "react-select";
import "./EditStartupAndProfilePage.css";
import { FaSave, FaTrash, FaUndo, FaUserCircle } from "react-icons/fa";
import RichTextEditor from "./RichTextEditor";
import Creatable from "react-select/creatable";

const today = new Date().toISOString().split("T")[0];
const hundredYearsAgo = new Date(
  new Date().setFullYear(new Date().getFullYear() - 100)
);
const minDate = hundredYearsAgo.toISOString().split("T")[0]; // Format to YYYY-MM-DD

const FormEditor = ({
  inputFields,
  normalSections,
  expandingSections,
  handleSubmit,
  handleDiscardChanges,
  handleAddSection,
  handleRemoveSection,
  handleInputChange,
  getInputLength,
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [memberIndexToRemove, setMemberIndexToRemove] = useState(null);

  const handleDeleteClick = (index) => {
    setShowDeleteConfirmation(true);
    setMemberIndexToRemove(index);
  };

  const getDescriptionLength = (sectionName, itemIndex) => {
    return inputFields[sectionName][itemIndex]?.description?.length || 0;
  };

  return (
    <>
      {normalSections &&
        normalSections.map((section, index) => (
          <Container key={index}>
            <h3 className="custom-heading">{section.heading}</h3>
            <Container className="custom-form-section">
              {section.fields.map((field, fieldIndex) => (
                <Row className="mb-3" key={fieldIndex}>
                  <Form.Group controlId={field.controlId}>
                    <Form.Label>
                      {field.label}{" "}
                      {field.required && <span className="required">*</span>}
                    </Form.Label>
                    {field.type === "textarea" ? (
                      <>
                        <Form.Control
                          as="textarea"
                          rows={field.rows}
                          placeholder={field.placeholder}
                          value={inputFields[field.name]}
                          onChange={(e) => field.onChange(e.target.value)}
                          minLength={0}
                          maxLength={200}
                        />
                        {field.showCharCount && (
                          <Form.Label
                            className={`char-count ${
                              getInputLength > 200
                                ? "char-count-over-limit"
                                : ""
                            }`}
                          >
                            {inputFields[field.name].length} / {200}
                          </Form.Label>
                        )}
                      </>
                    ) : field.type === "select" ? (
                      <>
                        {field.isCreatable ? (
                          <Creatable
                            isMulti={field.isMulti}
                            value={inputFields[field.name]}
                            name={field.name}
                            options={field.options}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={field.onChange}
                          />
                        ) : (
                          <Select
                            isMulti={field.isMulti}
                            value={inputFields[field.name]}
                            name={field.name}
                            options={field.options}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={field.onChange}
                          />
                        )}
                      </>
                    ) : field.type === "richtext-editor" ? (
                      <div class="form-control" style={{ height: "300px" }}>
                        <RichTextEditor
                          placeholder={field.placeholder}
                          field={field}
                          value={inputFields[field.name]}
                          theme="snow"
                          style={{ height: "100%", overflowY: "auto" }}
                          maxLength={2000}
                        />
                      </div>
                    ) : field.type === "date" ? (
                      <>
                        <Form.Control
                          type={field.type}
                          placeholder={field.placeholder}
                          value={inputFields[field.name]}
                          onChange={(e) => field.onChange(e.target.value)}
                          required
                          min={minDate}
                          max={today}
                        />
                        <Form.Control.Feedback type="invalid">
                          {!inputFields[field.name]
                            ? "Please enter your birth date."
                            : inputFields[field.name] < minDate
                            ? "Are you sure you are older than 100?"
                            : "Your birthday can't be in the future."}
                        </Form.Control.Feedback>
                      </>
                    ) : field.type === "text" && field.name.includes("URL") ? (
                      <>
                        <Form.Control
                          type={field.type}
                          placeholder={field.placeholder}
                          value={inputFields[field.name]}
                          onChange={(e) => field.onChange(e.target.value)}
                          minLength={0}
                          maxLength={100}
                          pattern="(.+)\.(.+)"
                        />
                        <Form.Control.Feedback type="invalid">
                          {"Please enter a valid URL"}
                        </Form.Control.Feedback>
                      </>
                    ) : (
                      <>
                        <Form.Control
                          type={field.type}
                          placeholder={field.placeholder}
                          value={inputFields[field.name]}
                          onChange={(e) => field.onChange(e.target.value)}
                          required
                          maxLength={100}
                          pattern=".+"
                        />
                        <Form.Control.Feedback type="invalid">
                          {"This field is required"}
                        </Form.Control.Feedback>
                      </>
                    )}
                  </Form.Group>
                </Row>
              ))}
            </Container>
          </Container>
        ))}

      {expandingSections &&
        expandingSections.map((section, sectionIndex) => (
          <Container key={sectionIndex}>
            <h3 className="custom-heading">{section.heading}</h3>
            {section.items.map((item, itemIndex) => (
              <Container key={itemIndex} className="custom-form-section">
                {section.fields.map((field, fieldIndex) => (
                  <Row className="mb-3" key={fieldIndex}>
                    <Form.Group controlId={`${field.controlId}-${itemIndex}`}>
                      <Form.Label>
                        {field.label}{" "}
                        {field.required && <span className="required">*</span>}
                      </Form.Label>
                      {field.type === "textarea" ? (
                        <>
                          <Form.Control
                            as="textarea"
                            rows={field.rows}
                            placeholder={field.placeholder}
                            name={field.name}
                            value={item[field.name] || ""}
                            onChange={(e) =>
                              handleInputChange(section.name, itemIndex, e)
                            }
                            minLength={0}
                            maxLength={200}
                          />
                          {field.showCharCount && (
                            <Form.Label className="char-count">
                              {getDescriptionLength(section.name, itemIndex)} /
                              {200}
                            </Form.Label>
                          )}
                        </>
                      ) : field.type === "select" ? (
                        <>
                          {field.isCreatble ? (
                            <Creatable
                              isMulti={field.isMulti}
                              value={item[field.name] || ""}
                              name={field.name}
                              options={field.options}
                              className="basic-multi-select"
                              classNamePrefix="select"
                              onChange={(selectedOption) =>
                                handleInputChange(
                                  section.name,
                                  itemIndex,
                                  selectedOption,
                                  field.name
                                )
                              }
                            />
                          ) : (
                            <Select
                              isMulti={field.isMulti}
                              value={item[field.name] || ""}
                              name={field.name}
                              options={field.options}
                              className="basic-multi-select"
                              classNamePrefix="select"
                              onChange={(selectedOption) =>
                                handleInputChange(
                                  section.name,
                                  itemIndex,
                                  selectedOption,
                                  field.name
                                )
                              }
                            />
                          )}
                        </>
                      ) : field.type === "richtext-editor" ? (
                        <div class="form-control" style={{ height: "300px" }}>
                          <RichTextEditor
                            placeholder={field.placeholder}
                            field={field}
                            value={item[field.name] || ""}
                            theme="bubble"
                            sectionName={section.name}
                            onChange={(value) =>
                              handleInputChange(
                                section.name,
                                itemIndex,
                                value,
                                field.name
                              )
                            }
                            maxLength={2000}
                            style={{ height: "100%", overflowY: "auto" }}
                          />
                        </div>
                      ) : field.type === "date" &&
                        field.name === "startDate" ? (
                        <>
                          <Form.Control
                            type={field.type}
                            placeholder={field.placeholder}
                            name={field.name}
                            value={item[field.name] || ""}
                            onChange={(e) =>
                              handleInputChange(section.name, itemIndex, e)
                            }
                            required
                            min={minDate}
                            max={today}
                          />
                          <Form.Control.Feedback type="invalid">
                            {!item[field.name]
                              ? "Please enter a start date."
                              : item[field.name] < minDate
                              ? "Are you sure you started more than 100 years ago?"
                              : "The start date can't be in the future."}
                          </Form.Control.Feedback>
                        </>
                      ) : field.type === "date" && field.name === "endDate" ? (
                        <>
                          <Form.Control
                            type={field.type}
                            placeholder={field.placeholder}
                            name={field.name}
                            value={item[field.name] || ""}
                            onChange={(e) =>
                              handleInputChange(section.name, itemIndex, e)
                            }
                            min={item.startDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {"End Date must be later than start date."}
                          </Form.Control.Feedback>
                        </>
                      ) : field.type === "text" ? (
                        <>
                          <Form.Control
                            type={field.type}
                            placeholder={field.placeholder}
                            name={field.name}
                            value={item[field.name] || ""}
                            onChange={(e) =>
                              handleInputChange(section.name, itemIndex, e)
                            }
                            maxLength={100}
                            required
                            pattern=".+"
                          />
                          <Form.Control.Feedback type="invalid">
                            {"This field is required"}
                          </Form.Control.Feedback>
                        </>
                      ) : (
                        <Form.Control
                          type={field.type}
                          placeholder={field.placeholder}
                          name={field.name}
                          value={item[field.name] || ""}
                          onChange={(e) =>
                            handleInputChange(section.name, itemIndex, e)
                          }
                        />
                      )}
                    </Form.Group>
                  </Row>
                ))}

                <Button
                  variant="outline-danger"
                  type="button"
                  onClick={() => handleRemoveSection(section.name, itemIndex)}
                  className="delete-button"
                >
                  <FaTrash style={{ marginRight: "5px" }} />
                  Delete
                </Button>
              </Container>
            ))}
            <Button
              variant="secondary"
              type="button"
              onClick={() => handleAddSection(section.name)}
              className="add-button"
            >
              {`+ Add ${section.label}`}
            </Button>
          </Container>
        ))}

      <Container className="text-center" style={{ marginTop: "30px" }}>
        <hr className="divider" style={{ marginTop: "50px" }} />
        <Row className="justify-content-center align-items-center">
          <Col md={12} className="d-flex justify-content-center">
            <Button
              variant="primary"
              className="m-3"
              onClick={handleSubmit}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaSave style={{ marginRight: "5px" }} />
              Save changes
            </Button>

            <Button
              variant="secondary"
              className="m-3"
              onClick={handleDiscardChanges}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaUndo style={{ marginRight: "5px" }} />
              Discard Changes
            </Button>
          </Col>
        </Row>

        <hr className="divider" style={{ marginTop: "70px" }} />

        <Row>
          <Col md={12}>
            <Button
              variant="outline-danger"
              type="button"
              onClick={() => handleDeleteClick(-1)}
              className="m-3"
            >
              <FaTrash style={{ marginRight: "5px" }} />
              Delete profile
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default FormEditor;
