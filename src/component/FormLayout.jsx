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
} from "@mui/material";
import avtar from "../assets/avtar.jpg";
import axios from "axios";

function FormLayout() {
  const [step, setstep] = useState(1);
  const [formdata, setformdata] = useState([]);
  const [fielddata, setfielddata] = useState([]);
  const [data, setdata] = useState();
  const [checkdata, setcheckdata] = useState();
  const [stepdata, setstepdata] = useState([]);
  const [textFieldData, setTextFieldData] = useState({});
  const [checkboxData, setCheckboxData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formresponse = await axios.get(
          "https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/form"
        );
        const fieldresponse = await axios.get(
          " https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/field"
        );

        setformdata(formresponse.data);
        setfielddata(fieldresponse.data);
      } catch (err) {
        console.log("Error:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (fielddata?.field) {
      const slicedData = fielddata.field.slice(3, 5);
      const sortedData = slicedData.sort((a, b) => a.id - b.id);

      setdata(sortedData);
    }
  }, [fielddata]);

  useEffect(() => {
    if (fielddata?.field) {
      const slicedData = fielddata.field.slice(9, 10);
      // console.log("sliceddata...", slicedData);
      setcheckdata(slicedData);
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

  const handleNext = () => {
    saveStepData();
    setstep((prevStep) => prevStep + 1);
  };

  const handlePrevious = () => {
    saveStepData();
    setstep((prevStep) => prevStep - 1);
  };

  const handleTextfieldChange = (e, fieldid) => {
    console.log("text change...", fieldid);
    setTextFieldData({
      ...textFieldData,
      [fieldid]: e.target.value,
    });
  };

  const handleCheckBoxChange = (e, option, id, fieldid) => {
    console.log("id...", fieldid);
    setCheckboxData((prevData) => {
      if (e.target.checked) {
        return [...prevData, { id, option, fieldid }];
      } else {
        return prevData.filter(
          (item) => !(item.id === id && item.option === option)
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
    const response = await axios.post(
      "https://c3yl8he1e1.execute-api.us-west-2.amazonaws.com/dev/submit-form",
      formSubmissionData
    );
    console.log("Form data is:...", formSubmissionData);
    console.log("response...", response);
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

  return (
    <Paper
      elevation={3}
      sx={{ padding: 4, maxWidth: "800px", margin: "0 auto" }}
    >
      {step === 1 && (
        <>
          <Box mb={4} alignItems="center">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <Box
                  component="img"
                  src={avtar}
                  alt="Department Logo"
                  sx={{ width: "100%", height: "auto" }}
                />
              </Grid>

              <Grid item xs={12} sm={9}>
                <Typography variant="h6" align="center">
                  {formdata.formdescription?.description[0]}
                </Typography>
                <Typography variant="subtitle1" align="center">
                  {formdata.formdescription?.description[1]}
                </Typography>
                <Typography variant="subtitle2" align="center">
                  {formdata.formdescription?.description[2]}
                </Typography>
                <Typography variant="body2" align="center">
                  {formdata.formdescription?.description[3]}
                </Typography>
              </Grid>
            </Grid>
            <Typography variant="h5" mt={2} align="center">
              {formdata.formtitle}
            </Typography>
            <Typography variant="body1" align="center">
              {formdata.formdescription?.description[4]}
            </Typography>
            <Typography variant="subtitle2" mt={2}>
              {formdata.formdescription?.description[5]}
            </Typography>
            <Typography variant="subtitle2" mt={2}>
              {formdata.formdescription?.description[6]}
            </Typography>
          </Box>

          <Box mb={4}>
            <Grid container justifyContent="space-between">
              <Grid item xs={12} sm={4}>
                {fielddata.field?.slice(0, 2).map((data) => (
                  <TextField
                    fullWidth
                    label={data.fieldtitle}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    value={textFieldData[data.fieldid] || ""}
                    onChange={(e) => handleTextfieldChange(e, data.fieldid)}
                  />
                ))}
              </Grid>

              <Grid item xs={12} sm={4}>
                {fielddata.field?.slice(2, 3).map((data) => (
                  <TextField
                    fullWidth
                    label={data.fieldtitle}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    value={textFieldData[data.fieldid] || ""}
                    onChange={(e) => handleTextfieldChange(e, data.fieldid)}
                  />
                ))}
                {fielddata.field?.slice(10, 11).map((data) => (
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={textFieldData[data.fieldid] || ""}
                    onChange={(e) => handleTextfieldChange(e, data.fieldid)}
                  />
                ))}
              </Grid>
            </Grid>
          </Box>

          <Box mb={4} mt={4}>
            {fielddata.group?.slice(0, 1).map((data) => (
              <Typography variant="h6" key={data.groupid}>
                {data.grouptitle}
              </Typography>
            ))}
            {data?.map((item, index) => (
              <React.Fragment key={index}>
                <Typography variant="body1"> {item.fieldinfo}</Typography>
                <Grid container mt={1}>
                  {item.fieldoptions?.options?.map((groupdata, idx) => (
                    <Grid item xs={12} sm={4} key={idx}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checkboxData.some(
                              (data) =>
                                data.id === item.groupid &&
                                data.option === groupdata
                            )}
                            onChange={(e) =>
                              handleCheckBoxChange(
                                e,
                                groupdata,
                                item.groupid,
                                item.fieldid
                              )
                            }
                          />
                        }
                        label={groupdata}
                      />
                    </Grid>
                  ))}
                </Grid>
              </React.Fragment>
            ))}
          </Box>

          <Box mb={4}>
            {fielddata.field?.slice(5, 7).map((data) => (
              <>
                <Typography variant="body1" key={data.fieldid}>
                  {data.fieldinfo}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={textFieldData[data.fieldid] || ""}
                  onChange={(e) => handleTextfieldChange(e, data.fieldid)}
                />
              </>
            ))}
          </Box>
        </>
      )}

      {step === 2 && (
        <>
          <Box mb={4}>
            {fielddata.group?.slice(1, 2).map((data) => (
              <Typography variant="h6" key={data.groupid}>
                {data.grouptitle}
              </Typography>
            ))}
            {checkdata.map((item, index) => (
              <React.Fragment>
                <Typography variant="body1" key={index}>
                  {item.fieldinfo}
                </Typography>

                <Grid container>
                  {item.fieldoptions?.options?.map((option, idx) => (
                    <Grid item xs={12} sm={4} md={4} key={idx}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checkboxData.some(
                              (data) =>
                                data.id === item.groupid &&
                                data.option === option
                            )}
                            onChange={(e) =>
                              handleCheckBoxChange(
                                e,
                                option,
                                item.groupid,
                                item.fieldid
                              )
                            }
                          />
                        }
                        label={option}
                      />
                    </Grid>
                  ))}
                </Grid>

                <TextField
                  fullWidth
                  multiline
                  rows={1}
                  value={textFieldData[item.fieldid] || ""}
                  onChange={(e) => handleTextfieldChange(e, item.fieldid)}
                />
              </React.Fragment>
            ))}
          </Box>

          <Box mb={4}>
            {fielddata?.field.slice(7, 9).map((data) => (
              <>
                <Typography variant="body1" key={data.fieldid}>
                  {data.fieldinfo}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={textFieldData[data.fieldid] || ""}
                  onChange={(e) => handleTextfieldChange(e, data.fieldid)}
                />
              </>
            ))}
          </Box>
        </>
      )}

      <Box mb={4}>
        <Grid container justifyContent="space-between">
          <Grid item xs={12} sm={1}>
            <Button
              variant="contained"
              size="large"
              onClick={handlePrevious}
              disabled={step === 1}
            >
              Previous
            </Button>
          </Grid>
          <Grid item xs={12} sm={1}>
            <Button
              variant="contained"
              size="large"
              onClick={handleNext}
              disabled={step === 2}
            >
              Next
            </Button>
          </Grid>
        </Grid>
        {step === 2 && (
          <Grid item xs={12} sm={4} align="center" mt={5}>
            <Button variant="contained" size="large" onClick={handleSubmit}>
              Submit
            </Button>
          </Grid>
        )}
      </Box>
    </Paper>
  );
}

export default FormLayout;
