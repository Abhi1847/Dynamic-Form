import "./assets/style.css";
import FormLayout from "./component/FormLayout";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/form/:Name" element={<FormLayout />} />

        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
