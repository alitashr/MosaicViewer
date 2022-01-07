import "./index.scss";
import MainPage from "./Components/MainPage";
import { HashRouter as Router, Switch, Route, Routes } from "react-router-dom";
import FileInputPage from "./Components/FileInputPage";
import { useMount } from "react-use";
import { Suspense } from "react";
import { getFromSessionStorage } from "./Utils/utils";

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
  useMount(()=>{
    const mode = getFromSessionStorage("mode");


  });
  const PageTorender = ()=>{
    const mode = getFromSessionStorage("mode");
    const connectionid = getFromSessionStorage("connectionid")||'';
    
    if(mode && mode.toLowerCase()==='input'){
      return (
        <Suspense fallback={<></>}>
          <FileInputPage connectionid={connectionid} />
        </Suspense>
      );
    }
    else{
      return (
        <Suspense fallback={<></>}>
          <MainPage />
        </Suspense>
      );
    }
  }

  return (
    <div className="App at-zoom-image-viewer">
      {PageTorender()}
      {/* <Router>
        <Routes>
          {routes.map((route, index) => {
            return <Route exact key={index} path={route.path} element={<route.component />} />;
          })}
        </Routes>
      </Router> */}
    </div>
  );
}

export default App;
