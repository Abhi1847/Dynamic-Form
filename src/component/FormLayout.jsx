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
import avtar from "../assets/countryofmarin.png";
import axios from "axios";
import "../assets/style.css";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

function FormLayout() {
  const [step, setstep] = useState(1);
  const [formdata, setformdata] = useState([]);
  const [fielddata, setfielddata] = useState([]);
  const [date, setdate] = useState({});
  const [groupList, setgroupList] = useState([]);
  // const [checkdata, setcheckdata] = useState();
  const [filteredData, setFilteredData] = useState([]);
  const [stepdata, setstepdata] = useState([]);
  const [textFieldData, setTextFieldData] = useState({});
  const [checkboxData, setCheckboxData] = useState([]);
  const [loading, setloading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const { Name } = useParams();
  const [textAreaValue, setTextAreaValue] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [option, setoption] = useState("");
  console.log("parameter", Name);
  //form useeffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setloading(true);

        const formresponse = await axios.get(
          `https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/form/${Name}`
          // `http://localhost:8000/form/${Name}`,
        );
        const fieldresponse = await axios.get(
          `https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/field/${Name}`
          // `http://localhost:8000/field/${Name}`,
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

  //save step data
  const saveStepData = () => {
    const currentStepData = {
      textFields: textFieldData,
      checkboxes: checkboxData,
    };

    setstepdata((prevData) => ({
      ...prevData,
      [step]: currentStepData,
    }));
  };

  const validateFields = () => {
    const newErrors = {};

    fielddata.field?.forEach((data) => {
      console.log(
        "validate...",
        data.isrequire,
        !textFieldData[data.fieldid] ||
          textFieldData[data.fieldid].trim() === ""
      );
      if (
        data.isrequire &&
        (!textFieldData[data.fieldid] ||
          textFieldData[data.fieldid].trim() === "")
      ) {
        newErrors[data.fieldid] = `${data.fieldinfo} is required`;
      }
    });

    fielddata.field?.forEach((data) => {
      if (data.fieldtype === "CheckboxGroup" && data.isRequired) {
        const checkboxEntry = checkboxData.find(
          (item) => item.fieldid === data.fieldid
        );
        if (
          !checkboxEntry ||
          (checkboxEntry.options && checkboxEntry.options.length === 0)
        ) {
          newErrors[
            data.fieldid
          ] = `${data.fieldtitle} requires at least one selection`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //handle next button function
  const handleNext = () => {
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
  const handleTextfieldChange = (e, fieldid) => {
    setTextFieldData({
      ...textFieldData,
      [fieldid]: e.target.value,
    });
    setErrors({ ...errors, [fieldid]: false });
  };

  //handle checkbox change function
  const handleCheckBoxChange = (e, option, id, fieldid) => {
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
          return [...prevData, { id, fieldid, options: [option] }];
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
  const handleTextAreaChange = (e, id, groupid) => {
    const newValue = e.target.value;

    setTextAreaValue((prevState) => ({
      ...prevState,
      [groupid]: {
        ...prevState[groupid],
        [id]: { groupid, id, value: newValue },
      },
    }));
  };

  //handle form submit function
  const handleSubmit = async () => {
    const formSubmissionData = {
      textFields: textFieldData,
      checkboxes: checkboxData,
      formid: formdata.formid,
      Date: date,
      textAreaValue: textAreaValue,
      otheroption: option,
    };
    // const response = await axios.post(
    //   "http://localhost:8000/submit-form",
    //   formSubmissionData
    // );
    console.log("response...", formSubmissionData);
    setTextFieldData({});
    setCheckboxData([]);
    setoption("");
    setdate({});
    setTextAreaValue({});
    setSelectedDate(null);
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

  const handleDateChange = (newValue, id) => {
    if (newValue) {
      const formattedDate = dayjs(newValue).format("DD MM YYYY");
      setdate({ formattedDate, id });
    }
    setSelectedDate(newValue);
  };

  //handle other option change function
  const handleoptionChange = (e, id, groupid) => {
    const options = e.target.value;

    setoption((prevOptions) => ({
      ...prevOptions,
      [id]: {
        ...prevOptions[id],
        options: options,
        groupid: groupid,
      },
    }));
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
                  handleDateChange(newValue, field.fieldid)
                }
                sx={{ width: "70%" }}
              />
            </LocalizationProvider>
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
              value={textFieldData[field.fieldid] || ""}
              onChange={(e) => handleTextfieldChange(e, field.fieldid)}
            />
          </Grid>
        );
      case "CheckboxGroup":
        return (
          <Box mb={2}>
            <Typography variant="body1"> {field.fieldinfo}</Typography>
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
                            field.fieldid
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
                  value={option[field.fieldid]?.options || ""}
                  onChange={(e) =>
                    handleoptionChange(e, field.fieldid, field.groupid)
                  }
                />
              </Grid>
            )}
          </Box>
        );
      case "TextArea":
        return (
          <Grid container justifyContent="space-between" mb={2}>
            <Typography variant="body1">{field.fieldinfo}</Typography>

            <Textarea
              name="Outlined"
              placeholder=""
              variant="outlined"
              sx={{ width: "100%" }}
              // maxRows={4}
              value={textAreaValue[field.groupid]?.[field.fieldid]?.value || ""}
              rows={4}
              onChange={(e) =>
                handleTextAreaChange(e, field.fieldid, field.groupid)
              }
            />
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
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button variant="contained" size="large" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
}

export default FormLayout;
