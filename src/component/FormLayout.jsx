import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import Textarea from "@mui/joy/Textarea";
import axios from "axios";
import "../assets/style.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jspdf from "jspdf";
import autoTable from "jspdf-autotable";

function FormLayout() {
  const [step, setstep] = useState(1);
  const [formdata, setformdata] = useState([]);
  const [fielddata, setfielddata] = useState([]);
  const [date, setdate] = useState({});
  const [groupList, setgroupList] = useState([]);
  const [groupListid, setgroupListid] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [stepdata, setstepdata] = useState([]);
  const [textFieldData, setTextFieldData] = useState({});
  const [checkboxData, setCheckboxData] = useState([]);
  const [loading, setloading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const { Name } = useParams();
  const [textAreaValue, setTextAreaValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [option, setoption] = useState([]);
  const [submitdata, setsubmitdata] = useState([]);
  const [loadingOverlay, setLoadingOverlay] = useState(false);

  //formdata useeffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setloading(true);

        const formresponse = await axios.get(
          `https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/form/${Name}`
          // `http://localhost:8000/form/${Name}`
        );
        const fieldresponse = await axios.get(
          `https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/field/${Name}`
          // `http://localhost:8000/field/${Name}`
        );

        setformdata(formresponse.data);
        setfielddata(fieldresponse.data);

        setloading(false);
      } catch (err) {
        console.log("Error:", err);
        setloading(false);
      }
    };

    fetchData();
  }, []);

  //form favicon and title set useeffect
  useEffect(() => {
    document.title = formdata.formtitle;
    const favicon =
      document.querySelector("link[rel='icon']") ||
      document.createElement("link");
    favicon.rel = "icon";
    favicon.href = formdata.formlogo;
    document.head.appendChild(favicon);
  }, [formdata]);

  //finding unique group data
  useEffect(() => {
    if (fielddata?.data) {
      const uniqueGroups = new Set();
      fielddata.data.forEach((item) => {
        if (item.grouptitle !== null) {
          uniqueGroups.add(item.grouptitle);
        }
      });
      const uniqueGroupsArray = Array.from(uniqueGroups);

      setgroupList(uniqueGroupsArray);
    }
  }, [fielddata]);

  useEffect(() => {
    if (fielddata?.data) {
      const uniqueGroups = new Map();
      fielddata.data.forEach((item) => {
        if (item.grouptitle !== null) {
          uniqueGroups.set(item.groupid, item.grouptitle);
        }
      });
      const uniqueGroupsArray = Array.from(
        uniqueGroups,
        ([groupid, grouptitle]) => ({
          groupid,
          grouptitle,
        })
      );

      setgroupListid(uniqueGroupsArray);
    }
  }, [fielddata]);

  //save step data
  const saveStepData = () => {
    const currentStepData = {
      textFields: textFieldData,
      checkboxes: checkboxData,
      date: date,
      textarea: textAreaValue,
    };

    setstepdata(currentStepData);
  };

  //Validation code
  const validateFields = () => {
    let isValid = true;
    const newErrors = {};

    const currentGroupTitle = groupList[currentGroupIndex];

    const currentGroupFields = fielddata?.data?.filter(
      (field) =>
        field.grouptitle === currentGroupTitle || field.grouptitle === null
    );

    // Validate required TextFields
    currentGroupFields
      ?.filter((field) => field.fieldtype === "TextField" && field.isrequired)
      .forEach((field) => {
        const fieldValue = textFieldData[field.fieldid]?.value || "";
        if (!fieldValue.trim()) {
          isValid = false;
          newErrors[field.fieldid] = (
            <Typography variant="body2" color="error">
              {field.fieldtitle} field is required
            </Typography>
          );
        }
      });

    // Validate required Checkboxes
    currentGroupFields
      ?.filter(
        (field) => field.fieldtype === "CheckboxGroup" && field.isrequired
      )
      .forEach((field) => {
        const isChecked = checkboxData.some(
          (data) => data.id === field.groupid && data.fieldid === field.fieldid
        );
        if (!isChecked) {
          isValid = false;
          newErrors[field.fieldid] = (
            <Typography variant="body2" color="error">
              Please select at least one option
            </Typography>
          );
        } else {
          const otherOptionSelected = checkboxData.some(
            (item) =>
              item.id === field.groupid &&
              item.fieldid === field.fieldid &&
              item.options?.includes("Other")
          );

          if (otherOptionSelected) {
            const otherText = option.find(
              (item) => item.id === field.fieldid
            )?.options;

            if (!otherText || otherText.trim() === "") {
              isValid = false;
              newErrors[field.fieldid] = (
                <Typography variant="body2" color="error">
                  Please enter a value for "Other"
                </Typography>
              );
            }
          }
        }
      });

    // Validate required Dates
    currentGroupFields
      ?.filter((field) => field.fieldtype === "Date" && field.isrequired)
      .forEach((field) => {
        const selectedDateValue =
          date.id === field.fieldid ? date.formattedDate : null;
        if (!selectedDateValue) {
          isValid = false;
          newErrors[field.fieldid] = (
            <Typography variant="body2" color="error">
              Please select a date
            </Typography>
          );
        }
      });

    // Validate required TextAreas
    currentGroupFields
      ?.filter((field) => field.fieldtype === "TextArea" && field.isrequired)
      .forEach((field) => {
        const textAreaContent =
          textAreaValue[field.groupid]?.[field.fieldid]?.value || "";
        if (!textAreaContent.trim()) {
          isValid = false;
          newErrors[field.fieldid] = "This field cannot be empty";
        }
      });

    setErrors(newErrors);

    return isValid;
  };

  //handle next button function
  const handleNext = async () => {
    if (validateFields()) {
      saveStepData();
      if (currentGroupIndex < groupList.length - 1) {
        setCurrentGroupIndex((prevIndex) => prevIndex + 1);
      }
    } else {
      console.log("Validation failed, cannot proceed.");
    }
  };

  //handle previous button function
  const handlePrevious = () => {
    saveStepData();
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex((prevIndex) => prevIndex - 1);
    }
  };

  //handle textfield change function
  const handleTextfieldChange = (e, fieldid, name) => {
    setTextFieldData({
      ...textFieldData,
      [fieldid]: {
        value: e.target.value,
        name: name,
      },
    });
    setErrors({ ...errors, [fieldid]: false });
  };
  //handle checkbox change function
  const handleCheckBoxChange = (e, option, id, fieldid, fieldname) => {
    setCheckboxData((prevData) => {
      if (e.target.checked) {
        const existingEntry = prevData.find(
          (item) => item.id === id && item.fieldid === fieldid
        );

        if (existingEntry) {
          return prevData.map((item) =>
            item.id === id && item.fieldid === fieldid
              ? { ...item, options: [...(item.options || []), option] }
              : item
          );
        } else {
          return [...prevData, { id, fieldid, options: [option], fieldname }];
        }
      } else {
        return prevData
          .map((item) => {
            if (item.id === id && item.fieldid === fieldid) {
              const updatedOptions = item.options.filter(
                (opt) => opt !== option
              );
              return updatedOptions.length > 0
                ? { ...item, options: updatedOptions }
                : null;
            }
            return item;
          })
          .filter((item) => item !== null);
      }
    });
  };

  //handle textarea change function
  const handleTextAreaChange = (e, id, groupid, fieldname) => {
    const newValue = e.target.value;

    setTextAreaValue((prevState) => ({
      ...prevState,
      [groupid]: {
        ...prevState[groupid],
        [id]: { groupid, id, value: newValue, fieldname },
      },
    }));
  };

  const handlepdf = (formSubmissionData) => {
    return new Promise((resolve, reject) => {
      let yPosition = 10;
      const parser = new DOMParser();
      const docu = parser.parseFromString(
        formdata.formdescription,
        "text/html"
      );
      const imgTag = docu.querySelector("img");

      if (imgTag) {
        const imgURL = imgTag.src;
        const doc = new jspdf("p", "mm", "a4");
        const componentwidth = doc.internal.pageSize.getWidth();
        const componentheight = doc.internal.pageSize.getHeight();

        const image = new Image();
        image.src = imgURL;
        image.onload = function () {
          const imgWidth = 40;
          const imgHeight = (image.height / image.width) * imgWidth;

          doc.addImage(image, "JPEG", 10, yPosition, imgWidth, imgHeight);
          const textContent = docu.body.textContent || "";
          const pageWidth = componentwidth - 10;

          const fontSize = 12;
          doc.setFontSize(fontSize);

          const splitText = doc.splitTextToSize(textContent, pageWidth);

          splitText.forEach((line) => {
            if (yPosition > componentheight - 10) {
              doc.addPage();
              yPosition = 10;
            }
            doc.text(line, 10, yPosition);
            yPosition += 5;
          });

          const tableData = [];
          yPosition = 170;

          Object.entries(formSubmissionData).forEach((data) => {
            if (yPosition > componentheight - 10) {
              doc.addPage();
              yPosition = 10;
            }

            if (data[0] === "textFields") {
              Object.entries(data[1]).forEach(([fieldId, fieldData]) => {
                tableData.push([fieldData.name, fieldData.value]);
              });
            }

            if (data[0] === "Date") {
              const { fieldname, formattedDate } = data[1];
              tableData.push([fieldname, formattedDate]);
            }
          });

          groupListid.forEach((id) => {
            Object.entries(formSubmissionData).forEach((data) => {
              if (data[0] === "checkboxes" || data[0] === "otheroption") {
                data[1].forEach((checkbox) => {
                  if (checkbox.id === id.groupid) {
                    const otherOptions = [];

                    const otherData =
                      Object.entries(formSubmissionData.otheroption) || [];

                    otherData.forEach(([key, value]) => {
                      if (
                        value.groupid === id.groupid &&
                        value.id === checkbox.fieldid
                      ) {
                        otherOptions.push(value.options);
                      }
                    });

                    const combinedOptions = [
                      ...checkbox.options,
                      ...otherOptions,
                    ].join(", ");

                    tableData.push([checkbox.fieldname, combinedOptions]);
                  }
                });
              }

              if (data[0] === "textAreaValue") {
                Object.entries(data[1]).forEach(([outerKey, innerFields]) => {
                  Object.entries(innerFields).forEach(
                    ([innerKey, fieldData]) => {
                      if (fieldData.groupid === id.groupid) {
                        tableData.push([fieldData.fieldname, fieldData.value]);
                      }
                    }
                  );
                });
              }
            });
          });

          autoTable(doc, {
            head: [["Question", "Answer"]],
            body: tableData,
            startY: 180,
            styles: { overflow: "linebreak", fontSize: 12 },
            columnStyles: {
              0: { cellWidth: "auto" },
              1: { cellWidth: "auto" },
            },
          });

          const pdfBlob = doc.output("blob");
          resolve(pdfBlob);
          console.log("pdf data", pdfBlob);
        };

        image.onerror = () => {
          reject("Failed to load the image.");
        };
      } else {
        reject("No image found in the HTML content.");
      }
    });
  };

  const handleSubmit = async () => {
    setLoadingOverlay(true);
    saveStepData();
    const formSubmissionData = {
      textFields: textFieldData,
      Date: date,
      checkboxes: checkboxData,
      formid: formdata.formid,
      textAreaValue: textAreaValue,
      otheroption: option,
    };
    setsubmitdata(formSubmissionData);
    console.log("form data", formSubmissionData);

    if (validateFields()) {
      const response = await axios.post(
        "https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/submit-form",
        // "http://localhost:8000/submit-form",
        formSubmissionData
      );
      console.log("hii");
      // handledemo(formSubmissionData);
      const pdfBlob = await handlepdf(formSubmissionData);

      //sending mail on successfully submit
      if (response.statusText === "OK") {
        if (formdata.onsubmitemail !== null) {
          console.log("hii", pdfBlob);
          if (pdfBlob) {
            console.log("pdf data is:", pdfBlob);

            const formData = new FormData();
            formData.append("pdf", pdfBlob, "form-data.pdf");

            try {
              const response = await axios.post(
                "https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/send-mail",
                // "http://localhost:8000/send-mail",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
              console.log("Email sent successfully:", response.data);
            } catch (error) {
              console.error("Error sending email:", error);
            }
          } else {
            console.log("PDF generation failed, cannot proceed.");
          }
        }
      }

      //Show on successfully submit
      if (formdata.onsubmitmessage) {
        await toast.success(formdata.onsubmitmessage, {
          position: "top-center",
        });
      }

      //Redirect on successfully submit
      if (formdata.onsubmitredirect !== null) {
        window.location.href = formdata.onsubmitredirect;
      }

      // console.log("response...", response);
      setTextFieldData({});
      setCheckboxData([]);
      setoption("");
      setdate({});
      setTextAreaValue("");
      setSelectedDate(null);
    } else {
      console.log("Validation failed, cannot proceed.");
    }
    // Hide the loader
    setLoadingOverlay(false);
  };

  //save step data in textfield and checkbox
  useEffect(() => {
    const loadStepData = () => {
      const savedData = stepdata[step];
      if (savedData) {
        setTextFieldData(savedData.textFields || {});
        setCheckboxData(savedData.checkboxes || []);
      } else {
        setTextFieldData({});
        setCheckboxData([]);
      }
    };

    loadStepData();
  }, []);

  //filter for option selected as Other
  useEffect(() => {
    const filtered = checkboxData.filter((item) =>
      item.options?.includes("Other")
    );
    setFilteredData(filtered);
  }, [checkboxData]);

  const handleDateChange = (newValue, id, fieldname) => {
    if (newValue) {
      const formattedDate = dayjs(newValue).format("DD MM YYYY");
      setdate({ formattedDate, id, fieldname });
    }
    setSelectedDate(newValue);
  };

  //handle other option change function
  // const handleoptionChange = (e, id, groupid, fieldname) => {
  //   const options = e.target.value;

  //   setoption((prevOptions) => ({
  //     ...prevOptions,
  //     [id]: {
  //       ...prevOptions[id],
  //       options: options,
  //       groupid: groupid,
  //       fieldname: fieldname,
  //     },
  //   }));
  // };

  const handleoptionChange = (e, id, groupid, fieldname) => {
    const options = e.target.value;

    setoption((prevData) => [
      ...prevData.filter((item) => item.id !== id), // Remove existing entry for this id
      {
        id,
        groupid,
        options,
        fieldname,
      },
    ]);
  };

  //rendering fields
  const renderfield = (field) => {
    const render = field.fieldtype;
    switch (render) {
      case "Date":
        return (
          <Grid item xs={12} sm={6} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={field.fieldtitle}
                value={selectedDate}
                onChange={(newValue) =>
                  handleDateChange(newValue, field.fieldid, field.fieldtitle)
                }
                sx={{ width: "70%" }}
                slots={{
                  textField: (params) => (
                    <TextField
                      {...params}
                      error={Boolean(errors[field.fieldid])} // Show error if validation fails
                      helperText={errors[field.fieldid]} // Display the error message
                    />
                  ),
                }}
              />
            </LocalizationProvider>
            {field.isrequired ? (
              <span
                style={{
                  color: "red",
                  marginLeft: "10px",
                  fontSize: "1.5em",
                }}
              >
                *
              </span>
            ) : (
              ""
            )}
          </Grid>
        );
      case "TextField":
        return (
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              label={field.fieldtitle}
              variant="outlined"
              sx={{ mb: 2, width: "70%" }}
              value={textFieldData[field.fieldid]?.value || ""}
              onChange={(e) =>
                handleTextfieldChange(e, field.fieldid, field.fieldtitle)
              }
              error={Boolean(errors[field.fieldid])}
              helperText={errors[field.fieldid]}
            />
            {field.isrequired ? (
              <span
                style={{
                  color: "red",
                  marginLeft: "10px",
                  fontSize: "1.5em",
                }}
              >
                *
              </span>
            ) : (
              ""
            )}
          </Grid>
        );
      case "CheckboxGroup":
        return (
          <Box mb={2}>
            <Typography variant="body1">
              {" "}
              {field.fieldinfo}
              {field.isrequired ? (
                <span
                  style={{
                    color: "red",
                    marginLeft: "10px",
                    fontSize: "1.5em",
                  }}
                >
                  *
                </span>
              ) : (
                ""
              )}
            </Typography>
            <Grid container mt={1}>
              {field.fieldoptions?.options?.map((groupdata, idx) => (
                <Grid item xs={12} sm={4} key={idx}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checkboxData.some(
                          (data) =>
                            data.id === field.groupid &&
                            data.options.includes(groupdata) &&
                            data.fieldid === field.fieldid
                        )}
                        onChange={(e) =>
                          handleCheckBoxChange(
                            e,
                            groupdata,
                            field.groupid,
                            field.fieldid,
                            field.fieldinfo
                          )
                        }
                      />
                    }
                    label={groupdata}
                  />
                </Grid>
              ))}
            </Grid>

            {filteredData.some((item) => item.fieldid === field.fieldid) && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                  value={
                    Array.isArray(option) // Check if option is an array
                      ? option.find((item) => item.id === field.fieldid)
                          ?.options || ""
                      : ""
                  }
                  onChange={(e) =>
                    handleoptionChange(
                      e,
                      field.fieldid,
                      field.groupid,
                      field.fieldinfo
                    )
                  }
                />
              </Grid>
            )}
            {errors[field.fieldid] && (
              <Typography variant="body2" color="error">
                {errors[field.fieldid]}
              </Typography>
            )}
          </Box>
        );
      case "TextArea":
        return (
          <Grid container justifyContent="space-between" mb={2}>
            <Typography variant="body1">
              {field.fieldinfo}
              {field.isrequired ? (
                <span
                  style={{
                    color: "red",
                    marginLeft: "10px",
                    fontSize: "1.5em",
                  }}
                >
                  *
                </span>
              ) : (
                ""
              )}
            </Typography>

            <Textarea
              name="Outlined"
              placeholder=""
              variant="outlined"
              sx={{
                width: "100%",
                borderColor: errors[field.fieldid] ? "red" : "", // Change border color if error
              }}
              value={textAreaValue[field.groupid]?.[field.fieldid]?.value || ""}
              maxRows={4}
              onChange={(e) =>
                handleTextAreaChange(
                  e,
                  field.fieldid,
                  field.groupid,
                  field.fieldinfo
                )
              }
            />

            {errors[field.fieldid] && (
              <Typography variant="body2" color="error">
                {errors[field.fieldid]}
              </Typography>
            )}
          </Grid>
        );
      default:
        return null;
    }
  };

  //rendering field withgroup
  const renderFieldsWithGroup = () => {
    const currentGroupTitle = groupList[currentGroupIndex];
    return (
      <Box>
        <Typography
          variant="h6"
          gutterBottom
          mt={2}
          mb={2}
          sx={{ fontWeight: "bold" }}
        >
          {currentGroupTitle}
        </Typography>
        <Grid container>
          {fielddata?.data
            ?.filter((field) => field.grouptitle === currentGroupTitle)
            .map((field) => (
              <Grid item xs={12} key={field.fieldid}>
                {renderfield(field)}
              </Grid>
            ))}
        </Grid>
      </Box>
    );
  };

  return (
    <>
      {loadingOverlay && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000, // Ensure it’s above all other content
          }}
        >
          <CircularProgress color="secondary" />
        </Box>
      )}
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <>
          <Paper
            id="field-form"
            elevation={3}
            sx={{ padding: 4, maxWidth: "800px", margin: "0 auto" }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: formdata.formdescription }}
            />
            <Box display="flex" flexDirection="row" flexWrap="wrap">
              <Grid
                container
                spacing={2}
                sx={{ justifyContent: "space-between" }}
              >
                {fielddata?.data
                  ?.filter((field) => field.grouptitle === null)
                  .map((field) => renderfield(field))}
              </Grid>
            </Box>

            {renderFieldsWithGroup()}

            <Grid
              container
              justifyContent={
                currentGroupIndex === groupList.length - 1
                  ? "space-between"
                  : "flex-end"
              }
            >
              {currentGroupIndex > 0 && (
                <Grid item>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>
                </Grid>
              )}

              <Grid item>
                {currentGroupIndex === groupList.length - 1 ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  </>
                ) : (
                  <Button variant="contained" size="large" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Grid>
            </Grid>
            <ToastContainer />
            {/* <PdfForm
              formdata={formdata}
              fielddata={fielddata}
              stepdata={stepdata}
            /> */}
          </Paper>
        </>
      )}
    </>
  );
}

export default FormLayout;
