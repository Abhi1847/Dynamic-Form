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

function FormLayout() {
  const [step, setstep] = useState(1);
  const [formdata, setformdata] = useState([]);
  const [fielddata, setfielddata] = useState([]);
  const [data, setdata] = useState();
  const [groupList, setgroupList] = useState([]);
  const [checkdata, setcheckdata] = useState();
  const [filteredData, setFilteredData] = useState([]);
  const [stepdata, setstepdata] = useState([]);
  const [textFieldData, setTextFieldData] = useState({});
  const [checkboxData, setCheckboxData] = useState([]);
  const [loading, setloading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setloading(true);
        const formresponse = await axios.get("https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/form");
        const fieldresponse = await axios.get("https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/field");

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
    fielddata.field?.slice(0, 3).forEach((data) => {
      if (
        !textFieldData[data.fieldid] ||
        textFieldData[data.fieldid].trim() === ""
      ) {
        newErrors[data.fieldid] = true;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };

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

  const handlePrevious = () => {
    saveStepData();
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex((prevIndex) => prevIndex - 1); 
    }
  };

  const handleTextfieldChange = (e, fieldid) => {
    console.log("text change...", fieldid);
    setTextFieldData({
      ...textFieldData,
      [fieldid]: e.target.value,
    });
    setErrors({ ...errors, [fieldid]: false });
  };

  const handleCheckBoxChange = (e, option, id, fieldid) => {
    setCheckboxData((prevData) => {
      if (e.target.checked) {
        return [...prevData, { id, option, fieldid }];
      } else {
        return prevData.filter(
          (item) =>
            !(
              item.id === id &&
              item.option === option &&
              item.fieldid === fieldid
            )
        );
      }
    });
  };

  const handleSubmit = async () => {
    const formSubmissionData = {
      textFields: textFieldData,
      checkboxes: checkboxData,
      formid: formdata.formid,
    };
    // const response = await axios.post(
    //   "http://localhost:3000/submit-form",
    //   formSubmissionData
    // );
    console.log("response...", formSubmissionData);
  };

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

  useEffect(() => {
    const filtered = checkboxData.filter((item) => item.option === "Other");
    setFilteredData(filtered);
  }, [checkboxData]);

  const renderfield = (field) => {
    const render = field.fieldtype;
    switch (render) {
      case "Date":
        return (
          <Grid item xs={12} sm={6} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker label={field.fieldtitle} sx={{ width: "70%" }} />
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
                // console.log("options===", groupdata)
                <Grid item xs={12} sm={4} key={idx}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checkboxData.some(
                          (data) =>
                            data.id === field.groupid &&
                            data.option === groupdata &&
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
              // if(filteredData.fieldid === field.fieldid ){
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                  value={textFieldData[field.fieldid] || ""}
                  onChange={(e) => handleTextfieldChange(e, field.fieldid)}
                  // disabled="true"
                />
              </Grid>
            )}
          </Box>
        );
      case "TextArea":
        return (
          <Grid container justifyContent="space-between" mb={2}>
            <Typography variant="body1">{field.fieldinfo}</Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              // value={textFieldData[data.fieldid] || ""}
              // onChange={(e) => handleTextfieldChange(e, data.fieldid)}
            />
          </Grid>
        );
      default:
        return null;
    }
  };

  const renderFieldsWithGroup = () => {
    // const renderedGroups = new Set();
    const currentGroupTitle = groupList[currentGroupIndex];

    // return fielddata?.data?.map((field) => {
    //   const groupid = field.groupid;
    //   const grouptitle = field.grouptitle;

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
        {/* {renderGroupTitle(groupid, grouptitle, renderedGroups)}
          {renderfield(field)} */}
        <Grid container>
          {/* Render fields based on the current group */}

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
