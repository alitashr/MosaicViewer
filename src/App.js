import "./index.scss";
import MainPage from "./Components/MainPage";
import { BrowserRouter as Router, Switch, Route, Routes } from "react-router-dom";
import FileInputPage from "./Components/FileInputPage";

const routes = [
  {
    path: "/",
    name: "Main Page",
    component: MainPage,
  },
  {
    path: "/input",
    name: "Input Page",
    component: FileInputPage,
  },
];
function App() {


  return (
    <div className="App at-zoom-image-viewer">
      <Router>
        <Routes>
          {routes.map((route, index) => {
            return <Route key={index} path={route.path} element={<route.component />} />;
          })}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
