import { useRoutes, useLocation } from "react-router-dom";
import routes from "./routes";
import GlobalLoader from "./components/GlobalLoader";

import "antd/dist/reset.css";

const App = () => {
  const location = useLocation();
  const element  = useRoutes(routes);

  return (
    <>
      <GlobalLoader />
      <div key={location.pathname} className="page-enter">
        {element}
      </div>
    </>
  );
};

export default App;
